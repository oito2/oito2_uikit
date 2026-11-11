🌐 [Português](../../pt-br/reference/tauri-plugins.md) | **English** | 🏠 [Index](../index.md)

---

# Tauri plugins

The two Rust plugins of the repository, `tauri-plugin-oito2-window` and `tauri-plugin-oito2-settings`: their init functions, commands, permissions, events, errors and the TypeScript functions that call them. Both are built against `tauri` 2.12, need Rust 1.90 or later, and are added from the repository:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

## Table of Contents

- [tauri-plugin-oito2-window](#tauri-plugin-oito2-window)
- [tauri-plugin-oito2-settings](#tauri-plugin-oito2-settings)
- [Errors](#errors)

## tauri-plugin-oito2-window

Sets the frame of each window and shows the native window menu. Source: [`plugins/tauri-plugin-oito2-window`](../../../plugins/tauri-plugin-oito2-window).

### Init

```rust
tauri::Builder::default().plugin(tauri_plugin_oito2_window::init())
```

`init()` registers the plugin as `oito2-window` and manages a `DecorationState` (the mode applied to each window, by label). The plugin emits no events.

### Commands

Each command acts on the calling window. Invoke name: `plugin:oito2-window|<command>`.

| Command               | Arguments                                                      | Returns          | Behavior                                                                                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `set_decoration_mode` | `mode`: `"native"`, `"undecorated"` or `"gtk-headerless"`      | `null`           | Applies the mode on the main thread and resolves once it is applied. Call it while the window is hidden: on Linux it rejects with `unsupported: window already visible` otherwise, and with any other error while applying                                                         |
| `decoration_mode`     | —                                                              | `DecorationMode` | The mode applied through the plugin; otherwise `native` or `undecorated`, from whether the window has a system frame                                                                                                                                                               |
| `show_window_menu`    | `x`, `y`: numbers, CSS pixels from the top left of the webview | `null`           | Shows the native window menu on the main thread and resolves once it is shown. Rejects with `invalidInput` unless both are finite and between 0 and 100 000; `unsupported` on macOS, when the window manager has no window menu (Linux) or the window has no system menu (Windows) |

### Permissions

| Identifier                               | Description                                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oito2-window:default`                   | Default set: `allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu` — "Lets the window set its own frame, read it and show its native window menu." |
| `oito2-window:allow-set-decoration-mode` | Enables the `set_decoration_mode` command                                                                                                                                   |
| `oito2-window:deny-set-decoration-mode`  | Denies the `set_decoration_mode` command                                                                                                                                    |
| `oito2-window:allow-decoration-mode`     | Enables the `decoration_mode` command                                                                                                                                       |
| `oito2-window:deny-decoration-mode`      | Denies the `decoration_mode` command                                                                                                                                        |
| `oito2-window:allow-show-window-menu`    | Enables the `show_window_menu` command                                                                                                                                      |
| `oito2-window:deny-show-window-menu`     | Denies the `show_window_menu` command                                                                                                                                       |

None has a scope. The generated reference is [`permissions/autogenerated/reference.md`](../../../plugins/tauri-plugin-oito2-window/permissions/autogenerated/reference.md). The window actions of the title bars go through `@tauri-apps/api` and need core permissions as well: `core:window:allow-minimize`, `core:window:allow-toggle-maximize`, `core:window:allow-close`, `core:window:allow-start-dragging` and `core:window:allow-start-resize-dragging`.

### Rust API

| Item                                         | Purpose                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init()`                                     | Creates the plugin                                                                                                                                                                                                                                                                                         |
| `DecorationMode`, `ParseDecorationModeError` | Re-exported from [`oito2_foundation`](https://docs.rs/oito2_foundation): `Native`, `Undecorated`, `GtkHeaderless`; serialized in kebab-case; `platform_default()`, `as_str()`, `FromStr` (case-insensitive, also accepts `gtkheaderless`); a `ParseDecorationModeError` converts into `Error::Unsupported` |
| `apply_decoration_mode(&window, mode)`       | Applies a mode to a `WebviewWindow` and records it; must run on the main thread before the window is shown (on Linux a visible window is refused with `Unsupported`). Switching modes resets what the previous one changed                                                                                 |
| `show_window_menu(&window, x, y)`            | Shows the native window menu; must run on the main thread (the command does that with `run_on_main_thread`). On Windows it returns when the menu closes                                                                                                                                                    |
| `window_menu_supported()`                    | Whether the platform has a window menu (`oito2_foundation::window_menu::supported`)                                                                                                                                                                                                                        |
| `DecorationState`                            | The managed map of window label to mode (`record`, `get`, `forget`); a destroyed window is forgotten                                                                                                                                                                                                       |
| `Error`, `Result`                            | The serializable error type                                                                                                                                                                                                                                                                                |

| Platform | `platform_default()` | `gtk-headerless`                                    | Window menu                                                      |
| -------- | -------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| Linux    | `gtk-headerless`     | GTK client-side decorations with an empty title bar | GTK's; fails when the window manager has none                    |
| Windows  | `undecorated`        | Falls back to no system frame                       | The system menu (Restore, Move, Size, Minimize, Maximize, Close) |
| macOS    | `native`             | Falls back to no system frame                       | None (`unsupported`)                                             |

### TypeScript wrappers (`@oito2/ui-window`)

| Function                            | Calls                                                                                                    | Notes                                                                                                                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setDecorationMode(mode)`           | `plugin:oito2-window\|set_decoration_mode`                                                               | `{ mode }`                                                                                                                                                                                                                          |
| `decorationMode()`                  | `plugin:oito2-window\|decoration_mode`                                                                   | Resolves to `'native' \| 'undecorated' \| 'gtk-headerless'`                                                                                                                                                                         |
| `showWindowMenu(x, y)`              | `plugin:oito2-window\|show_window_menu`                                                                  | `{ x, y }`                                                                                                                                                                                                                          |
| `initWindow(options)`               | `setDecorationMode` when `decorations` is set, `decorationMode` otherwise, plus `@tauri-apps/api/window` | Returns a `NativeWindowController`, or `null` outside Tauri or when `options.signal` aborts first; the same controller while one is alive for the window; rejects with a clear message when the plugin or its permission is missing |
| `NativeWindowController.showMenu()` | `showWindowMenu`                                                                                         | Only when `state.canShowMenu` (Linux and Windows); without a position, at the last pointer position                                                                                                                                 |
| `CommandError`, `isCommandError`    | —                                                                                                        | The `{ kind, message }` rejection of the plugin commands and its type guard                                                                                                                                                         |

## tauri-plugin-oito2-settings

Reads the system settings an oito2 app adapts to and reports them as raw values; `@oito2/ui-settings` turns them into the `SystemSettings` of `@oito2/ui`. Source: [`plugins/tauri-plugin-oito2-settings`](../../../plugins/tauri-plugin-oito2-settings).

### Init

```rust
tauri::Builder::default().plugin(tauri_plugin_oito2_settings::init())
```

`init()` registers the plugin as `oito2-settings` and starts watching the settings (Linux, Windows and macOS) on a thread of its own. The readers and watchers come from the [`oito2_settings`](https://docs.rs/oito2_settings) crate of oito2_rs, which the plugin re-exports (`read_raw_settings`, `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme`, `Error`, `Result`).

### Command

| Command         | Arguments | Returns       | Behavior                                                                                                             |
| --------------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `read_settings` | —         | `RawSettings` | Reads the settings of the running platform on a blocking worker thread; rejects with `internal` if that thread stops |

Invoke name: `plugin:oito2-settings|read_settings`.

`RawSettings`, serialized in camelCase:

| Field                | Type                        | Contents                                                                |
| -------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `xdgCurrentDesktop`  | string or `null`            | `XDG_CURRENT_DESKTOP`                                                   |
| `desktopSession`     | string or `null`            | `DESKTOP_SESSION`                                                       |
| `gsettings`          | object of string or boolean | GSettings values by `schema/key`, for the installed schemas             |
| `config`             | `ConfigValues`              | Values from `kwinrc`, `kdeglobals`, `xfwm4.xml` and the COSMIC settings |
| `systemAccent`       | string or `null`            | The toolkit or system accent as `#RRGGBB`                               |
| `systemHighContrast` | boolean                     | Whether the system asks for high contrast                               |
| `colorScheme`        | `light`, `dark` or `null`   | The scheme the system asks for; `null` when it states no preference     |

The GSettings keys read on Linux are `button-layout` of `org.gnome.desktop.wm.preferences`, `org.cinnamon.desktop.wm.preferences` and `org.mate.Marco.general`, `accent-color`, `gtk-theme` and `color-scheme` of `org.gnome.desktop.interface`, and `high-contrast` of `org.gnome.desktop.a11y.interface`.

`ConfigValues` fields (each `null` when absent): `kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `kdeLookAndFeelPackage`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`, `cosmicIsDark`.

`@oito2/ui-settings` composes `colorScheme`, `kdeLookAndFeelPackage` and `cosmicIsDark` into `SystemSettings.colorScheme`, and reads them as `null` when an older plugin leaves them out.

### Event

| Event                      | Payload       | When                                                                             |
| -------------------------- | ------------- | -------------------------------------------------------------------------------- |
| `oito2-settings://changed` | `RawSettings` | When a watched setting changes and the new values differ from the last ones read |

Listening needs only `core:default` (the core event permissions). `SystemSettingsScope` also reads again when the window regains focus, so a setting changed while the watcher could not start is picked up then.

### Permissions

| Identifier                           | Description                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oito2-settings:default`             | Default set: `allow-read-settings` — "Lets the webview read the system settings (desktop session, window button layout, accent color and contrast)." |
| `oito2-settings:allow-read-settings` | Enables the `read_settings` command                                                                                                                  |
| `oito2-settings:deny-read-settings`  | Denies the `read_settings` command                                                                                                                   |

The generated reference is [`permissions/autogenerated/reference.md`](../../../plugins/tauri-plugin-oito2-settings/permissions/autogenerated/reference.md).

### Rust API

| Item                                                         | Purpose                                                |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| `init()`                                                     | Creates the plugin                                     |
| `read_raw_settings()`                                        | Reads the settings of the running platform             |
| `CHANGED_EVENT`                                              | `"oito2-settings://changed"`                           |
| `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme` | The reported values, re-exported from `oito2_settings` |
| `Error`, `Result`                                            | The serializable error type of `oito2_settings`        |

### TypeScript wrappers (`@oito2/ui-settings`)

| Export                                            | Calls                                                    | Notes                                                                                                |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tauriSettingsSource.read()`                      | `plugin:oito2-settings\|read_settings`                   | Resolves to `RawSettings`; throws a `TypeError` when the payload has another shape (`isRawSettings`) |
| `tauriSettingsSource.subscribe(fn)`               | `listen('oito2-settings://changed')`                     | Resolves to a function that stops listening                                                          |
| `settingsChangedEvent`                            | —                                                        | The event name                                                                                       |
| `loadSystemSettings(options)`                     | `source.read()` then `composeSystemSettings`             | Falls back to `fallbackSystemSettings` outside Tauri or when the read fails                          |
| `SystemSettingsScope`                             | `read()` once mounted and on window focus, `subscribe()` | Provides the composed settings through `SystemScope`                                                 |
| `composeSystemSettings(raw, platform)`            | —                                                        | Pure: raw values to `SystemSettings`                                                                 |
| `emptyRawSettings`                                | —                                                        | A `RawSettings` with nothing read, for tests                                                         |
| `isRawSettings`, `CommandError`, `isCommandError` | —                                                        | The payload guard, and the `{ kind, message }` rejection with its type guard                         |

## Errors

A failed command rejects with `{ kind, message }`, typed as `CommandError` in `@oito2/ui-window` and `@oito2/ui-settings` (`isCommandError` narrows an unknown rejection). The messages name no paths of the user's machine:

| Plugin           | `kind` values                          |
| ---------------- | -------------------------------------- |
| `oito2-window`   | `tauri`, `unsupported`, `invalidInput` |
| `oito2-settings` | `unsupported`, `internal`              |

## See also

- [Desktop integration](../guides/desktop-integration.md) — using both plugins in an app.
- [Window chrome](../architecture/window-chrome.md) and [System settings](../architecture/system-settings.md) — the internals.
- The plugin READMEs: [window](../../../plugins/tauri-plugin-oito2-window/README.md), [settings](../../../plugins/tauri-plugin-oito2-settings/README.md).
