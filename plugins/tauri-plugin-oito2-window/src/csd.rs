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

use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime, WebviewWindow};

/// How the window frame is drawn.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum DecorationMode {
    /// The system title bar and frame.
    Native,
    /// No system frame at all: the app draws the title bar and its own resize
    /// handles.
    Undecorated,
    /// GTK client-side decorations with an empty title bar: GTK keeps the
    /// window shadow and resize edges, the app draws the title bar. Falls back
    /// to [`DecorationMode::Undecorated`] outside Linux.
    GtkHeaderless,
}

impl DecorationMode {
    /// The mode used when none is requested: GTK client-side decorations on
    /// Linux, the native frame on macOS, no system frame elsewhere.
    pub fn platform_default() -> Self {
        if cfg!(target_os = "linux") {
            Self::GtkHeaderless
        } else if cfg!(target_os = "macos") {
            Self::Native
        } else {
            Self::Undecorated
        }
    }
}

impl DecorationMode {
    /// The name accepted by [`FromStr`]: `native`, `undecorated` or
    /// `gtk-headerless`.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Native => "native",
            Self::Undecorated => "undecorated",
            Self::GtkHeaderless => "gtk-headerless",
        }
    }
}

impl FromStr for DecorationMode {
    type Err = crate::Error;

    /// Parses `native`, `undecorated` or `gtk-headerless` (case-insensitive).
    fn from_str(value: &str) -> crate::Result<Self> {
        match value.trim().to_ascii_lowercase().as_str() {
            "native" => Ok(Self::Native),
            "undecorated" => Ok(Self::Undecorated),
            "gtk-headerless" | "gtkheaderless" => Ok(Self::GtkHeaderless),
            other => Err(crate::Error::Unsupported(format!(
                "decoration mode `{other}`"
            ))),
        }
    }
}

/// Applies `mode` to `window` and records it. Must run on the main thread. On
/// Linux the window must still be hidden, so GTK can switch its frame before
/// it is realized: a visible window is rejected with an `Unsupported` error.
pub fn apply_decoration_mode<R: Runtime>(
    window: &WebviewWindow<R>,
    mode: DecorationMode,
) -> crate::Result<()> {
    #[cfg(target_os = "linux")]
    if window.is_visible()? {
        return Err(crate::Error::Unsupported("window already visible".into()));
    }
    match mode {
        DecorationMode::Native => apply_native(window)?,
        DecorationMode::Undecorated => window.set_decorations(false)?,
        DecorationMode::GtkHeaderless => apply_gtk_headerless(window)?,
    }
    if let Some(state) = window.try_state::<DecorationState>() {
        state.record(window.label(), mode);
    }
    Ok(())
}

/// The decoration mode applied to each window, by label, so the webview can ask which
/// frame it has.
#[derive(Debug, Default)]
pub struct DecorationState(Mutex<HashMap<String, DecorationMode>>);

impl DecorationState {
    /// Records that the window `label` uses `mode`.
    pub fn record(&self, label: &str, mode: DecorationMode) {
        if let Ok(mut modes) = self.0.lock() {
            modes.insert(label.to_owned(), mode);
        }
    }

    /// Returns the mode recorded for the window `label`, if any.
    pub fn get(&self, label: &str) -> Option<DecorationMode> {
        self.0
            .lock()
            .ok()
            .and_then(|modes| modes.get(label).copied())
    }

    /// Drops the mode recorded for the window `label`, once the window is destroyed.
    pub fn forget(&self, label: &str) {
        if let Ok(mut modes) = self.0.lock() {
            modes.remove(label);
        }
    }
}

/// Restores the system frame: removes the client-side title bar a previous
/// [`DecorationMode::GtkHeaderless`] set, then turns the decorations back on.
#[cfg(target_os = "linux")]
fn apply_native<R: Runtime>(window: &WebviewWindow<R>) -> crate::Result<()> {
    use gtk::prelude::*;

    window.gtk_window()?.set_titlebar(None::<&gtk::Widget>);
    window.set_decorations(true)?;
    Ok(())
}

#[cfg(not(target_os = "linux"))]
fn apply_native<R: Runtime>(window: &WebviewWindow<R>) -> crate::Result<()> {
    window.set_decorations(true)?;
    Ok(())
}

/// Sets an empty, hidden title bar on the GTK window. The window is marked
/// decorated first, since GTK draws the client-side shadow and resize edges
/// only on a decorated window.
#[cfg(target_os = "linux")]
fn apply_gtk_headerless<R: Runtime>(window: &WebviewWindow<R>) -> crate::Result<()> {
    use gtk::prelude::*;

    let gtk_window = window.gtk_window()?;
    gtk_window.set_decorated(true);
    let titlebar = gtk::Box::new(gtk::Orientation::Horizontal, 0);
    titlebar.set_no_show_all(true);
    titlebar.hide();
    gtk_window.set_titlebar(Some(&titlebar));
    Ok(())
}

/// Outside Linux there is no GTK frame to keep: the window loses its system
/// frame instead.
#[cfg(not(target_os = "linux"))]
fn apply_gtk_headerless<R: Runtime>(window: &WebviewWindow<R>) -> crate::Result<()> {
    window.set_decorations(false)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_every_mode() {
        assert_eq!(
            "native".parse::<DecorationMode>().unwrap(),
            DecorationMode::Native
        );
        assert_eq!(
            " Undecorated ".parse::<DecorationMode>().unwrap(),
            DecorationMode::Undecorated
        );
        assert_eq!(
            "gtk-headerless".parse::<DecorationMode>().unwrap(),
            DecorationMode::GtkHeaderless
        );
    }

    #[test]
    fn names_round_trip() {
        for mode in [
            DecorationMode::Native,
            DecorationMode::Undecorated,
            DecorationMode::GtkHeaderless,
        ] {
            assert_eq!(mode.as_str().parse::<DecorationMode>().unwrap(), mode);
        }
    }

    #[test]
    fn rejects_unknown_modes() {
        assert!("frameless".parse::<DecorationMode>().is_err());
    }

    #[test]
    fn serializes_as_the_parsed_names() {
        for mode in [
            DecorationMode::Native,
            DecorationMode::Undecorated,
            DecorationMode::GtkHeaderless,
        ] {
            let json = serde_json::to_string(&mode).unwrap();
            assert_eq!(json, format!("\"{}\"", mode.as_str()));
        }
    }

    #[test]
    fn records_modes_by_window() {
        let state = DecorationState::default();
        assert_eq!(state.get("main"), None);
        state.record("main", DecorationMode::GtkHeaderless);
        assert_eq!(state.get("main"), Some(DecorationMode::GtkHeaderless));
    }

    #[test]
    fn forgets_a_window() {
        let state = DecorationState::default();
        state.record("main", DecorationMode::Native);
        state.record("settings", DecorationMode::Undecorated);
        state.forget("main");
        assert_eq!(state.get("main"), None);
        assert_eq!(state.get("settings"), Some(DecorationMode::Undecorated));
        state.forget("missing");
        assert_eq!(state.get("settings"), Some(DecorationMode::Undecorated));
    }

    #[test]
    fn defaults_per_platform() {
        let expected = if cfg!(target_os = "linux") {
            DecorationMode::GtkHeaderless
        } else if cfg!(target_os = "macos") {
            DecorationMode::Native
        } else {
            DecorationMode::Undecorated
        };
        assert_eq!(DecorationMode::platform_default(), expected);
    }
}
