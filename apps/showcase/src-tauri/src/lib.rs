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

use tauri::Manager;
use tauri_plugin_oito2_window::{DecorationMode, apply_decoration_mode};

#[cfg(debug_assertions)]
mod commands;

/// Reads the decoration mode from `OITO2_DECORATIONS` (`native`,
/// `undecorated` or `gtk-headerless`), falling back to the platform default.
pub(crate) fn requested_decoration_mode() -> DecorationMode {
    std::env::var("OITO2_DECORATIONS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or_else(DecorationMode::platform_default)
}

/// Starts the showcase app.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_oito2_window::init())
        .plugin(tauri_plugin_oito2_settings::init())
        .setup(|app| {
            // The main window starts hidden so the frame can change before it is shown.
            if let Some(window) = app.get_webview_window("main") {
                let mode = requested_decoration_mode();
                if let Err(error) = apply_decoration_mode(&window, mode) {
                    eprintln!("oito2: could not apply decoration mode {mode:?}: {error}");
                }
                window.show()?;
            }
            Ok(())
        });

    // Spike commands exist only in debug builds; release builds expose no app commands.
    #[cfg(debug_assertions)]
    let builder = builder.invoke_handler(tauri::generate_handler![
        commands::spike::spike_request,
        commands::spike::spike_decoration_mode,
        commands::spike::spike_report
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running the oito2_uikit showcase");
}
