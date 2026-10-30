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
//! accent color and the high-contrast preference, read from the platform and reported to
//! the webview, which turns them into a `SystemSettings`. On Linux the plugin also watches
//! GSettings, the desktop portal and the configuration files and emits
//! `oito2-settings://changed` with the new values.

#[cfg(target_os = "linux")]
use std::sync::Mutex;

#[cfg(target_os = "linux")]
use tauri::{AppHandle, Emitter, Manager};
use tauri::{
    Runtime,
    plugin::{Builder, TauriPlugin},
};

#[cfg(any(target_os = "linux", target_os = "macos", test))]
mod color;
mod commands;
#[cfg(any(target_os = "linux", test))]
mod config;
mod error;
#[cfg(any(target_os = "linux", test))]
mod parsers;
#[cfg(target_os = "linux")]
mod platform_linux;
#[cfg(target_os = "macos")]
mod platform_macos;
#[cfg(windows)]
mod platform_windows;
mod raw;

pub use error::{Error, Result};
pub use raw::{ConfigValues, RawSettings, SettingValue};

/// The event emitted with the new `RawSettings` when a watched setting changes.
pub const CHANGED_EVENT: &str = "oito2-settings://changed";

/// Reads the settings of the running platform.
pub fn read_raw_settings() -> RawSettings {
    #[cfg(target_os = "linux")]
    return platform_linux::read();
    #[cfg(windows)]
    return platform_windows::read();
    #[cfg(target_os = "macos")]
    return platform_macos::read();
    #[cfg(not(any(target_os = "linux", windows, target_os = "macos")))]
    return RawSettings::default();
}

/// The settings last reported to the webview, to emit only real changes.
#[cfg(target_os = "linux")]
#[derive(Default)]
struct LastSettings(Mutex<Option<RawSettings>>);

/// Reads the settings on a worker thread and emits them when they differ from the last
/// ones.
#[cfg(target_os = "linux")]
fn report_change<R: Runtime>(app: AppHandle<R>) {
    std::thread::spawn(move || {
        let raw = read_raw_settings();
        let Some(last) = app.try_state::<LastSettings>() else {
            return;
        };
        let Ok(mut last) = last.0.lock() else {
            return;
        };
        if last.as_ref() == Some(&raw) {
            return;
        }
        *last = Some(raw.clone());
        if let Err(error) = app.emit(CHANGED_EVENT, raw) {
            eprintln!("oito2-settings: could not report a settings change: {error}");
        }
    });
}

/// Creates the plugin. It exposes the `read_settings` command and, on Linux, starts
/// watching the settings.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("oito2-settings")
        .invoke_handler(tauri::generate_handler![commands::read_settings])
        .setup(|_app, _api| {
            #[cfg(target_os = "linux")]
            {
                let app = _app;
                app.manage(LastSettings::default());
                let handle = app.clone();
                app.run_on_main_thread(move || {
                    let watcher = handle.clone();
                    platform_linux::watch(move || report_change(watcher.clone()));
                })?;
            }
            Ok(())
        })
        .build()
}
