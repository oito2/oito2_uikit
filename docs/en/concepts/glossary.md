🌐 [Português](../../pt-br/concepts/glossary.md) | **English** | 🏠 [Index](../index.md)

---

# Glossary

Terms used across the oito2_uikit documentation and code, in alphabetical order.

### Accent

The hue a scheme uses for its primary color. `@oito2/ui` names nine accents from the GNOME accent palette — `blue` (the default), `teal`, `green`, `yellow`, `orange`, `red`, `pink`, `purple` and `slate` (`accentColors`, also `--oito2-accent-<name>`) — and `ThemeProvider` also accepts any hex color. Without an `accent` prop it uses the system accent from the `SystemScope`, then blue.

### Attachment

A Svelte 5 function applied to an element with `{@attach …}`. oito2_uikit writes every reusable behavior as an attachment instead of a `use:` action: the public `focusBorder`, `edgeFocus`, `draggable` and `undershoot`, and the internal `focusScope`, `rovingFocus`, `dismissableLayer` and `floating`.

### Button layout

The order and side of the window buttons (minimize, maximize, close) in a title bar: `WindowButtonLayout`, with `leading` and `trailing` lists. It is parsed from each desktop's own setting (GNOME's `button-layout` string, KWin's `ButtonsOnLeft`/`ButtonsOnRight` letters, Xfwm's `button_layout`, COSMIC's flags) or taken from `WindowButtonLayout.defaultFor(style)`.

### Capability

A Tauri v2 file in `src-tauri/capabilities/` that grants permissions to windows by label. A webview can call only the commands its capability grants. The showcase's `main-capability` grants the core window actions, `oito2-window:default`, `oito2-settings:default` and the dialog and file permissions of `@oito2/ui-files`.

### Catalog

The `catalog:` section of `pnpm-workspace.yaml`, where every npm dependency version is declared once; package manifests refer to it with `"catalog:"`.

### Changeset

A Markdown file in `.changeset/`, created with `pnpm changeset`, that records a user-facing change and its bump (`patch`, `minor`, `major`). `pnpm release:version` applies the pending changesets. All `@oito2/*` packages form one fixed group, so they always share a version.

### Chrome colors

The structural window colors of a scheme: `background`, `sidebar`, `mainbar`, `titleBar` and `dialog` (`ChromeColors`), exposed as `--oito2-chrome-<surface>`. Adjacent chrome surfaces differ by at least `chromeMinimumStep` (1.04:1).

### Color role

A named color of a scheme. The Material 3 roles (`primary`, `onSurface`, `surfaceContainerHigh`…) are exposed as `--oito2-color-<role>` in kebab-case, next to `background`, the semantic colors and the component colors. Text uses the text-safe roles (`on-surface`, `on-surface-variant`, `primary-text`, `error-text`, the status colors); `primary` and `error` are fills.

Also: the **role colors** (`ColorRoles`) a theme family publishes — `background`, `card`, `foreground`, `primary`, `secondary`, `mutedForeground`, `destructive`, `border`, `success`, `warning`, `info` and `syntax` — from which `colorThemeFromRoles` derives a complete scheme.

### Compound component

A component made of parts, exported as a namespace: `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. `Root` creates the state and publishes it with `setContext`; the parts read it. Opposite of an **atomic component** (`Button`, `Switch`), a single file exported by name.

### Controllable state

A component value that can be controlled by the parent (`bind:value`, `bind:open`, `bind:checked`, or a value plus an `on<Name>Change` callback) or left uncontrolled (the component keeps it, starting from `default<Name>`). Implemented by the internal `Controllable` class.

### CSD (client-side decorations)

The app draws its own title bar and window buttons instead of the system's. On Linux the `gtk-headerless` decoration mode uses GTK's client-side decorations with an empty title bar, so GTK keeps the shadow and the resize edges while the webview draws the bar.

### Decoration mode

How `tauri-plugin-oito2-window` frames a window: `native` (system frame; default on macOS), `undecorated` (no system frame; default on Windows) or `gtk-headerless` (GTK CSD with an empty title bar; default on Linux, `undecorated` elsewhere).

### Density

The control size set: **pointer** (34 px controls, the default) or **touch** (40 px controls, 48 px targets). Touch sizes apply under `@media (pointer: coarse)` or inside `[data-oito2-density='touch']`; `[data-oito2-density='pointer']` forces pointer sizes. Components read the density variables of `density.css` (`--oito2-control-height`, `--oito2-icon-size`…).

### Desktop environment

The Linux desktop the app runs in, detected from `XDG_CURRENT_DESKTOP` (first recognized entry) and then `DESKTOP_SESSION`: `gnome`, `kde`, `xfce`, `budgie`, `cosmic`, `cinnamon`, `mate`, `lxqt`, `pantheon`, `unity` or `unknown`. It is `null` outside native Linux.

### Drag region

The empty parts of a title bar that move the window: the bar itself and descendants marked with `data-oito2-drag-region`. `titleBarGestures` makes pressing them drag the window, double-clicking them maximize or restore it, and the secondary button open the window menu.

### Guest package

The npm package that is the webview side of a Rust plugin: `@oito2/ui-window` for `tauri-plugin-oito2-window`, `@oito2/ui-settings` for `tauri-plugin-oito2-settings`. Each wraps the plugin's commands in typed functions.

### High contrast

A scheme variant whose text and semantic colors reach 7:1 (WCAG AAA) and outlines 4.5:1, instead of 4.5:1 and 3:1. `ThemeProvider` turns it on from the system (`SystemSettings.highContrast` or `prefers-contrast: more`) or from its `highContrast` prop. Static CSS names high-contrast schemes with a `-hc` suffix.

### Parity fixture

A JSON file exported from oito2_ui by the Flutter tests in `tools/parity` and committed under `packages/*/src/fixtures/parity/` (in `ui`, `ui-syntax` and `ui-extras`). The Vitest suites assert that oito2_uikit produces the same values.

### Permission

A Tauri v2 identifier that allows or denies one command (`oito2-settings:allow-read-settings`) or bundles several (`oito2-window:default`). Permissions are granted to windows through capabilities.

### Portal

The internal component that renders overlays (dialogs, menus, popovers, tooltips, toasts) somewhere else in the document: into the host element of the closest `ThemeProvider`, or `document.body` without one. The content keeps the contexts of the place where it is used.

### Preset

One of the 13 named color themes of `@oito2/ui-themes`: Everforest Light/Dark, Rosé Pine, Rosé Pine Moon, Rosé Pine Dawn, Nord Dark/Light, Dracula, Alucard and Catppuccin Latte/Frappé/Macchiato/Mocha. Each has a fixed brightness and a high-contrast variant.

### Raw settings

`RawSettings`, what `tauri-plugin-oito2-settings` reports: session variables, GSettings values, values from the desktop configuration files, the system accent and the high-contrast flag. `composeSystemSettings` turns it into `SystemSettings`.

### Scheme

A complete, resolved set of colors (`ColorTheme`): brightness, contrast level, background, the Material `colorScheme`, and the `semantic`, `chrome` and `syntax` colors. Built by `createColorTheme` (the **base scheme**) or `colorThemeFromRoles` (presets). `schemes.css` precomputes the 36 base schemes as `[data-oito2-scheme='light-blue']`-style selectors.

### Semantic colors

Text-safe accent and status colors of a scheme: `primaryText`, `errorText`, `success`, `warning`, `info` and `link`, exposed as `--oito2-color-primary-text` and so on.

### Syntax roles

The token colors of a code block: `foreground`, `comment`, `keyword`, `string`, `number`, `function`, `type`, `tag`, `attribute`, `constant` and `invalid`, exposed as `--oito2-syntax-<role>`.

### SystemScope

The component that provides `SystemSettings` (platform, desktop environment, window control style, button layout, accent, high contrast) to the components below it; read with `useSystemSettings()`. Without one, components use `fallbackSystemSettings(Platform.current())`. `SystemSettingsScope` from `@oito2/ui-settings` is a `SystemScope` fed by the Rust plugin.

### ThemeProvider

The component that applies a scheme: it renders a `div` with the scheme's custom properties, provides the theme to `useTheme()` and hosts the overlay portal at its end.

### Token

A design value of oito2: a radius, spacing step, size, accent, neutral or status color, or text style. Token values live only in `packages/ui/src/lib/tokens/values.ts`; `tokens.css` is generated from it as `--oito2-*` custom properties.

### WebView baseline

The oldest webview each supported system must handle: WebKitGTK 2.50 on Linux, WebView2 Evergreen on Windows, Safari/WebKit 26 on macOS. Every CSS, DOM and JavaScript feature a library uses must work on the whole baseline.

### Window control style

The look of the window buttons: `gnome`, `breeze` (KDE), `xfwm` (Xfce), `cosmic`, `windows`, `macos` (traffic lights) or `none` (web and touch platforms). `resolveWindowControlStyle` picks it from the platform and the desktop environment; Linux desktops without their own style use `gnome`.

### WindowScope

The component that provides a `WindowController` to the title bars below it. In Tauri the controller is the `NativeWindowController` returned by `initWindow()`; in a browser it is `null` and the title bars show no working window controls.
