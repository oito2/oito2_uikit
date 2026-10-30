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

//! The native window menu (Restore, Move, Size, Minimize, Maximize, Close and what the
//! desktop adds). Showing it needs the raw platform APIs, so this module is the only part
//! of the crate allowed to use `unsafe`, each block kept to the foreign calls.

use tauri::{Runtime, WebviewWindow};

/// Whether this platform has a native window menu the plugin can show: Linux and Windows.
pub fn window_menu_supported() -> bool {
    cfg!(any(target_os = "linux", windows))
}

/// Shows the native window menu of `window` at `x`, `y`, in CSS pixels from the top left
/// of its webview. The menu opens on the main thread after this returns; outside Linux and
/// Windows it returns an `Unsupported` error.
pub fn show_window_menu<R: Runtime>(
    window: &WebviewWindow<R>,
    x: f64,
    y: f64,
) -> crate::Result<()> {
    if !window_menu_supported() {
        return Err(crate::Error::Unsupported("window menu".into()));
    }
    let target = window.clone();
    window.run_on_main_thread(move || {
        if let Err(error) = platform::show(&target, x, y) {
            eprintln!("oito2-window: could not show the window menu: {error}");
        }
    })?;
    Ok(())
}

#[cfg(target_os = "linux")]
mod platform {
    use gtk::gdk;
    use gtk::glib::translate::{ToGlibPtr, ToGlibPtrMut};
    use gtk::prelude::*;
    use tauri::{Runtime, WebviewWindow};

    /// The secondary mouse button, which opens the menu.
    const SECONDARY_BUTTON: u32 = 3;

    /// Shows the GTK window menu through `gdk_window_show_window_menu`, with a synthetic
    /// button press at the position on the window.
    pub fn show<R: Runtime>(window: &WebviewWindow<R>, x: f64, y: f64) -> crate::Result<()> {
        let gtk_window = window.gtk_window()?;
        let gdk_window = gtk_window
            .window()
            .ok_or_else(|| crate::Error::Unsupported("window not realized".into()))?;
        let pointer = gdk_window
            .display()
            .default_seat()
            .and_then(|seat| seat.pointer())
            .ok_or_else(|| crate::Error::Unsupported("no pointer device".into()))?;
        // The webview sits inside the window; GDK wants coordinates on the whole window,
        // which includes the client-side shadow.
        let (wx, wy) = window
            .default_vbox()
            .ok()
            .and_then(|vbox| vbox.translate_coordinates(&gtk_window, x as i32, y as i32))
            .unwrap_or((x as i32, y as i32));
        let (_, origin_x, origin_y) = gdk_window.origin();

        let mut event = gdk::Event::new(gdk::EventType::ButtonPress);
        event.set_device(Some(&pointer));
        // SAFETY: `event` is a freshly created GDK_BUTTON_PRESS event, so its `button`
        // member is the active one. The window pointer is a new reference that
        // `gdk_event_free` releases when `event` drops.
        unsafe {
            let raw: *mut gdk::ffi::GdkEvent = event.to_glib_none_mut().0;
            let button = &mut (*raw).button;
            button.window = gdk_window.to_glib_full();
            button.send_event = 1;
            button.time = 0;
            button.x = f64::from(wx);
            button.y = f64::from(wy);
            button.x_root = f64::from(origin_x + wx);
            button.y_root = f64::from(origin_y + wy);
            button.button = SECONDARY_BUTTON;
        }
        if gdk_window.show_window_menu(&mut event) {
            Ok(())
        } else {
            Err(crate::Error::Unsupported(
                "the window manager has no window menu".into(),
            ))
        }
    }
}

#[cfg(windows)]
mod platform {
    use tauri::{Runtime, WebviewWindow};
    use windows::Win32::Foundation::{LPARAM, POINT, WPARAM};
    use windows::Win32::Graphics::Gdi::ClientToScreen;
    use windows::Win32::UI::WindowsAndMessaging::{
        EnableMenuItem, GetSystemMenu, MF_BYCOMMAND, MF_ENABLED, MF_GRAYED, PostMessageW, SC_CLOSE,
        SC_MAXIMIZE, SC_MINIMIZE, SC_MOVE, SC_RESTORE, SC_SIZE, TPM_RETURNCMD, TPM_RIGHTBUTTON,
        TrackPopupMenu, WM_SYSCOMMAND,
    };

    /// Shows the system menu of the window with `TrackPopupMenu` and runs the chosen
    /// command, enabling the items that fit the window state.
    pub fn show<R: Runtime>(window: &WebviewWindow<R>, x: f64, y: f64) -> crate::Result<()> {
        let hwnd = window.hwnd()?;
        let scale = window.scale_factor()?;
        let maximized = window.is_maximized()?;
        let mut point = POINT {
            x: (x * scale).round() as i32,
            y: (y * scale).round() as i32,
        };
        // SAFETY: `hwnd` is the live window this call runs for, on its own thread; the
        // menu handle belongs to it and is only used during this call.
        unsafe {
            let _ = ClientToScreen(hwnd, &mut point);
            let menu = GetSystemMenu(hwnd, false);
            if menu.is_invalid() {
                return Err(crate::Error::Unsupported("no system menu".into()));
            }
            let set = |item: u32, enabled: bool| {
                let state = if enabled { MF_ENABLED } else { MF_GRAYED };
                let _ = EnableMenuItem(menu, item, MF_BYCOMMAND | state);
            };
            set(SC_RESTORE, maximized);
            set(SC_MOVE, !maximized);
            set(SC_SIZE, !maximized);
            set(SC_MINIMIZE, true);
            set(SC_MAXIMIZE, !maximized);
            set(SC_CLOSE, true);
            let command = TrackPopupMenu(
                menu,
                TPM_RETURNCMD | TPM_RIGHTBUTTON,
                point.x,
                point.y,
                None,
                hwnd,
                None,
            );
            if command.0 != 0 {
                let _ = PostMessageW(
                    Some(hwnd),
                    WM_SYSCOMMAND,
                    WPARAM(command.0 as usize),
                    LPARAM(0),
                );
            }
        }
        Ok(())
    }
}

#[cfg(not(any(target_os = "linux", windows)))]
mod platform {
    use tauri::{Runtime, WebviewWindow};

    /// There is no window menu to show on this platform.
    pub fn show<R: Runtime>(_window: &WebviewWindow<R>, _x: f64, _y: f64) -> crate::Result<()> {
        Err(crate::Error::Unsupported("window menu".into()))
    }
}
