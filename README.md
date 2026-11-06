# oito2_uikit

A Svelte 5 design system for Tauri v2 desktop apps on Linux, Windows and macOS, with the same visual identity as [oito2_ui](https://github.com/oito2/oito2_ui) for Flutter, plus Rust plugins for native window chrome and system settings.

[![CI](https://github.com/oito2/oito2_uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/oito2/oito2_uikit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@oito2/ui?label=%40oito2%2Fui)](https://www.npmjs.com/package/@oito2/ui)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte)](https://svelte.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri)](https://v2.tauri.app)
[![License](https://img.shields.io/github/license/oito2/oito2_uikit?label=license)](LICENSE)

🌐 **Language:** English · [Português](docs/pt-br/leiame.md)

## Table of Contents

- [Overview](#overview)
- [Prerequisites & Quick Installation](#prerequisites--quick-installation)
- [Updating](#updating)
- [Documentation](#documentation)
- [License](#license)

## Overview

oito2 apps are written in Dart + Flutter (desktop, Android, web) and in Rust (desktop only). oito2_uikit gives the Rust apps, built on Tauri v2, the same look as the Flutter ones: GTK-style neutrals, a 34 px desktop density, Material 3 color roles, 13 named presets and WCAG-checked contrast. oito2_ui stays the design source of truth, and parity fixtures exported from it are checked in CI.

What it offers:

- **About 100 components** — buttons, entries, pickers, menus, dialogs, tabs, tables, trees, toasts, a command palette and more — with keyboard and screen reader behavior following the WAI-ARIA Authoring Practices, tested with axe in Chromium and WebKit.
- **Window chrome** — title bars and window controls in six styles (GNOME, Breeze, Xfwm, COSMIC, Windows, macOS), client-side decorations on Linux and Windows, native traffic lights on macOS.
- **System integration** — desktop environment detection, window button layout, accent color and high contrast read from the system and followed live.
- **Themes** — light, dark and high contrast schemes from any accent, and 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard, Catppuccin).
- **Optional packages** — syntax highlighting, QR codes, a signature pad, an image cropper, and file upload/download for Tauri and the browser.
- **Works without Tauri** — the components run in any Svelte 5 app; the [showcase](https://oito2.github.io/oito2_uikit/) is the same app built for the web.

oito2_uikit is licensed under the GPL-3.0: an app that uses it must be distributed under a GPL-compatible license.

![The oito2_uikit showcase](docs/img/showcase.png)

<!-- TODO: capture a screenshot of the showcase main window -->

### Packages

| Package                                                              | Contents                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`@oito2/ui`](packages/ui)                                           | Tokens, themes, window chrome, interaction primitives and the components  |
| [`@oito2/ui-themes`](packages/ui-themes)                             | The 13 named color presets                                                |
| [`@oito2/ui-syntax`](packages/ui-syntax)                             | Syntax highlighting (highlight.js) and a code block                       |
| [`@oito2/ui-extras`](packages/ui-extras)                             | QR code, signature pad, image cropper, navigation menu                    |
| [`@oito2/ui-files`](packages/ui-files)                               | File upload, drop zone and download, for Tauri and the browser            |
| [`@oito2/ui-window`](packages/ui-window)                             | Native window integration (guest side of `tauri-plugin-oito2-window`)     |
| [`@oito2/ui-settings`](packages/ui-settings)                         | System settings integration (guest side of `tauri-plugin-oito2-settings`) |
| [`tauri-plugin-oito2-window`](plugins/tauri-plugin-oito2-window)     | Rust: decorations, window menu                                            |
| [`tauri-plugin-oito2-settings`](plugins/tauri-plugin-oito2-settings) | Rust: desktop environment, button layout, accent, high contrast           |

## Prerequisites & Quick Installation

### Supported systems

| OS      | Status    | Minimum version / distributions                                         | WebView                |
| ------- | --------- | ----------------------------------------------------------------------- | ---------------------- |
| Linux   | Supported | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, current Fedora | WebKitGTK 2.50+        |
| Windows | Supported | Windows 10 22H2 and Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Supported | macOS 14 Sonoma and later                                               | WKWebView (Safari 26+) |

On Linux, apps need the WebKitGTK 4.1 runtime (`libwebkit2gtk-4.1-0` on Debian/Ubuntu, `webkit2gtk4.1` on Fedora), which Tauri itself requires.

### Requirements

- Node.js 24+ and pnpm (or npm).
- A Svelte 5 app; for desktop builds, a Tauri v2 project and its [system prerequisites](https://v2.tauri.app/start/prerequisites/).

The [installation guide](docs/en/getting-started/installation.md) covers every system in detail, and the [quickstart](docs/en/getting-started/quickstart.md) builds a complete app.

### Add the components

```bash
pnpm add @oito2/ui
```

Import the styles once and wrap the app in a `ThemeProvider`:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { Button, ThemeProvider } from '@oito2/ui';

	let { children } = $props();
</script>

<ThemeProvider mode="system" accent="blue">
	<Button variant="tonal">Hello</Button>
	{@render children()}
</ThemeProvider>
```

### Add native integration (Tauri)

```bash
pnpm add @oito2/ui-window @oito2/ui-settings
```

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

```rust
// src-tauri/src/lib.rs
tauri::Builder::default()
    .plugin(tauri_plugin_oito2_window::init())
    .plugin(tauri_plugin_oito2_settings::init())
```

Then grant `oito2-window:default` and `oito2-settings:default` in the window's capability. Each package README covers its setup in detail.

### Try the showcase

Open the [web showcase](https://oito2.github.io/oito2_uikit/), or download the desktop showcase for your system from the [latest release](https://github.com/oito2/oito2_uikit/releases/latest). The installers are not code-signed; check them against `SHA256SUMS`.

## Updating

Every package and crate shares one version.

```bash
pnpm update "@oito2/*" --latest
```

For the Rust plugins, change `tag = "vX.Y.Z"` in `Cargo.toml` to the new release and run `cargo update -p tauri-plugin-oito2-window -p tauri-plugin-oito2-settings`. Keep the npm packages and the crates on the same version. The changes of each release are in the package `CHANGELOG.md` files and on the [releases page](https://github.com/oito2/oito2_uikit/releases). Removing the packages and the showcase is covered in [Uninstallation](docs/en/getting-started/uninstallation.md).

## Documentation

- [Documentation site](docs/en/index.md) — the full guide: [installation](docs/en/getting-started/installation.md), [quickstart](docs/en/getting-started/quickstart.md), [architecture](docs/en/concepts/architecture.md), [guides](docs/en/guides/theming.md), [reference](docs/en/reference/components.md) and [troubleshooting](docs/en/troubleshooting/common-issues.md).
- [Live showcase](https://oito2.github.io/oito2_uikit/) — every component, with examples, source and API reference.
- Package READMEs — setup and usage of each package (see the [table above](#packages)).
- [Contributing](CONTRIBUTING.md) — development environment, checks and the release process.
- [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).

## License

GPL-3.0 — see [LICENSE](LICENSE).
