🌐 [Português](../../pt-br/concepts/why-oito2_uikit.md) | **English** | 🏠 [Index](../index.md)

---

# Why oito2_uikit

## The problem

oito2 apps are built with two stacks:

| Stack          | Platforms               | Design system                                 |
| -------------- | ----------------------- | --------------------------------------------- |
| Dart + Flutter | Desktop, Android, web   | [oito2_ui](https://github.com/oito2/oito2_ui) |
| Rust           | Desktop only (Tauri v2) | oito2_uikit (this repository)                 |

A user who runs both kinds of app should not be able to tell them apart by their look: the same GTK-style neutral surfaces, the same 34 px desktop controls, the same Material 3 color roles and accents, the same title bars and window buttons, the same strings in English and Brazilian Portuguese.

oito2_uikit gives the Rust apps that visual identity. It ports oito2_ui to Svelte 5 components that run in the Tauri webview, plus two Rust plugins for what a webview cannot do on its own: drawing the window frame and reading the system settings.

oito2_ui stays the **design source of truth**. Visual changes land there first and are ported here; JSON fixtures exported from oito2_ui check that both agree (see [Parity and generators](../architecture/parity-and-generators.md)).

## Why Tauri v2

- **Small binaries.** Tauri uses the system webview (WebKitGTK on Linux, WebView2 on Windows, WKWebView on macOS) instead of bundling a browser engine.
- **A Rust backend.** Native integration — GTK client-side decorations, the window menu, GSettings, the XDG desktop portal, the Windows Runtime, AppKit — is written in Rust, the language of the apps themselves.
- **Least privilege by default.** The webview reaches only the commands a capability grants; the two plugins ship narrow default permission sets (`oito2-window:default`, `oito2-settings:default`).

## Why Svelte 5

- **Design tokens map almost 1:1 to CSS custom properties.** Every token of oito2_ui (radius, spacing, sizes, typography, color roles) becomes a `--oito2-*` variable; a theme is a set of variables on one element.
- **Accessibility through the web platform.** Roles, states and keyboard behavior follow the WAI-ARIA Authoring Practices, and the browser exposes them to the screen reader of each system. The galleries are checked with axe.
- **Fine-grained reactivity without a virtual DOM.** Runes (`$state`, `$derived`) keep component state in small classes, and the compiled output stays small.
- **The same code runs on the web.** The components have no Tauri dependency; the [showcase](https://oito2.github.io/oito2_uikit/) is the same SvelteKit app built for GitHub Pages and for the desktop.

## Trade-offs

These are real costs of the approach, accepted on purpose:

| Trade-off                     | What it means                                                                                                                                                                                                    | How the project handles it                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three webview engines         | The app renders in WebKitGTK, WebView2 (Chromium) or WKWebView depending on the system, so CSS and DOM behavior can differ.                                                                                      | Every component test runs in Chromium and WebKit; a test that passes in only one engine is treated as a bug. A fixed [WebView baseline](glossary.md#webview-baseline) limits which features are used. |
| WebKitGTK is the weakest link | The Linux baseline (WebKitGTK 2.50, for Ubuntu 22.04) lacks some features, such as `field-sizing` and `scrollbar-color`.                                                                                         | Those features are used only as progressive enhancement, with a script fallback, or not needed (`ScrollArea` draws its own scrollbar).                                                                |
| Native look is reproduced     | Buttons, menus and title bars are HTML drawn to look like GNOME, KDE Breeze, Xfwm, COSMIC, Windows or macOS — they are not the toolkit's own widgets. A system theme change does not restyle them automatically. | The plugins read the button layout, accent color and high contrast from the system and the components follow them live. On macOS the real traffic lights are kept.                                    |
| Copyleft license              | oito2_uikit is GPL-3.0; an app that uses it must be distributed under a GPL-compatible license.                                                                                                                  | Stated in every README.                                                                                                                                                                               |

## Alternatives

Other stacks can build good desktop apps; they fit oito2's situation less well:

| Alternative                    | Strength                                                    | Why it was not the choice here                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Electron                       | One bundled Chromium: identical rendering on every system.  | Each app ships its own browser engine and a Node.js backend; the oito2 desktop apps are written in Rust.                                                                                           |
| Flutter for every app          | oito2_ui already exists and renders identically everywhere. | The Rust apps would need a Dart UI layer and a bridge to their Rust core; oito2_uikit keeps them in Rust with a web frontend.                                                                      |
| Native Rust GUIs (Slint, Iced) | No webview; pure Rust.                                      | The whole design system — about 100 components, their accessibility and keyboard behavior — would have to be rebuilt in each toolkit's own model, and there would be no web build of the showcase. |

## Next steps

- [How oito2_uikit works](how-oito2_uikit-works.md) — a conceptual tour.
- [Architecture](architecture.md) — data flow, layout, dependencies and design decisions.
- [Glossary](glossary.md) — the terms used across the documentation.
