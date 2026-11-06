# Documentation — oito2_uikit

🌐 [Português](../pt-br/index.md) | **English** | 🏠 [Back to README](../../README.md)

---

oito2_uikit is a Svelte 5 design system for Tauri v2 desktop apps on Linux, Windows and macOS. It gives Rust apps the same visual identity as the Flutter design system oito2_ui — GTK-style neutrals, a 34 px desktop density, Material 3 color roles, 13 presets and WCAG-checked contrast — with about 100 accessible components, window chrome for every desktop, and Rust plugins that read the system settings. The components also run in any Svelte 5 app on the web, as the [live showcase](https://oito2.github.io/oito2_uikit/) shows.

---

## 🚀 Getting Started

- [Prerequisites](./getting-started/prerequisites.md) — Node.js, pnpm, Rust and the Tauri system packages for each operating system.
- [Installation](./getting-started/installation.md) — adding the packages and plugins to an app, installing the showcase, and building it from source, per operating system.
- [Quickstart](./getting-started/quickstart.md) — the shortest path to a Tauri app with a themed window and the oito2 title bar.
- [Uninstallation](./getting-started/uninstallation.md) — removing the packages from an app and the showcase from a system, including the data it leaves behind.

---

## 🧠 Concepts

- [Why oito2_uikit](./concepts/why-oito2_uikit.md) — the problem it solves, why Tauri v2 and Svelte 5, and the trade-offs.
- [How oito2_uikit works](./concepts/how-oito2_uikit-works.md) — a tour from design tokens to themed components, title bars and system settings.
- [Architecture overview](./concepts/architecture.md) — data flow, package layout, main dependencies and key design decisions.
- [Glossary](./concepts/glossary.md) — the project's terms, from color roles to capabilities.

---

## 🏗️ Architecture (for contributors)

- [Tokens and themes](./architecture/tokens-and-themes.md) — token values, generated CSS, color schemes, high contrast and presets.
- [Interaction primitives](./architecture/interaction-primitives.md) — focus, roving focus, typeahead, dismissal, portals, positioning, collections and shortcuts.
- [Window chrome](./architecture/window-chrome.md) — title bars, window controls, the window controller and the window plugin.
- [System settings](./architecture/system-settings.md) — desktop detection, button layout, accent and high contrast, from Rust to the components.
- [Parity and generators](./architecture/parity-and-generators.md) — the oito2_ui parity fixtures, the CSS and API generators, release scripts and CI.

---

## 🧭 Guides

- [Theming](./guides/theming.md) — modes, accents, presets, high contrast, density and token overrides.
- [Desktop integration](./guides/desktop-integration.md) — system settings, custom title bars and window configuration in a Tauri app.
- [Files](./guides/files.md) — file upload, drop zones and downloads in Tauri and in the browser.
- [Localization](./guides/localization.md) — English and Portuguese strings, overrides, formatting and right-to-left layouts.
- [Workflow examples](./guides/workflows/examples.md) — complete examples assembled from the components.

---

## 📚 Reference

- [Packages](./reference/packages.md) — every package, its entry points, stylesheets and dependencies.
- [Components](./reference/components.md) — every component in the catalogue, with its package and showcase page.
- [CSS custom properties](./reference/css-custom-properties.md) — the `--oito2-*` tokens, color roles and data attributes.
- [Tauri plugins](./reference/tauri-plugins.md) — commands, permissions and events of both Rust plugins.
- [Repository scripts](./reference/repository-scripts.md) — pnpm scripts, Cargo commands and CI workflows.

---

## 🛠️ Troubleshooting

- [Common issues](./troubleshooting/common-issues.md) — errors and their fixes, indexed by symptom.

---

## 🤝 Contributing

- [Contributing guide](../../CONTRIBUTING.md) — development environment, checks and the release process.
- [Code of Conduct](../../CODE_OF_CONDUCT.md) and [Security Policy](../../SECURITY.md).
