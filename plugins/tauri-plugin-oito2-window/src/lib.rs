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

//! Window chrome integration for `@oito2/ui`: the frame of each window (client-side
//! decorations on Linux, no system frame on Windows, the overlaid title bar on macOS)
//! and the native window menu.

use tauri::{
    Manager, Runtime,
    plugin::{Builder, TauriPlugin},
};

mod commands;
mod csd;
mod error;
#[allow(unsafe_code)]
mod menu;

pub use csd::{DecorationMode, DecorationState, apply_decoration_mode};
pub use error::{Error, Result};
pub use menu::{show_window_menu, window_menu_supported};

/// Creates the plugin. It exposes the `set_decoration_mode`, `decoration_mode` and
/// `show_window_menu` commands to the webview.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("oito2-window")
        .invoke_handler(tauri::generate_handler![
            commands::set_decoration_mode,
            commands::decoration_mode,
            commands::show_window_menu
        ])
        .setup(|app, _api| {
            app.manage(DecorationState::default());
            Ok(())
        })
        .build()
}
