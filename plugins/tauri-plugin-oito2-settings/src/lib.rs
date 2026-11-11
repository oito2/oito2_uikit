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

//! System settings for `@oito2/ui`: the desktop session, the window button layout, the
//! accent color, the high-contrast preference and the color scheme, read from the platform
//! by `oito2_settings` and reported to the webview, which turns them into a
//! `SystemSettings`. The plugin also watches the settings and emits
//! `oito2-settings://changed` with the new values whenever they change.

use oito2_settings::SettingsWatcher;
use tauri::{
    AppHandle, Emitter, Manager, Runtime,
    plugin::{Builder, TauriPlugin},
};

mod commands;

pub use oito2_settings::{
    ColorScheme, ConfigValues, Error, RawSettings, Result, SettingValue, read_raw_settings,
};

/// The event emitted with the new `RawSettings` when a watched setting changes.
pub const CHANGED_EVENT: &str = "oito2-settings://changed";

/// Keeps the settings watcher alive while the app runs; dropping it stops the watcher.
struct Watch {
    _watcher: SettingsWatcher,
}

/// Starts watching the settings on a thread of its own, since `oito2_settings::watch`
/// reads them once before returning, and keeps the watcher in the app state. Every change
/// is emitted to the webviews as `CHANGED_EVENT`. Failures are written to stderr and leave
/// the app without change events.
fn start_watching<R: Runtime>(app: AppHandle<R>) {
    let spawned = std::thread::Builder::new()
        .name("oito2-settings-start".into())
        .spawn(move || {
            let emitter = app.clone();
            let watched = oito2_settings::watch(move |raw| {
                if let Err(error) = emitter.emit(CHANGED_EVENT, raw) {
                    eprintln!("oito2-settings: could not report a settings change: {error}");
                }
            });
            match watched {
                Ok(watcher) => {
                    app.manage(Watch { _watcher: watcher });
                }
                Err(error) => eprintln!("oito2-settings: not watching the settings: {error}"),
            }
        });
    if let Err(error) = spawned {
        eprintln!("oito2-settings: not watching the settings: {error}");
    }
}

/// Creates the plugin: the `read_settings` command, and the settings watcher started
/// when the app starts.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("oito2-settings")
        .invoke_handler(tauri::generate_handler![commands::read_settings])
        .setup(|app, _api| {
            start_watching(app.clone());
            Ok(())
        })
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serializes_for_the_webview() {
        let mut raw = RawSettings {
            xdg_current_desktop: Some("GNOME".into()),
            color_scheme: Some(ColorScheme::Dark),
            ..Default::default()
        };
        raw.gsettings.insert(
            "org.gnome.desktop.a11y.interface/high-contrast".into(),
            SettingValue::Flag(true),
        );
        raw.config.cosmic_show_minimize = Some(false);
        let json = serde_json::to_value(&raw).unwrap();
        assert_eq!(json["xdgCurrentDesktop"], "GNOME");
        assert_eq!(json["desktopSession"], serde_json::Value::Null);
        assert_eq!(
            json["gsettings"]["org.gnome.desktop.a11y.interface/high-contrast"],
            true
        );
        for key in [
            "kwinButtonsOnLeft",
            "kwinButtonsOnRight",
            "kdeAccentColor",
            "kdeColorScheme",
            "xfwmButtonLayout",
            "cosmicShowMaximize",
        ] {
            assert_eq!(json["config"][key], serde_json::Value::Null, "{key}");
        }
        assert_eq!(json["config"]["cosmicShowMinimize"], false);
        assert_eq!(json["systemAccent"], serde_json::Value::Null);
        assert_eq!(json["systemHighContrast"], false);
        assert_eq!(json["colorScheme"], "dark");
    }

    #[test]
    fn errors_reject_with_kind_and_message() {
        let json = serde_json::to_value(Error::Internal("settings reader stopped".into())).unwrap();
        assert_eq!(
            json,
            serde_json::json!({
                "kind": "internal",
                "message": "internal error: settings reader stopped"
            })
        );
        let json = serde_json::to_value(Error::Unsupported("watching".into())).unwrap();
        assert_eq!(json["kind"], "unsupported");
    }

    /// Prints what the plugin reads on this machine, for checking a desktop by hand:
    /// `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture`.
    #[test]
    #[ignore = "reads the real desktop session"]
    fn prints_the_settings_of_this_machine() {
        println!("{:#?}", read_raw_settings());
    }
}
