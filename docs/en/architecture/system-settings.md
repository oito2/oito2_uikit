🌐 [Português](../../pt-br/architecture/system-settings.md) | **English** | 🏠 [Index](../index.md)

---

# System settings

How an oito2 app learns the desktop environment, the window button layout, the accent color and the high-contrast preference of the system it runs on. The work is split on purpose: the Rust plugin only **reads** raw values, and the TypeScript package **composes** them, so every rule is a pure function tested without the platform.

```text
tauri-plugin-oito2-settings        @oito2/ui-settings                       @oito2/ui
  read_raw_settings()  ─ RawSettings ─►  composeSystemSettings(raw, platform)  ─►  SystemScope
  read_settings command                  SystemSettingsScope                        useSystemSettings()
  oito2-settings://changed (Linux)       loadSystemSettings()
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

### Command and event

| Name                       | Kind    | Behavior                                                                                                                                    |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `read_settings`            | Command | Runs `read_raw_settings()` on a blocking worker (`spawn_blocking`) and returns `RawSettings`                                                |
| `oito2-settings://changed` | Event   | Linux only: emitted with the new `RawSettings` after a watched setting changes, and only when the values differ from the last ones reported |

Errors serialize as `{ kind, message }` with `kind` `tauri` or `unsupported`. The default permission set `oito2-settings:default` allows `read_settings`; listening to the event is covered by `core:default`.

### `RawSettings`

Serialized in camelCase: `xdgCurrentDesktop`, `desktopSession`, `gsettings` (values by `schema/key`, a string or a boolean), `config` (`kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`), `systemAccent` (`#RRGGBB` or `null`) and `systemHighContrast`.

### Linux sources (`platform_linux.rs`, `config.rs`)

| Source                                           | What is read                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment                                      | `XDG_CURRENT_DESKTOP`, `DESKTOP_SESSION`                                                                                                                                                                                                                                                                                                                              |
| GSettings (through GIO)                          | `org.gnome.desktop.wm.preferences/button-layout`, `org.cinnamon.desktop.wm.preferences/button-layout`, `org.mate.Marco.general/button-layout`, `org.gnome.desktop.interface/accent-color`, `org.gnome.desktop.interface/gtk-theme`, `org.gnome.desktop.a11y.interface/high-contrast`. Only schemas and keys that are installed are read (GIO aborts on unknown ones). |
| XDG desktop portal (D-Bus)                       | `org.freedesktop.appearance` `accent-color` (RGB, turned into `systemAccent`) and `contrast` (`1` sets `systemHighContrast`), through `ReadOne` with a fallback to `Read`, with a 500 ms timeout                                                                                                                                                                      |
| Files under `XDG_CONFIG_HOME` (else `~/.config`) | `kwinrc` `[org.kde.kdecoration2]` `ButtonsOnLeft`/`ButtonsOnRight`; `kdeglobals` `[General]` `AccentColor` and `ColorScheme`; `xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml` `button_layout`; `cosmic/com.system76.CosmicTk/v1/show_minimize` and `show_maximize`. Missing files leave their values empty; files over 1 MiB are ignored.                                |

**Watchers.** `init()` starts them on the main thread, whose GLib loop delivers the signals: a `changed` handler on each installed GSettings schema, GIO directory monitors on the folders of the configuration files (catching writes in place and atomic replacements), and a subscription to the portal's `SettingChanged` signal for `org.freedesktop.appearance`. Bursts of changes are debounced to one read 150 ms after the last change; the read runs on a worker thread and the event is emitted only when the result differs from the last one.

### Windows sources (`platform_windows.rs`)

Through the Windows Runtime (`windows` crate, `UI::ViewManagement`): the accent from `UISettings::GetColorValue(UIColorType::Accent)` and high contrast from `AccessibilitySettings::HighContrast`. No change event.

### macOS sources (`platform_macos.rs`)

Through AppKit (`objc2-app-kit`): `NSColor.controlAccentColor` converted to sRGB, and `NSWorkspace.accessibilityDisplayShouldIncreaseContrast` ("Increase contrast"). No change event.

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
4. Reads again whenever the window regains focus — the only way to catch changes on Windows and macOS, where no event is emitted.

Each read carries a generation number, so a slow read never overwrites a newer one. New values that cannot be composed, or that equal the current ones (`sameSystemSettings`), are ignored; real changes call `onSettingsChange`. A failed read keeps the current settings.

`loadSystemSettings(options)` performs a single read and resolves to the platform defaults in a browser or on failure.

## Testing

| What                         | Where                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Composition rules            | `packages/ui-settings/src/lib/compose.test.ts` (Node), against hand-written `RawSettings`                        |
| Detection, layouts, fallback | `packages/ui/src/lib/foundation/*.test.ts`, compared with `fixtures/parity/foundation.json` from oito2_ui        |
| The scope                    | `SystemSettingsScope.svelte.test.ts`, with a fake `source`                                                       |
| Rust parsers and files       | `cargo test -p tauri-plugin-oito2-settings` (INI, xfconf XML, KDE colors, COSMIC flags, file watching)           |
| A real desktop               | `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture` prints what the plugin reads on the machine |
