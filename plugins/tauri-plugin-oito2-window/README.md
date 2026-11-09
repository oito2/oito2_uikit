# tauri-plugin-oito2-window

Window chrome integration for `@oito2/ui`: client-side decorations and window controls on Linux, Windows and macOS.

[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

A Tauri v2 plugin that sets the frame of each window (GTK client-side decorations on Linux, no system frame on Windows, the native frame on macOS) and shows the native window menu. The webview side is the npm package [`@oito2/ui-window`](https://www.npmjs.com/package/@oito2/ui-window).

## Installation

The crate is not published on crates.io. Add it from the repository in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

It is built against `tauri` 2.12 and needs Rust 1.90 or later.

## Setup

Register the plugin and, optionally, apply the frame while the window is still hidden (configure it with `"visible": false` in `tauri.conf.json`):

```rust
use tauri::Manager;
use tauri_plugin_oito2_window::{DecorationMode, apply_decoration_mode};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oito2_window::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let mode = DecorationMode::platform_default();
                if let Err(error) = apply_decoration_mode(&window, mode) {
                    eprintln!("could not apply decoration mode {mode:?}: {error}");
                }
                window.show()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the app");
}
```

`apply_decoration_mode` must run on the main thread (as `setup` does) before the window is shown: on Linux it rejects a window that is already visible with an `Unsupported` error, since GTK switches its frame only before the window is realized. The webview can also set the frame itself through `@oito2/ui-window`'s `initWindow({ decorations })`, which calls the `set_decoration_mode` command under the same rule.

## Permissions

| Identifier                               | Allows                    |
| ---------------------------------------- | ------------------------- |
| `oito2-window:default`                   | The three `allow-*` below |
| `oito2-window:allow-set-decoration-mode` | `set_decoration_mode`     |
| `oito2-window:allow-decoration-mode`     | `decoration_mode`         |
| `oito2-window:allow-show-window-menu`    | `show_window_menu`        |

Each command also has a `deny-*` counterpart (`oito2-window:deny-set-decoration-mode`, ...). A typical capability for a window with the `@oito2/ui` title bars:

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"core:window:allow-minimize",
		"core:window:allow-toggle-maximize",
		"core:window:allow-close",
		"core:window:allow-start-dragging",
		"core:window:allow-start-resize-dragging",
		"oito2-window:default"
	]
}
```

The `core:window:*` permissions cover the minimize, maximize, close, drag and resize actions that `@oito2/ui-window` performs through `@tauri-apps/api`.

## Commands

Each command acts on the calling window.

| Command               | Arguments                                                            | Returns                                                                                                             |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `set_decoration_mode` | `mode`: `native`, `undecorated` or `gtk-headerless`                  | — once the mode is applied; rejects when it cannot be (on Linux, `unsupported` when the window is already visible)  |
| `decoration_mode`     | —                                                                    | The mode applied through the plugin, else `native` or `undecorated` from whether the window has a system frame      |
| `show_window_menu`    | `x`, `y`: CSS pixels from the top left of the webview (0 to 100 000) | — once the menu is open (on Windows, once it closes); `unsupported` on macOS or when the window manager has no menu |

Both `set_decoration_mode` and `show_window_menu` do their work on the main thread and wait for it, so the promise settles with the real outcome. A failed command rejects with `{ kind, message }`, where `kind` is `tauri`, `unsupported` or `invalidInput`. The plugin emits no events.

### Rust API

| Item                                                         | Purpose                                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `init()`                                                     | Creates the plugin                                                                      |
| `DecorationMode`                                             | `Native`, `Undecorated`, `GtkHeaderless`; `platform_default()`, `as_str()`, `FromStr`   |
| `apply_decoration_mode(&window, mode)`                       | Applies a mode to a `WebviewWindow` and records it; main thread, hidden window on Linux |
| `show_window_menu(&window, x, y)`, `window_menu_supported()` | The native window menu; `show_window_menu` must run on the main thread                  |
| `DecorationState`, `Error`, `Result`                         | Managed state (`record`, `get`, `forget`) and the serializable error type               |

## Platform notes

| Platform | Default mode     | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux    | `gtk-headerless` | GTK client-side decorations with an empty title bar: GTK keeps the window shadow and resize edges. The window must be configured with `"transparent": true`, or GTK draws its shadow and rounded corners on an opaque rectangle; the page then paints an opaque background itself, and on X11 without a compositor such a window shows black. The mode can only be applied to a hidden window. The window menu is GTK's (`gdk_window_show_window_menu`); it fails when the window manager has none. Needs the Tauri Linux build dependencies (WebKitGTK 4.1, GTK 3). |
| Windows  | `undecorated`    | No system frame; the app draws the title bar. The window menu is the system menu (Restore, Move, Size, Minimize, Maximize, Close), with items enabled for the window state.                                                                                                                                                                                                                                                                                                                                                                                          |
| macOS    | `native`         | `gtk-headerless` falls back to no system frame. No window menu. The showcase overlays the title bar with `"titleBarStyle": "Overlay"` and `"hiddenTitle": true` in `tauri.macos.conf.json`.                                                                                                                                                                                                                                                                                                                                                                          |

The `menu` module is the only part of the crate that uses `unsafe` (the GDK and Win32 calls of the window menu).

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
