🌐 [Português](../../pt-br/reference/packages.md) | **English** | 🏠 [Index](../index.md)

---

# Packages

Every package and crate of the repository: what it contains, its entry points, its dependencies and what it needs from Tauri. All published npm packages and both crates share one version. Version ranges written `catalog:` in the manifests are resolved from the `catalog` of `pnpm-workspace.yaml` when a package is packed; the versions below are the current catalog entries.

## Summary

| Package                       | Kind  | Published              | Contents                                                                 |
| ----------------------------- | ----- | ---------------------- | ------------------------------------------------------------------------ |
| `@oito2/ui`                   | npm   | Yes                    | Tokens, themes, window chrome, interaction primitives and the components |
| `@oito2/ui-themes`            | npm   | Yes                    | The 13 named color presets                                               |
| `@oito2/ui-syntax`            | npm   | Yes                    | Syntax highlighting (highlight.js) and `CodeBlock`                       |
| `@oito2/ui-extras`            | npm   | Yes                    | QR code, signature pad, image cropper, navigation menu                   |
| `@oito2/ui-files`             | npm   | Yes                    | File upload, drop zone and download, for Tauri and the browser           |
| `@oito2/ui-window`            | npm   | Yes                    | Guest side of `tauri-plugin-oito2-window`                                |
| `@oito2/ui-settings`          | npm   | Yes                    | Guest side of `tauri-plugin-oito2-settings`                              |
| `tauri-plugin-oito2-window`   | crate | Git tag, not crates.io | Window frame (decorations) and native window menu                        |
| `tauri-plugin-oito2-settings` | crate | Git tag, not crates.io | Desktop environment, button layout, accent and high contrast             |
| `@oito2/ui-test-utils`        | npm   | No (`private`)         | Test helpers shared by the packages                                      |
| `@oito2/showcase`             | app   | No (`private`)         | The showcase, as a Tauri app and a static web build                      |
| `oito2-uikit-showcase`        | crate | No (`publish = false`) | The showcase's Tauri crate                                               |

The first release will be `v0.1.0`; it has not been published yet.

## Common to every npm package

| Field             | Value                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| License           | `GPL-3.0-only`                                                                        |
| Module type       | ES modules (`"type": "module"`), built from `src/lib` into `dist` by `svelte-package` |
| Export conditions | `types`, `svelte` and `default` on every JavaScript entry point                       |
| `sideEffects`     | `["**/*.css"]` — only CSS imports have side effects                                   |
| Peer dependency   | `svelte` `^5.57.0`                                                                    |

## `@oito2/ui`

The design system: tokens, color themes, the theme and locale providers, window chrome, interaction primitives, collections, shortcuts and about 100 components. It has no Tauri dependency and runs in any browser.

| Entry point             | File                      | Contents                                                                                                |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@oito2/ui`             | `dist/index.js`           | Every component and helper                                                                              |
| `@oito2/ui/icons`       | `dist/icons/index.js`     | Every Lucide icon re-exported from `@lucide/svelte`, plus `freedesktopIcon` / `freedesktopIcons`        |
| `@oito2/ui/theme`       | `dist/theme/index.js`     | The color scheme functions without Svelte (no `svelte` condition), for build scripts and theme packages |
| `@oito2/ui/styles.css`  | `dist/styles/styles.css`  | `fonts.css` + `tokens.css` + `density.css` + `base.css` — the usual single import                       |
| `@oito2/ui/fonts.css`   | `dist/styles/fonts.css`   | The Inter variable font (OFL-1.1), bundled                                                              |
| `@oito2/ui/tokens.css`  | `dist/styles/tokens.css`  | The `--oito2-*` design tokens                                                                           |
| `@oito2/ui/density.css` | `dist/styles/density.css` | Pointer and touch control sizes                                                                         |
| `@oito2/ui/base.css`    | `dist/styles/base.css`    | Border-box sizing, body typography, focus-border and undershoot styles                                  |
| `@oito2/ui/schemes.css` | `dist/styles/schemes.css` | Precomputed base schemes under `[data-oito2-scheme]` selectors (not in `styles.css`)                    |

| Runtime dependency                   | Version | Used for                 |
| ------------------------------------ | ------- | ------------------------ |
| `@floating-ui/dom`                   | 1.8.0   | Positioning overlays     |
| `@lucide/svelte`                     | 1.59.0  | Icons                    |
| `@material/material-color-utilities` | 0.4.0   | Material 3 color schemes |

Tauri: none. An app that renders `@oito2/ui` on a Node server (SSR) must add `@material/material-color-utilities` to `ssr.noExternal`; client-only apps such as Tauri SPAs need nothing. See the [`@oito2/ui` README](../../../packages/ui/README.md).

## `@oito2/ui-themes`

| Entry point                    | File               | Contents                                                                                                  |
| ------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-themes`             | `dist/index.js`    | `presetTheme`, `presetColorTheme`, `presetRoles`, `themePresets`, `themePresetNames`, the source palettes |
| `@oito2/ui-themes/presets.css` | `dist/presets.css` | Every preset and its high-contrast variant under `[data-oito2-scheme]` selectors                          |

Runtime dependencies: `@oito2/ui` (same version), `@catppuccin/palette` 1.8.0. Tauri: none. See the [README](../../../packages/ui-themes/README.md).

## `@oito2/ui-syntax`

| Entry point                  | File                    | Contents                                                                                        |
| ---------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `@oito2/ui-syntax`           | `dist/index.js`         | `CodeBlock`, `Highlighter`, `defaultLanguages`, `HighlighterTheme`, `roleOfScope`, `scopeRoles` |
| `@oito2/ui-syntax/fonts.css` | `dist/styles/fonts.css` | The JetBrains Mono variable font (OFL-1.1), optional                                            |

Runtime dependencies: `@oito2/ui`, `highlight.js` 11.12.0. Tauri: none. See the [README](../../../packages/ui-syntax/README.md).

## `@oito2/ui-extras`

| Entry point        | File            | Contents                                                                                                                    |
| ------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-extras` | `dist/index.js` | `QrCode`, `SignaturePad`, `SignatureController`, `ImageCropper`, `CropPreview`, `CropController`, `NavigationMenu`, helpers |

Runtime dependencies: `@oito2/ui`, `@lucide/svelte` 1.59.0, `qrcode-generator` 2.0.4. Tauri: none. See the [README](../../../packages/ui-extras/README.md).

## `@oito2/ui-files`

| Entry point       | File            | Contents                                                                                                            |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-files` | `dist/index.js` | `FileUpload`, `FileUploadController`, `FileDropZone`, `DownloadTrigger`, `Downloads`, the adapters and file helpers |

Runtime dependencies: `@oito2/ui`, `@lucide/svelte` 1.59.0, `@tauri-apps/api` 2.12.4, `@tauri-apps/plugin-dialog` 2.8.3, `@tauri-apps/plugin-fs` 2.7.1. The Tauri modules are loaded only inside Tauri.

Tauri: the official `tauri-plugin-dialog` and `tauri-plugin-fs` crates, registered in the Builder, and the permissions `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file`, `fs:allow-write-file`. See [Files](../guides/files.md) and the [README](../../../packages/ui-files/README.md).

## `@oito2/ui-window`

| Entry point        | File            | Contents                                                                                                               |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-window` | `dist/index.js` | `initWindow`, `NativeWindowController`, `WindowResizeHandles`, `setDecorationMode`, `decorationMode`, `showWindowMenu` |

Runtime dependencies: `@oito2/ui`, `@tauri-apps/api` 2.12.4.

Tauri: the `tauri-plugin-oito2-window` crate with `oito2-window:default`, plus `core:window:allow-minimize`, `-toggle-maximize`, `-close`, `-start-dragging` and `-start-resize-dragging` for the title bar. Outside Tauri `initWindow()` returns `null`. See [Desktop integration](../guides/desktop-integration.md) and the [README](../../../packages/ui-window/README.md).

## `@oito2/ui-settings`

| Entry point          | File            | Contents                                                                                                                                             |
| -------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-settings` | `dist/index.js` | `SystemSettingsScope`, `loadSystemSettings`, `composeSystemSettings`, `sameSystemSettings`, `tauriSettingsSource`, `settingsChangedEvent`, raw types |

Runtime dependencies: `@oito2/ui`, `@tauri-apps/api` 2.12.4.

Tauri: the `tauri-plugin-oito2-settings` crate with `oito2-settings:default`; `core:default` covers the change event. Outside Tauri the scope keeps the platform defaults. See the [README](../../../packages/ui-settings/README.md).

## `tauri-plugin-oito2-window` and `tauri-plugin-oito2-settings`

| Field              | Value                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| Source             | `git = "https://github.com/oito2/oito2_uikit", tag = "vX.Y.Z"` (not on crates.io)    |
| Edition / MSRV     | Rust 2024, `rust-version = "1.90"`                                                   |
| `tauri`            | 2.12                                                                                 |
| Plugin name        | `oito2-window` / `oito2-settings` (permission prefix and `plugin:<name>\|<command>`) |
| Linux dependency   | `gtk` 0.18 (both)                                                                    |
| Windows dependency | `windows` 0.62 (both)                                                                |
| macOS dependency   | `objc2-app-kit` 0.3 (settings only)                                                  |

Their commands, permissions and events are in [Tauri plugins](./tauri-plugins.md).

## Private packages

| Package                | Path                      | Notes                                                                                         |
| ---------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| `@oito2/ui-test-utils` | `packages/ui-test-utils`  | `"private": true`, ignored by Changesets; its entry point currently exports nothing           |
| `@oito2/showcase`      | `apps/showcase`           | `"private": true`, ignored by Changesets; the release ships its installers, not the package   |
| `oito2-uikit-showcase` | `apps/showcase/src-tauri` | `publish = false`; binary `oito2-uikit-showcase`, identifier `io.github.oito2.uikit-showcase` |

## See also

- [Components](./components.md) — which package each component comes from.
- [Repository scripts](./repository-scripts.md) — the build, check and release commands.
- [Installation](../getting-started/installation.md)
