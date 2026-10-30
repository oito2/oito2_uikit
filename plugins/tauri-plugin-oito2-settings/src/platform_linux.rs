// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

//! Linux sources: GSettings, the XDG desktop portal and the configuration files, and the
//! watchers that report their changes. Everything goes through GIO.

use std::cell::RefCell;
use std::time::Duration;

use gtk::gio;
use gtk::gio::prelude::*;
use gtk::glib;

use crate::raw::{GSETTINGS_KEYS, RawSettings, SettingValue};

const PORTAL_BUS_NAME: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const PORTAL_SETTINGS: &str = "org.freedesktop.portal.Settings";
const APPEARANCE: &str = "org.freedesktop.appearance";
/// How long a portal call may take, in milliseconds.
const PORTAL_TIMEOUT: i32 = 500;

/// Reads the GSettings keys whose schema and key are installed, by `schema/key`.
fn read_gsettings(raw: &mut RawSettings) {
    let Some(source) = gio::SettingsSchemaSource::default() else {
        return;
    };
    for (schema_id, key) in GSETTINGS_KEYS {
        // GIO aborts the process on an unknown schema or key, so both are checked first.
        let Some(schema) = source.lookup(schema_id, true) else {
            continue;
        };
        if !schema.has_key(key) {
            continue;
        }
        let value = gio::Settings::new(schema_id).value(key);
        let value = if let Some(text) = value.str() {
            SettingValue::Text(text.to_owned())
        } else if let Some(flag) = value.get::<bool>() {
            SettingValue::Flag(flag)
        } else {
            continue;
        };
        raw.gsettings.insert(format!("{schema_id}/{key}"), value);
    }
}

/// Reads an `org.freedesktop.appearance` key from the desktop portal, unwrapping the
/// variant it comes in. Falls back to the older `Read` method.
fn read_portal(connection: &gio::DBusConnection, key: &str) -> Option<glib::Variant> {
    for method in ["ReadOne", "Read"] {
        let reply = connection.call_sync(
            Some(PORTAL_BUS_NAME),
            PORTAL_PATH,
            PORTAL_SETTINGS,
            method,
            Some(&(APPEARANCE, key).to_variant()),
            None,
            gio::DBusCallFlags::NONE,
            PORTAL_TIMEOUT,
            None::<&gio::Cancellable>,
        );
        let Ok(reply) = reply else { continue };
        // `ReadOne` answers `(v)`; `Read` answers `(v)` holding another `v`.
        let mut value = reply.try_child_value(0)?;
        while let Some(inner) = value.as_variant() {
            value = inner;
        }
        return Some(value);
    }
    None
}

/// Reads the accent color and the contrast preference from the desktop portal.
fn read_portal_appearance(raw: &mut RawSettings) {
    let Ok(connection) = gio::bus_get_sync(gio::BusType::Session, None::<&gio::Cancellable>) else {
        return;
    };
    if let Some(accent) = read_portal(&connection, "accent-color")
        && let Some((red, green, blue)) = accent.get::<(f64, f64, f64)>()
    {
        raw.system_accent = crate::color::rgb_hex(red, green, blue);
    }
    if let Some(contrast) = read_portal(&connection, "contrast") {
        raw.system_high_contrast = contrast.get::<u32>() == Some(1);
    }
}

/// Reads every Linux source into a `RawSettings`.
pub fn read() -> RawSettings {
    let mut raw = RawSettings {
        xdg_current_desktop: std::env::var("XDG_CURRENT_DESKTOP").ok(),
        desktop_session: std::env::var("DESKTOP_SESSION").ok(),
        ..Default::default()
    };
    read_gsettings(&mut raw);
    if let Some(home) = crate::config::config_home(
        std::env::var("XDG_CONFIG_HOME").ok().as_deref(),
        std::env::var("HOME").ok().as_deref(),
    ) {
        raw.config = crate::config::read_config(&home);
    }
    read_portal_appearance(&mut raw);
    raw
}

/// The objects that report changes; they live on the main thread until the app exits.
struct Watchers {
    _settings: Vec<gio::Settings>,
    _monitors: Vec<gio::FileMonitor>,
    _portal: Option<(gio::DBusConnection, gio::SignalSubscriptionId)>,
}

thread_local! {
    static WATCHERS: RefCell<Option<Watchers>> = const { RefCell::new(None) };
    static PENDING: RefCell<Option<glib::SourceId>> = const { RefCell::new(None) };
}

/// Calls `changed` 150 ms after the last of a burst of changes.
fn debounce(changed: &std::rc::Rc<dyn Fn()>) {
    PENDING.with(|pending| {
        if let Some(source) = pending.borrow_mut().take() {
            source.remove();
        }
        let callback = changed.clone();
        let source = glib::timeout_add_local_once(Duration::from_millis(150), move || {
            PENDING.with(|pending| pending.borrow_mut().take());
            callback();
        });
        *pending.borrow_mut() = Some(source);
    });
}

/// Watches the configuration files under `home`, calling `changed` (debounced) when one
/// of them is written, created, deleted or replaced. Directories that don't exist are
/// skipped. The monitors stop when dropped.
fn watch_files(home: &std::path::Path, changed: &std::rc::Rc<dyn Fn()>) -> Vec<gio::FileMonitor> {
    let mut monitors = Vec::new();
    for (directory, names) in crate::config::watched_files(home) {
        if !directory.is_dir() {
            continue;
        }
        let Ok(monitor) = gio::File::for_path(&directory).monitor_directory(
            gio::FileMonitorFlags::WATCH_MOVES,
            None::<&gio::Cancellable>,
        ) else {
            continue;
        };
        let callback = changed.clone();
        // Matches writes in place and atomic replacements renamed onto the file.
        monitor.connect_changed(move |_, file, other, _| {
            let touches = |file: Option<&gio::File>| {
                file.and_then(|file| file.basename())
                    .is_some_and(|name| names.iter().any(|n| name.as_os_str() == n.as_str()))
            };
            if touches(Some(file)) || touches(other) {
                debounce(&callback);
            }
        });
        monitors.push(monitor);
    }
    monitors
}

/// Starts watching GSettings, the portal and the configuration files, calling `changed`
/// after each burst of changes. Must run on the main thread, whose GLib loop delivers the
/// change signals.
pub fn watch(changed: impl Fn() + 'static) {
    let changed: std::rc::Rc<dyn Fn()> = std::rc::Rc::new(changed);

    let mut settings = Vec::new();
    if let Some(source) = gio::SettingsSchemaSource::default() {
        let mut schemas: Vec<&str> = GSETTINGS_KEYS.iter().map(|(schema, _)| *schema).collect();
        schemas.dedup();
        for schema_id in schemas {
            if source.lookup(schema_id, true).is_none() {
                continue;
            }
            let schema = gio::Settings::new(schema_id);
            let callback = changed.clone();
            schema.connect_changed(None, move |_, _| debounce(&callback));
            settings.push(schema);
        }
    }

    let monitors = crate::config::config_home(
        std::env::var("XDG_CONFIG_HOME").ok().as_deref(),
        std::env::var("HOME").ok().as_deref(),
    )
    .map(|home| watch_files(&home, &changed))
    .unwrap_or_default();

    let portal = gio::bus_get_sync(gio::BusType::Session, None::<&gio::Cancellable>)
        .ok()
        .map(|connection| {
            let callback = changed.clone();
            let id = connection.signal_subscribe(
                Some(PORTAL_BUS_NAME),
                Some(PORTAL_SETTINGS),
                Some("SettingChanged"),
                Some(PORTAL_PATH),
                Some(APPEARANCE),
                gio::DBusSignalFlags::NONE,
                move |_, _, _, _, _, _| debounce(&callback),
            );
            (connection, id)
        });

    WATCHERS.with(|watchers| {
        *watchers.borrow_mut() = Some(Watchers {
            _settings: settings,
            _monitors: monitors,
            _portal: portal,
        });
    });
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;
    use std::rc::Rc;
    use std::time::Instant;

    use super::*;

    /// Runs the main context until `done` returns true or two seconds pass.
    fn run_until(context: &glib::MainContext, done: impl Fn() -> bool) {
        let deadline = Instant::now() + Duration::from_secs(2);
        while !done() && Instant::now() < deadline {
            context.iteration(false);
            std::thread::sleep(Duration::from_millis(5));
        }
    }

    #[test]
    fn reports_a_burst_of_file_changes_once() {
        let home = std::env::temp_dir().join(format!("oito2-watch-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&home);
        std::fs::create_dir_all(&home).unwrap();
        // The debounce timer and the monitors use the default main context, which the GTK
        // loop runs in the app; the test owns it and runs it by hand.
        let context = glib::MainContext::default();
        let _owner = context.acquire().unwrap();
        let calls = Rc::new(Cell::new(0));
        let counter = calls.clone();
        let changed: Rc<dyn Fn()> = Rc::new(move || counter.set(counter.get() + 1));
        let monitors = watch_files(&home, &changed);
        assert_eq!(monitors.len(), 1);

        // A file that doesn't matter is ignored.
        std::fs::write(home.join("other.conf"), "x").unwrap();
        run_until(&context, || false);
        assert_eq!(calls.get(), 0);

        // Several writes in a row report one change.
        std::fs::write(
            home.join("kwinrc"),
            "[org.kde.kdecoration2]\nButtonsOnLeft=X\n",
        )
        .unwrap();
        std::fs::write(home.join("kdeglobals"), "[General]\nAccentColor=1,2,3\n").unwrap();
        run_until(&context, || calls.get() > 0);
        run_until(&context, || false);
        assert_eq!(calls.get(), 1);

        // An atomic replacement counts too.
        std::fs::write(home.join("kwinrc.tmp"), "[org.kde.kdecoration2]\n").unwrap();
        std::fs::rename(home.join("kwinrc.tmp"), home.join("kwinrc")).unwrap();
        run_until(&context, || calls.get() > 1);
        assert_eq!(calls.get(), 2);
        drop(monitors);
        let _ = std::fs::remove_dir_all(home);
    }

    /// Prints what the plugin reads on this machine, for checking a desktop by hand:
    /// `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture`.
    #[test]
    #[ignore = "reads the real desktop session"]
    fn prints_the_settings_of_this_machine() {
        println!("{:#?}", read());
    }
}
