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

use tauri::{Manager, Runtime, WebviewWindow};

use crate::{DecorationMode, DecorationState, Error, Result};

/// The largest coordinate accepted for the window menu position, in CSS pixels.
const MAX_COORDINATE: f64 = 100_000.0;

/// Applies `mode` to the calling window on the main thread. The window should still be
/// hidden, so the frame changes before the user sees it.
#[tauri::command]
pub async fn set_decoration_mode<R: Runtime>(
    window: WebviewWindow<R>,
    mode: DecorationMode,
) -> Result<()> {
    let target = window.clone();
    window.run_on_main_thread(move || {
        if let Err(error) = crate::apply_decoration_mode(&target, mode) {
            eprintln!("oito2-window: could not apply decoration mode {mode:?}: {error}");
        }
    })?;
    Ok(())
}

/// Returns the decoration mode of the calling window: the one applied through the plugin,
/// or `native` or `undecorated` from whether it has a system frame.
#[tauri::command]
pub async fn decoration_mode<R: Runtime>(window: WebviewWindow<R>) -> Result<DecorationMode> {
    if let Some(mode) = window
        .try_state::<DecorationState>()
        .and_then(|state| state.get(window.label()))
    {
        return Ok(mode);
    }
    Ok(if window.is_decorated()? {
        DecorationMode::Native
    } else {
        DecorationMode::Undecorated
    })
}

/// Shows the native window menu of the calling window at `x`, `y` (CSS pixels from the
/// top left of the webview), on Linux and Windows.
#[tauri::command]
pub async fn show_window_menu<R: Runtime>(window: WebviewWindow<R>, x: f64, y: f64) -> Result<()> {
    let (x, y) = validate_position(x, y)?;
    crate::show_window_menu(&window, x, y)
}

/// Checks that a menu position is a finite point inside a plausible window.
fn validate_position(x: f64, y: f64) -> Result<(f64, f64)> {
    let valid = |value: f64| value.is_finite() && (0.0..=MAX_COORDINATE).contains(&value);
    if valid(x) && valid(y) {
        Ok((x, y))
    } else {
        Err(Error::InvalidInput(format!("menu position ({x}, {y})")))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_positions_inside_a_window() {
        assert!(validate_position(0.0, 0.0).is_ok());
        assert!(validate_position(320.5, 23.0).is_ok());
    }

    #[test]
    fn rejects_negative_huge_or_invalid_positions() {
        assert!(validate_position(-1.0, 10.0).is_err());
        assert!(validate_position(10.0, 1e9).is_err());
        assert!(validate_position(f64::NAN, 10.0).is_err());
        assert!(validate_position(10.0, f64::INFINITY).is_err());
    }
}
