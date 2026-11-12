# @oito2/ui-window

## 0.1.0

### Minor Changes

- d61831d: Fix the Tauri integration and make the satellite packages share one copy of `@oito2/ui`. `@oito2/ui` becomes a peer dependency of every other package, and `@tauri-apps/api`, `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` peer dependencies of `@oito2/ui-files`, `@oito2/ui-window` and `@oito2/ui-settings`, so the app picks their versions; the published packages no longer carry the test goldens. `@oito2/ui-files`: the Tauri drop target converts drag-drop positions to CSS pixels only on Windows, where wry reports physical pixels, so drops on HiDPI Linux and macOS land on the zone; a file whose size can't be read is refused with the new `unreadable` reason (`fileUnreadable` string) instead of failing the whole batch, the count limit is checked before the size, drag-and-drop and `FileUpload` failures are reported instead of left unhandled, previews follow `showPreviews`, the drop zone's accessible name no longer repeats the "Choose files" badge, MIME-only `accept` groups filter the native chooser through the extension table (`extensionsForMimeType`) and the table covers more types. `@oito2/ui-window`: `initWindow` takes a `signal`, returns the live controller when called again for the same window and rejects with a clear message without the plugin; `dispose()` clears the `data-oito2-*` attributes; a focus change no longer discards a state read in flight; `showMenu()` without a position opens under the pointer; `CommandError` and `isCommandError` type the plugin rejections. `@oito2/ui-settings`: `isRawSettings` validates the plugin payload, failed reads warn once instead of failing silently, and `CommandError` types the rejections. `@oito2/ui-themes`: `presetSchemeName(preset, { highContrast })` returns the `data-oito2-scheme` value of a preset. Rust: `set_decoration_mode` and `show_window_menu` wait for the main-thread work and reject with the real error, decoration modes switch cleanly on Linux (a visible window is refused), destroyed windows are forgotten, a relative `XDG_CONFIG_HOME` is ignored and the settings plugin's error kinds are `unsupported` and `internal`.
- fed95a0: Add the window chrome. `@oito2/ui` gets `TitleBar`, `WindowTitleBar` (set up for the desktop from the closest `SystemScope`: the GNOME, KDE Breeze, Xfwm, COSMIC or Windows window controls in the desktop's button order, room for the macOS traffic lights, no controls in a browser), `DialogTitleBar`, `HeaderBar` with a built-in search field, `WindowControl` and `WindowControls` in seven styles, the `titleBarGestures` attachment (drag, double-click to maximize, window menu on the secondary button) and the `WindowController` interface with `WindowScope`. `@oito2/ui-window` adds `initWindow()`, `NativeWindowController` for Tauri windows, `WindowResizeHandles` for undecorated Linux windows and typed wrappers of the `tauri-plugin-oito2-window` commands, which now set and report the window frame and show the native window menu on Linux and Windows.

### Patch Changes

- 756acd6: The Tauri plugins are now built on the `oito2_settings` and `oito2_foundation` crates of oito2_rs, with the same commands, events, permissions and JSON. `tauri-plugin-oito2-settings` now watches the settings on Windows and macOS too, so `oito2-settings://changed` reaches `SystemSettingsScope` there without waiting for the window to regain focus, and `RawSettings` gains `colorScheme`, `config.kdeLookAndFeelPackage` and `config.cosmicIsDark`. `tauri-plugin-oito2-window` re-exports `DecorationMode` and `ParseDecorationModeError` from `oito2_foundation`.
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
