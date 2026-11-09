# tauri-plugin-oito2-settings

System integration for `@oito2/ui`: desktop environment detection, window button layout, accent color and high contrast.

[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

A Tauri v2 plugin that reads the system settings an oito2 app adapts to (the desktop session, the window button layout, the accent color and the high-contrast preference) and reports them to the webview as raw values. The webview side, the npm package [`@oito2/ui-settings`](https://www.npmjs.com/package/@oito2/ui-settings), turns them into the `SystemSettings` of `@oito2/ui`.

## Installation

The crate is not published on crates.io. Add it from the repository in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

It is built against `tauri` 2.12 and needs Rust 1.90 or later.

## Setup

Register the plugin in the Builder:

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oito2_settings::init())
        .run(tauri::generate_context!())
        .expect("error while running the app");
}
```

On Linux, `init()` also starts watching the settings when the app starts.

## Permissions

| Identifier                           | Allows                             |
| ------------------------------------ | ---------------------------------- |
| `oito2-settings:default`             | `allow-read-settings`              |
| `oito2-settings:allow-read-settings` | The `read_settings` command        |
| `oito2-settings:deny-read-settings`  | Denies the `read_settings` command |

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": ["core:default", "oito2-settings:default"]
}
```

`core:default` lets the webview listen to the change event.

## Command and event

| Name                       | Kind    | Payload                                                                       |
| -------------------------- | ------- | ----------------------------------------------------------------------------- |
| `read_settings`            | Command | Returns `RawSettings`; reads off the main thread                              |
| `oito2-settings://changed` | Event   | The new `RawSettings`, emitted on Linux when a watched setting really changes |

`RawSettings` is serialized in camelCase:

| Field                | Contents                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `xdgCurrentDesktop`  | `XDG_CURRENT_DESKTOP`                                                                                                                         |
| `desktopSession`     | `DESKTOP_SESSION`                                                                                                                             |
| `gsettings`          | GSettings values by `schema/key`, for the installed schemas                                                                                   |
| `config`             | `kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize` |
| `systemAccent`       | The toolkit or system accent color as `#RRGGBB`, or `null`                                                                                    |
| `systemHighContrast` | Whether the system asks for high contrast                                                                                                     |

A failed command rejects with `{ kind, message }`, where `kind` is `unsupported` or `internal` (the reader task stopped before returning).

### Rust API

| Item                                          | Purpose                                    |
| --------------------------------------------- | ------------------------------------------ |
| `init()`                                      | Creates the plugin                         |
| `read_raw_settings()`                         | Reads the settings of the running platform |
| `CHANGED_EVENT`                               | `"oito2-settings://changed"`               |
| `RawSettings`, `ConfigValues`, `SettingValue` | The reported values                        |
| `Error`, `Result`                             | The serializable error type                |

## Platform notes

| Platform | Sources                                                                                                                                                                                                                                                                                                                                                              | Change event            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Linux    | Session variables; GSettings `button-layout` (GNOME, Cinnamon, MATE/Marco), `accent-color`, `gtk-theme` and `high-contrast`; the XDG desktop portal (`org.freedesktop.appearance` accent and contrast); `kwinrc`, `kdeglobals`, Xfce's `xfwm4.xml` and the COSMIC settings under `XDG_CONFIG_HOME` (files over 1 MiB are ignored). Uses GIO through the `gtk` crate. | Yes, debounced (150 ms) |
| Windows  | Accent color and high contrast, through the Windows Runtime (`UI::ViewManagement`)                                                                                                                                                                                                                                                                                   | No                      |
| macOS    | Accent color (sRGB) and "Increase contrast", through AppKit                                                                                                                                                                                                                                                                                                          | No                      |

Inside a Flatpak or Snap sandbox, `XDG_CONFIG_HOME` points at the sandbox (`~/.var/app/<id>/config` for Flatpak), so `kwinrc`, `kdeglobals`, `xfwm4.xml` and the COSMIC files are not found; the portal and GSettings sources still work.

Where no change event is emitted, `@oito2/ui-settings` reads the settings again whenever the window regains focus.

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
