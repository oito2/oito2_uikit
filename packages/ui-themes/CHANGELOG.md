# @oito2/ui-themes

## 0.1.0

### Minor Changes

- 84e5df9: Add the oito2 color system. `@oito2/ui` derives complete schemes (all Material 3 roles plus text-safe semantic, chrome and syntax colors, WCAG AA or AAA with high contrast) from an accent with `createColorTheme` or from a theme family's roles with `colorThemeFromRoles`, applies them with `ThemeProvider` (light, dark or system; accent and high contrast from the system by default) and exposes them to components through `useTheme()`. The Svelte-free parts are also available from `@oito2/ui/theme`, and `@oito2/ui/schemes.css` ships every base scheme as CSS. `@oito2/ui-themes` adds the 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard and Catppuccin) with `presetColorTheme`, `presetTheme` and `@oito2/ui-themes/presets.css`.
- d61831d: Fix the Tauri integration and make the satellite packages share one copy of `@oito2/ui`. `@oito2/ui` becomes a peer dependency of every other package, and `@tauri-apps/api`, `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` peer dependencies of `@oito2/ui-files`, `@oito2/ui-window` and `@oito2/ui-settings`, so the app picks their versions; the published packages no longer carry the test goldens. `@oito2/ui-files`: the Tauri drop target converts drag-drop positions to CSS pixels only on Windows, where wry reports physical pixels, so drops on HiDPI Linux and macOS land on the zone; a file whose size can't be read is refused with the new `unreadable` reason (`fileUnreadable` string) instead of failing the whole batch, the count limit is checked before the size, drag-and-drop and `FileUpload` failures are reported instead of left unhandled, previews follow `showPreviews`, the drop zone's accessible name no longer repeats the "Choose files" badge, MIME-only `accept` groups filter the native chooser through the extension table (`extensionsForMimeType`) and the table covers more types. `@oito2/ui-window`: `initWindow` takes a `signal`, returns the live controller when called again for the same window and rejects with a clear message without the plugin; `dispose()` clears the `data-oito2-*` attributes; a focus change no longer discards a state read in flight; `showMenu()` without a position opens under the pointer; `CommandError` and `isCommandError` type the plugin rejections. `@oito2/ui-settings`: `isRawSettings` validates the plugin payload, failed reads warn once instead of failing silently, and `CommandError` types the rejections. `@oito2/ui-themes`: `presetSchemeName(preset, { highContrast })` returns the `data-oito2-scheme` value of a preset. Rust: `set_decoration_mode` and `show_window_menu` wait for the main-thread work and reject with the real error, decoration modes switch cleanly on Linux (a visible window is refused), destroyed windows are forgotten, a relative `XDG_CONFIG_HOME` is ignored and the settings plugin's error kinds are `unsupported` and `internal`.

### Patch Changes

- bfc458c: Add the basic controls, styled like the oito2_ui Material 3 theme with pointer and touch sizes: `Button` (filled, tonal, outlined, text and elevated), `IconButton` (with a tooltip and a selected state), `BackButton`, `CloseButton` and `Fab`; `Checkbox` (with a mixed state), `Switch` (with on/off shapes), `RadioGroup`, `ToggleButton`, `CheckButton`, `RadioButton`, `SwitchButton` and the `CheckboxListTile`, `RadioListTile` and `SwitchListTile` rows; `ListTile`; `CircularProgress` and `LinearProgress`; `Slider` (one or two thumbs, divisions, marks, vertical); `Card`, `Chip`, `Badge` and `Separator`; `Field` with `TextField` and `TextArea`; `Tooltip`, `Dialog`, `AlertDialog`, `Menu` (with check box and radio items and submenus) and `Select`; and `ScrollArea`. Themes now also set `--oito2-color-selected-fill`, `--oito2-color-on-selected-fill`, `--oito2-color-on-primary-text` and `--oito2-color-off-thumb`, and `componentColors` returns them.
- c66bd4f: Add the layout and navigation components. `@oito2/ui` gets `BorderContainer`, `Section`, `Tile` and `TileList`, `Watermark`, `SelectableContainer`, `Banner`, `InfoBox` and `InfoBadge`, `Expandable` and `Accordion` (also exported as `ExpansionPanel`), `Tabs` in the pill and subtle styles, in a row or a column, with a `tabs` slot on `HeaderBar`, `NavigationRail` in three styles, `NavigationBar`, `NavigationPage`, which switches between a rail and a bottom bar by width and input, `MasterDetail`, `PanedView` and `Splitter` with keyboard-resizable dividers, `Steps`, `Pagination`, `PageIndicator`, `Carousel`, `TableOfContents` with scroll-spy and `PageController`. Every color theme now also defines the message colors (`--oito2-color-info-box-<type>`, `--oito2-color-info-badge-text-<type>`…) and `--oito2-color-on-primary-tint`, and the presets of `@oito2/ui-themes` include them.
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
