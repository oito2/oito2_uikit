🌐 [Português](../../pt-br/architecture/system-settings.md) | **English** | 🏠 [Index](../index.md)

---

# System settings

How an oito2 app learns the desktop environment, the window button layout, the accent color and the high-contrast preference of the system it runs on. The work is split on purpose: the Rust plugin only **reads** raw values, and the TypeScript package **composes** them, so every rule is a pure function tested without the platform.

```text
tauri-plugin-oito2-settings        @oito2/ui-settings                       @oito2/ui
(on oito2_settings)
  read_raw_settings()  ─ RawSettings ─►  composeSystemSettings(raw, platform)  ─►  SystemScope
  read_settings command                  SystemSettingsScope                        useSystemSettings()
  oito2-settings://changed              loadSystemSettings()
```

For setting it up in an app, see the [Desktop integration guide](../guides/desktop-integration.md) and the [`@oito2/ui-settings` README](../../../packages/ui-settings/README.md).

## What the components consume: `SystemSettings`

Defined in `packages/ui/src/lib/foundation/system-settings.ts`:

| Field                | Type                         | Meaning                                                                                                                   |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `platform`           | `Platform`                   | Operating system and whether it runs on the web                                                                           |
| `desktopEnvironment` | `DesktopEnvironment \| null` | The Linux desktop; `null` outside native Linux                                                                            |
| `windowControlStyle` | `WindowControlStyle`         | The look of the window buttons                                                                                            |
| `windowButtonLayout` | `WindowButtonLayout`         | The buttons on each side, in order                                                                                        |
| `accentColor`        | `string \| null`             | The system accent as hex                                                                                                  |
| `colorScheme`        | `Brightness \| null`         | The light or dark scheme the system asks for; `null` without a preference (always `null` for now: no reader fills it yet) |
| `highContrast`       | `boolean`                    | Whether the system asks for high contrast                                                                                 |

`SystemScope` provides it; `useSystemSettings()` reads it, falling back to `fallbackSystemSettings(Platform.current())` without a scope. The fallback derives everything from the platform: on native Linux the desktop is `unknown` (style `gnome`), on Windows the style is `windows`, on macOS `macos`, on the web and touch platforms `none`; the layout is `WindowButtonLayout.defaultFor(style)` (close, minimize, maximize on the leading side for macOS; minimize, maximize, close on the trailing side otherwise); no accent; no high contrast.

## `tauri-plugin-oito2-settings` (Rust)

The plugin is a thin Tauri layer over the [`oito2_settings`](https://docs.rs/oito2_settings) crate of [oito2_rs](https://github.com/oito2/oito2_rs), which the other OITO2 Rust user interfaces share. The crate holds every platform reader and watcher; the plugin only exposes them to the webview and re-exports `read_raw_settings`, `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme`, `Error` and `Result`.

### Command and event

| Name                       | Kind    | Behavior                                                                                                                    |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `read_settings`            | Command | Runs `read_raw_settings()` on a blocking worker (`spawn_blocking`) and returns `RawSettings`                                |
| `oito2-settings://changed` | Event   | Emitted with the new `RawSettings` after a watched setting changes, and only when the values differ from the last ones read |

`init()` starts `oito2_settings::watch` on a thread of its own when the app starts (the watcher reads the settings once before returning) and keeps the watcher in the app state for the life of the app. It watches on Linux, Windows and macOS; on macOS the notifications arrive through the app's main run loop, which every Tauri app runs. When the watcher cannot start, the plugin writes the reason to stderr and the app keeps working without change events.

Errors serialize as `{ kind, message }` with `kind` `unsupported` or `internal`. The default permission set `oito2-settings:default` allows `read_settings`; listening to the event is covered by `core:default`.

### `RawSettings`

Serialized in camelCase: `xdgCurrentDesktop`, `desktopSession`, `gsettings` (values by `schema/key`, a string or a boolean), `config` (`kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `kdeLookAndFeelPackage`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`, `cosmicIsDark`), `systemAccent` (`#RRGGBB` or `null`), `systemHighContrast` and `colorScheme` (`light`, `dark` or `null`). `@oito2/ui-settings` does not read `colorScheme`, `kdeLookAndFeelPackage` and `cosmicIsDark` yet.

### Sources

What each platform reads (environment, GSettings, the XDG desktop portal and the configuration files on Linux; the Windows Runtime on Windows; AppKit on macOS) and how each one is watched are documented with the crate: [settings sources](https://github.com/oito2/oito2_rs/blob/main/docs/en/reference/settings-sources.md), [readers](https://github.com/oito2/oito2_rs/blob/main/docs/en/architecture/readers.md), [watchers](https://github.com/oito2/oito2_rs/blob/main/docs/en/architecture/watchers.md) and the [JSON contract](https://github.com/oito2/oito2_rs/blob/main/docs/en/reference/json-contract.md).

## `@oito2/ui-settings` (TypeScript)

### `composeSystemSettings(raw, platform)`

On **native Linux**, the desktop environment comes from `detectDesktopEnvironment` (the first recognized `XDG_CURRENT_DESKTOP` entry, then `DESKTOP_SESSION`). The rest follows this matrix, exactly as implemented in `compose.ts`:

| Desktop environment                                       | Control style | Button layout source                                                            | Default when the source is missing | Accent                                             | High contrast                                                                      |
| --------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `kde`                                                     | `breeze`      | `kwinrc` `ButtonsOnLeft` / `ButtonsOnRight`                                     | `MS` / `HIAX` (KWin's defaults)    | `kdeglobals` `AccentColor`, else the portal accent | Portal contrast, or `ColorScheme` containing `contrast`                            |
| `xfce`                                                    | `xfwm`        | `xfwm4.xml` `button_layout`                                                     | `O\|SHMC` (xfwm4's default)        | GNOME named accent, else the portal accent         | Portal contrast, GNOME `high-contrast`, or a `gtk-theme` containing `highcontrast` |
| `cosmic`                                                  | `cosmic`      | `show_minimize` / `show_maximize` flags; close always; all on the trailing side | A missing flag shows the button    | GNOME named accent, else the portal accent         | Same as `xfce`                                                                     |
| `cinnamon`                                                | `gnome`       | GSettings `org.cinnamon.desktop.wm.preferences/button-layout`                   | `defaultFor('gnome')`              | GNOME named accent, else the portal accent         | Same as `xfce`                                                                     |
| `mate`                                                    | `gnome`       | GSettings `org.mate.Marco.general/button-layout`                                | `defaultFor('gnome')`              | GNOME named accent, else the portal accent         | Same as `xfce`                                                                     |
| `gnome`, `budgie`, `lxqt`, `pantheon`, `unity`, `unknown` | `gnome`       | GSettings `org.gnome.desktop.wm.preferences/button-layout`                      | `defaultFor('gnome')`              | GNOME named accent, else the portal accent         | Same as `xfce`                                                                     |

"GNOME named accent" means `org.gnome.desktop.interface/accent-color` when it names one of the nine `accentColors` (`blue`, `teal`…, `slate`); it is mapped to that accent's hex.

On **Windows and macOS** (and any non-Linux platform), there is no desktop environment, the style and layout are the platform defaults, `accentColor` is `systemAccent` and `highContrast` is `systemHighContrast`.

The button layout parsers live in `@oito2/ui` (`WindowButtonLayout.parseGnome`, `parseKde`, `parseXfwm`); they skip unknown tokens and repeated buttons.

### `SystemSettingsScope`

A `SystemScope` fed by a `SettingsSource` (default: `tauriSettingsSource` inside Tauri, none in a browser):

1. Starts from `initialSettings` or `fallbackSystemSettings(platform)`.
2. Once mounted, reads the settings (`invoke('plugin:oito2-settings|read_settings')`).
3. Subscribes to `oito2-settings://changed`.
4. Reads again whenever the window regains focus, which also catches changes made while the plugin's watcher could not start.

Each read carries a generation number, so a slow read never overwrites a newer one. New values that cannot be composed, or that equal the current ones (`sameSystemSettings`), are ignored; real changes call `onSettingsChange`. A failed read keeps the current settings.

`loadSystemSettings(options)` performs a single read and resolves to the platform defaults in a browser or on failure.

## Testing

| What                         | Where                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Composition rules            | `packages/ui-settings/src/lib/compose.test.ts` (Node), against hand-written `RawSettings`                        |
| Detection, layouts, fallback | `packages/ui/src/lib/foundation/*.test.ts`, compared with `fixtures/parity/foundation.json` from oito2_ui        |
| The scope                    | `SystemSettingsScope.svelte.test.ts`, with a fake `source`                                                       |
| JSON contract of the plugin  | `cargo test -p tauri-plugin-oito2-settings` (camelCase fields of `RawSettings`, error kinds)                     |
| Readers, parsers, watchers   | The tests of `oito2_settings` in oito2_rs                                                                        |
| A real desktop               | `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture` prints what the plugin reads on the machine |
