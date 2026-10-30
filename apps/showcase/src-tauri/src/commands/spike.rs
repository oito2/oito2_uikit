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

//! Debug-only commands that let the F0 platform spikes run unattended: the app
//! opens the page named by `OITO2_SPIKE`, the page sends its report back, and
//! the app prints it and exits.

use tauri::{AppHandle, Runtime};

/// Spike pages that can be requested through `OITO2_SPIKE`.
const SPIKES: &[&str] = &["baseline", "chrome"];

/// Largest report accepted from the webview, in bytes.
const MAX_REPORT_BYTES: usize = 64 * 1024;

/// Returns the spike named by `OITO2_SPIKE`, if it is a known one.
#[tauri::command]
pub fn spike_request() -> Option<String> {
    let requested = std::env::var("OITO2_SPIKE").ok()?;
    SPIKES
        .iter()
        .find(|name| **name == requested)
        .map(|name| (*name).to_owned())
}

/// Returns the decoration mode the window was started with, so the chrome
/// spike draws window controls only when the system frame doesn't.
#[tauri::command]
pub fn spike_decoration_mode() -> String {
    crate::requested_decoration_mode().as_str().to_owned()
}

/// Prints the report sent by a spike page to stdout and exits the app.
#[tauri::command]
pub fn spike_report<R: Runtime>(app: AppHandle<R>, report: String) {
    if report.len() > MAX_REPORT_BYTES {
        eprintln!("oito2: spike report rejected ({} bytes)", report.len());
    } else {
        println!("OITO2_SPIKE_REPORT {report}");
    }
    app.exit(0);
}
