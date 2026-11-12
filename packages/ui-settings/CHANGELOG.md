# @oito2/ui-settings

## 0.1.0

### Minor Changes

- be8c2b0: `composeSystemSettings` now fills `SystemSettings.colorScheme`: the platform's light or dark preference (`RawSettings.colorScheme`, the settings portal on Linux), and on Linux, when the portal states no preference, the desktop's own store (GNOME's `color-scheme` key on the GNOME family, Cinnamon and MATE; a dark `kdeglobals` color scheme or global theme on KDE; the `is_dark` flag on COSMIC). `RawSettings` gains the optional `colorScheme`, `config.kdeLookAndFeelPackage` and `config.cosmicIsDark`, read as `null` from older plugins, and `isRawSettings` rejects a `colorScheme` other than `light`, `dark` or `null`.
- 3fc90c6: Add the system settings. `SystemSettingsScope` provides the real desktop environment, window control style and button layout, accent color and high-contrast preference to the components inside it (and to `ThemeProvider`, which follows the system accent and contrast by default): it reads them through `tauri-plugin-oito2-settings` when it mounts, follows the changes the plugin reports on Linux and reads them again when the window regains focus. `loadSystemSettings` reads them once, and `composeSystemSettings` turns the values the plugin reads into a `SystemSettings` with the rules of `oito2_ui_settings`. The plugin now has the `read_settings` command and the `oito2-settings://changed` event: on Linux it reads GSettings, the XDG desktop portal and the KDE, Xfce and COSMIC configuration files and watches them; on Windows and macOS it reads the accent color and the contrast preference.
- d61831d: Fix the Tauri integration and make the satellite packages share one copy of `@oito2/ui`. `@oito2/ui` becomes a peer dependency of every other package, and `@tauri-apps/api`, `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` peer dependencies of `@oito2/ui-files`, `@oito2/ui-window` and `@oito2/ui-settings`, so the app picks their versions; the published packages no longer carry the test goldens. `@oito2/ui-files`: the Tauri drop target converts drag-drop positions to CSS pixels only on Windows, where wry reports physical pixels, so drops on HiDPI Linux and macOS land on the zone; a file whose size can't be read is refused with the new `unreadable` reason (`fileUnreadable` string) instead of failing the whole batch, the count limit is checked before the size, drag-and-drop and `FileUpload` failures are reported instead of left unhandled, previews follow `showPreviews`, the drop zone's accessible name no longer repeats the "Choose files" badge, MIME-only `accept` groups filter the native chooser through the extension table (`extensionsForMimeType`) and the table covers more types. `@oito2/ui-window`: `initWindow` takes a `signal`, returns the live controller when called again for the same window and rejects with a clear message without the plugin; `dispose()` clears the `data-oito2-*` attributes; a focus change no longer discards a state read in flight; `showMenu()` without a position opens under the pointer; `CommandError` and `isCommandError` type the plugin rejections. `@oito2/ui-settings`: `isRawSettings` validates the plugin payload, failed reads warn once instead of failing silently, and `CommandError` types the rejections. `@oito2/ui-themes`: `presetSchemeName(preset, { highContrast })` returns the `data-oito2-scheme` value of a preset. Rust: `set_decoration_mode` and `show_window_menu` wait for the main-thread work and reject with the real error, decoration modes switch cleanly on Linux (a visible window is refused), destroyed windows are forgotten, a relative `XDG_CONFIG_HOME` is ignored and the settings plugin's error kinds are `unsupported` and `internal`.

### Patch Changes

- 756acd6: The Tauri plugins are now built on the `oito2_settings` and `oito2_foundation` crates of oito2_rs, with the same commands, events, permissions and JSON. `tauri-plugin-oito2-settings` now watches the settings on Windows and macOS too, so `oito2-settings://changed` reaches `SystemSettingsScope` there without waiting for the window to regain focus, and `RawSettings` gains `colorScheme`, `config.kdeLookAndFeelPackage` and `config.cosmicIsDark`. `tauri-plugin-oito2-window` re-exports `DecorationMode` and `ParseDecorationModeError` from `oito2_foundation`.
- 1de8210: `SystemSettings` gains `colorScheme` (`'light' | 'dark' | null`), the light or dark scheme the system asks for, matching `colorScheme` of oito2_ui's `Oito2SystemSettings`. `fallbackSystemSettings` and `composeSystemSettings` set it to `null` for now, and `sameSystemSettings` compares it.
- Updated dependencies [84e5df9]
- Updated dependencies [e1526eb]
- Updated dependencies [4cbafa7]
- Updated dependencies [540853e]
- Updated dependencies [bfc458c]
- Updated dependencies [beb2148]
- Updated dependencies [91f11ee]
- Updated dependencies [466f4c7]
- Updated dependencies [f94a055]
- Updated dependencies [c66bd4f]
- Updated dependencies [614ca49]
- Updated dependencies [d9c76ff]
- Updated dependencies [ceb22f9]
- Updated dependencies [1de8210]
- Updated dependencies [d61831d]
- Updated dependencies [fed95a0]
  - @oito2/ui@0.1.0
