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

//! System integration for `@oito2/ui`: desktop environment detection, window
//! button layout, accent color and high contrast. The readers and their
//! commands are added in phase F6; this crate only registers the plugin.

use tauri::{
    Runtime,
    plugin::{Builder, TauriPlugin},
};

mod error;

pub use error::{Error, Result};

/// Builds the `oito2-settings` plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("oito2-settings").build()
}
