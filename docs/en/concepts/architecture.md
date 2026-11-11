🌐 [Português](../../pt-br/concepts/architecture.md) | **English** | 🏠 [Index](../index.md)

---

# Architecture

A high-level overview of oito2_uikit: how data flows through it, where each piece lives, which dependencies it uses and the design decisions behind it. The deep, per-subsystem pages for contributors are under [`architecture/`](../architecture/tokens-and-themes.md).

## Data flow

### System settings, from the operating system to the components

```text
Operating system
  (session variables, GSettings, XDG portal, KDE/Xfce/COSMIC files,
   Windows Runtime, AppKit)
        │  read by
        ▼
tauri-plugin-oito2-settings (Rust)
  read_settings command  ──►  RawSettings (camelCase JSON)
  oito2-settings://changed event (Linux, debounced 150 ms)
        │  invoke / listen
        ▼
@oito2/ui-settings (TypeScript)
  composeSystemSettings(raw, platform)  ──►  SystemSettings
  SystemSettingsScope: reads on mount, on every change event, on window focus
        │  context
        ▼
@oito2/ui  SystemScope  ──►  useSystemSettings()
        │
        ├──► ThemeProvider: accent and high contrast of the color scheme
        └──► WindowTitleBar / HeaderBar / DialogTitleBar: control style and button layout
```

The plugin returns only raw values. Every rule — which desktop environment it is, which button layout source applies, which accent wins — lives in `composeSystemSettings`, a pure function tested without Tauri. Outside Tauri there is no source, and the scope keeps `fallbackSystemSettings(platform)`. Details in [System settings](../architecture/system-settings.md).

### Window actions, from the title bar to the window

```text
TitleBar (click, double click, secondary click, drag)
  ──► WindowController from the closest WindowScope
        NativeWindowController (@oito2/ui-window)
          ├──► @tauri-apps/api/window: minimize, toggleMaximize, close,
          │                            startDragging, startResizeDragging
          └──► tauri-plugin-oito2-window: show_window_menu, set_decoration_mode,
                                          decoration_mode
```

The window state (maximized, full screen, focused) flows back from the window's events into the controller's reactive `state`, which the title bars render. Details in [Window chrome](../architecture/window-chrome.md).

### Tokens and themes, from values to CSS

```text
tokens/values.ts ──(pnpm generate)──► tokens.css
theme/ (createColorTheme) ──(pnpm generate)──► schemes.css (36 base schemes)
ui-themes presets ──(pnpm generate)──► presets.css (13 presets + high contrast)

At run time:
SystemSettings + ThemeProvider props ──► createColorTheme / preset ──► ColorTheme
  ──► colorThemeStyle() ──► --oito2-color-*, --oito2-chrome-*, --oito2-syntax-*
      on the ThemeProvider div ──► components read var(--oito2-…)
```

CI runs `pnpm generate:check` so the generated CSS never drifts from its sources. Details in [Tokens and themes](../architecture/tokens-and-themes.md).

## Folder and package layout

| Path                                  | What lives there                                                                                                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui`                         | `@oito2/ui`: tokens, color themes, foundation (platform, desktop environment, button layout, system scope), localization, interaction primitives, window chrome, collections, shortcuts, attachments and the components |
| `packages/ui-themes`                  | `@oito2/ui-themes`: the 13 named presets and `presets.css`                                                                                                                                                              |
| `packages/ui-syntax`                  | `@oito2/ui-syntax`: highlight.js colored with the scheme's syntax roles, `CodeBlock`, JetBrains Mono                                                                                                                    |
| `packages/ui-extras`                  | `@oito2/ui-extras`: QR code, signature pad, image cropper, navigation menu                                                                                                                                              |
| `packages/ui-files`                   | `@oito2/ui-files`: file upload, drop zone and download, with a Tauri adapter and a browser adapter                                                                                                                      |
| `packages/ui-window`                  | `@oito2/ui-window`: `initWindow`, `NativeWindowController`, `WindowResizeHandles`                                                                                                                                       |
| `packages/ui-settings`                | `@oito2/ui-settings`: `SystemSettingsScope`, `composeSystemSettings`, `loadSystemSettings`                                                                                                                              |
| `packages/ui-test-utils`              | Test helpers shared by the packages (private)                                                                                                                                                                           |
| `plugins/tauri-plugin-oito2-window`   | Rust: decoration modes and the native window menu                                                                                                                                                                       |
| `plugins/tauri-plugin-oito2-settings` | Rust: desktop session, button layout sources, accent, high contrast, Linux watchers                                                                                                                                     |
| `apps/showcase`                       | The SvelteKit catalogue of every component, built for GitHub Pages and as a Tauri app (`src-tauri/`)                                                                                                                    |
| `tools/generate-css`                  | Generates `tokens.css`, `schemes.css` and `presets.css`                                                                                                                                                                 |
| `tools/generate-docs`                 | Generates the showcase API reference (`apps/showcase/src/lib/api/api.json`)                                                                                                                                             |
| `tools/parity`                        | `sync.ts`, which copies the parity fixtures exported by oito2_ui                                                                                                                                                        |
| `tools/release`                       | `sync-versions.ts`, which keeps every version equal                                                                                                                                                                     |
| `tools/templates`                     | The GPL-3.0 license headers, one per comment syntax                                                                                                                                                                     |

Inside `packages/ui/src/lib`:

| Folder                         | Contents                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `tokens/`                      | `values.ts`, the single source of every token value (a module without imports)                                               |
| `theme/`                       | Color scheme functions, CSS variable output, `ThemeProvider`, theme context                                                  |
| `foundation/`                  | `Platform`, color and contrast helpers, desktop environment detection, `WindowButtonLayout`, `SystemSettings`, `SystemScope` |
| `styles/`                      | `styles.css`, `fonts.css`, `tokens.css`, `density.css`, `base.css`, `schemes.css`                                            |
| `internal/`                    | Interaction primitives, not exported                                                                                         |
| `window/`                      | Title bars, window controls, `WindowScope`, `titleBarGestures`                                                               |
| `collections/`                 | `ListCollection`, `TreeCollection`, `SelectionController`, `AsyncListController`                                             |
| `shortcuts/`                   | `Shortcut`, `KeyChord`, `Commands`                                                                                           |
| `attachments/`, `transitions/` | Public attachments (`focusBorder`, `edgeFocus`, `draggable`, `undershoot`) and `pageTransition`                              |
| `l10n/`, `format/`             | English and Brazilian Portuguese strings, `LocaleProvider`, number/date/byte formatting                                      |
| `icons/`                       | The `@oito2/ui/icons` subpath, `AnimatedIcon`, freedesktop icon names                                                        |
| `components/<group>/`          | The components; compound parts in a subfolder with an `index.ts`                                                             |

## Main dependencies

### npm (runtime)

| Dependency                                           | Used by                                          | Why                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `svelte` (peer, `^5.57.0`)                           | every package                                    | The component framework, in runes mode                                                                                    |
| `@floating-ui/dom`                                   | `@oito2/ui`                                      | The only positioning dependency: places popovers, menus, tooltips and selects next to their anchor and keeps them in view |
| `@lucide/svelte`                                     | `@oito2/ui`, `ui-extras`, `ui-files`             | Icons, imported one by one so bundlers keep only those used; re-exported by `@oito2/ui/icons`                             |
| `@material/material-color-utilities`                 | `@oito2/ui`                                      | The Material 3 tonal-spot scheme seeded from the accent, so the roles match Flutter's `ColorScheme`                       |
| `@catppuccin/palette`                                | `@oito2/ui-themes`                               | The official Catppuccin colors for the four Catppuccin presets                                                            |
| `highlight.js`                                       | `@oito2/ui-syntax`                               | Tokenizes source code for syntax highlighting                                                                             |
| `qrcode-generator`                                   | `@oito2/ui-extras`                               | Encodes QR codes                                                                                                          |
| `@tauri-apps/api`                                    | `ui-window`, `ui-settings`, `ui-files`, showcase | IPC (`invoke`, events) and the window API; loaded with dynamic `import()` or guarded by `isTauri()`                       |
| `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs` | `@oito2/ui-files`                                | The native file chooser, Save as dialog and file reads and writes in Tauri                                                |

### Rust

| Crate                                    | Used by                        | Why                                                                                                   |
| ---------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `tauri` (2.12)                           | both plugins, showcase         | The app runtime and plugin API                                                                        |
| `tauri-plugin` (build)                   | both plugins                   | Generates the permission files from the commands                                                      |
| `serde`                                  | both plugins                   | Serializes `RawSettings`, `DecorationMode` and errors for the webview                                 |
| `thiserror`                              | both plugins                   | The serializable error enum of each crate                                                             |
| `gtk` 0.18 (Linux)                       | both plugins                   | GTK client-side decorations, the GDK window menu, GSettings, GIO file monitors and D-Bus              |
| `windows` 0.62 (Windows)                 | window plugin, settings plugin | The system menu (`Win32_UI_WindowsAndMessaging`); the accent and high contrast (`UI::ViewManagement`) |
| `objc2-app-kit` 0.3 (macOS)              | settings plugin                | `NSColor.controlAccentColor` and the "Increase contrast" preference                                   |
| `tauri-plugin-dialog`, `tauri-plugin-fs` | showcase                       | The Rust side of the file components                                                                  |

Every version is declared once: npm versions in the `catalog:` of `pnpm-workspace.yaml`, crate versions in `[workspace.dependencies]` of the root `Cargo.toml`.

## Key design decisions

| Decision                                                     | Rationale                                                                                                                                                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oito2_ui is the source of truth, checked by parity fixtures  | Two implementations of one design drift unless a machine compares them. JSON exported from Flutter is asserted in the Vitest suites.                                                           |
| Behavior written in-house, following the WAI-ARIA APG        | Full control over keyboard, focus and screen reader behavior, and no headless-library dependency to track. Ark UI is a conceptual reference only; its code is never copied.                    |
| Atomic components by name, compound components as namespaces | `Button`, `Switch` are single files; `Tabs.Root`, `Tabs.List`, `Tabs.Trigger` share state through context created by `Root`. Parts can be arranged and styled freely.                          |
| No `Oito2` prefix in names                                   | The npm scope is the namespace. CSS uses `--oito2-*` variables, `.oito2-*` classes and `data-oito2-*` attributes.                                                                              |
| Every component rule inside `@layer oito2`                   | Unlayered app CSS always wins, without specificity battles or `!important`.                                                                                                                    |
| Runes and `.svelte.ts` classes, no stores                    | State and controllers (`Controllable`, `Presence`, `SelectionController`) are classes with `$state`/`$derived` fields; contexts expose live getters (`.current`).                              |
| Attachments, not `use:` actions                              | Reusable behaviors (`focusScope`, `rovingFocus`, `dismissableLayer`, `floating`, `focusBorder`) are `{@attach …}` functions that re-run when their reactive inputs change.                     |
| SSR-safe code                                                | No `window`, `document` or `navigator` at module level; the DOM is touched only in effects, attachments, handlers or `onMount`. The libraries also work in a server-rendered Svelte app.       |
| Overlay positioning only through `@floating-ui/dom`          | CSS anchor positioning exists on the WebView baseline, but one positioning engine serves every anchored overlay, with flip, shift, size and arrow handling.                                    |
| Overlays rendered into the `ThemeProvider` host              | They escape clipping and stacking while keeping the theme's custom properties.                                                                                                                 |
| Plugins return raw values; TypeScript composes them          | The rules (desktop detection, layout sources, accent priority) are pure and testable without the platform, and the Rust code stays small.                                                      |
| Libraries work outside Tauri                                 | Native calls are guarded with `isTauri()` and loaded with dynamic `import()`, so the same packages run in a browser and the showcase ships as a website.                                       |
| `unsafe` only in `tauri-plugin-oito2-window/src/menu.rs`     | The workspace forbids `unsafe_code`; the window crate only denies it so the native window menu module (raw GDK event, `TrackPopupMenu`) can allow it, each block limited to the foreign calls. |
| One version for every package and crate                      | Changesets uses a fixed group for `@oito2/*`, and `tools/release/sync-versions.ts` copies the version to Cargo and the showcase, so a tag names a consistent set.                              |
| GPL-3.0                                                      | oito2 is free software; every hand-written source file carries the GPL-3.0 header from `tools/templates/`.                                                                                     |

The complete conventions are in [`.instructions/TAURI-SVELTEKIT.md`](../../../.instructions/TAURI-SVELTEKIT.md) and [`CONTRIBUTING.md`](../../../CONTRIBUTING.md).
