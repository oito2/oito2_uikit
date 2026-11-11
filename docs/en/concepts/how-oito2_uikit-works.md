🌐 [Português](../../pt-br/concepts/how-oito2_uikit-works.md) | **English** | 🏠 [Index](../index.md)

---

# How oito2_uikit works

This page follows an app from its design tokens to a themed window with a native-looking title bar. Each step links to the page that covers it in depth.

![The oito2_uikit showcase](../../img/showcase.png)

<!-- TODO: capture a screenshot of the showcase main window -->

## 1. Tokens

Everything starts from the design tokens of oito2_ui: corner radii, spacing, control sizes, the nine named accents, the light and dark neutral palettes, the status colors and the type scale. They live in one TypeScript module, `packages/ui/src/lib/tokens/values.ts`, and a generator turns them into CSS custom properties in `tokens.css`:

```css
--oito2-radius-medium: 8px;
--oito2-space-md: 12px;
--oito2-size-button-height: 34px;
--oito2-accent-blue: #3584e4;
```

`density.css` derives the control sizes the components read (`--oito2-control-height`, `--oito2-icon-size`…): pointer sizes by default, touch sizes under a coarse pointer or `data-oito2-density="touch"`.

See [Tokens and themes](../architecture/tokens-and-themes.md).

## 2. Color schemes

A color scheme (`ColorTheme`) is computed in TypeScript from a brightness, an accent and a contrast level:

- `createColorTheme({ brightness, accent, highContrast })` builds the **base scheme**: GTK-style neutrals with the accent as the primary hue, plus the Material 3 roles seeded from the accent.
- `colorThemeFromRoles(roles)` builds a scheme from the few role colors a theme family publishes; `@oito2/ui-themes` uses it for its 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard, Catppuccin).

Either way, text, outline, semantic and syntax colors are raised until they reach WCAG AA (AAA with high contrast) against every surface of the scheme.

## 3. ThemeProvider

`ThemeProvider` turns the scheme into CSS. It renders a `div` that carries every color as a custom property (`--oito2-color-primary`, `--oito2-chrome-title-bar`, `--oito2-syntax-keyword`…), so everything inside it is themed:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';

	let { children } = $props();
</script>

<ThemeProvider mode="system" accent="blue">
	{@render children()}
</ThemeProvider>
```

By default it follows the system: light or dark from `prefers-color-scheme`, the accent and high contrast from the closest `SystemScope`, and `prefers-contrast: more`.

![The showcase in dark mode](../../img/showcase-dark.png)

<!-- TODO: capture a screenshot of the showcase in dark mode -->

![The showcase in high contrast](../../img/showcase-high-contrast.png)

<!-- TODO: capture a screenshot of the showcase with high contrast on -->

## 4. Components

The components read the tokens and the theme only through `var(--oito2-…)`. All their rules sit in the `oito2` cascade layer, so an app's own unlayered CSS always wins. Behavior — roles, keyboard, focus, dismissal — follows the WAI-ARIA Authoring Practices and is built on shared internal primitives (focus scope, roving focus, typeahead, dismissable layer, floating positioning). See [Interaction primitives](../architecture/interaction-primitives.md).

Every component follows the same two prop contracts:

- **Values and open states.** A component with a value or an open state takes it as a prop (`value`, `checked`, `open`, `page`…) that can be bound, its starting value as `default<Name>` when the parent doesn't control it, and reports every change through `on<Name>Change`. Bind the prop to keep the value in sync; a value passed without `bind:` changes inside the component until the parent passes a new one, and every change is reported.
- **HTML attributes.** Attributes and event handlers the component doesn't name reach its main element. A consumer's handler runs before the component's own handler of the same event, and calling `preventDefault()` in it cancels the component's behavior; `class` and `style` are joined with the component's.

## 5. Overlays and the Portal

Dialogs, menus, popovers, tooltips and selects must escape the clipping and stacking of the element that opens them. They render through an internal `Portal` into a host element that the closest `ThemeProvider` places at the end of its own `div`. Because the host is inside the themed `div`, overlays keep the theme's custom properties; they are positioned with `position: fixed` (anchored overlays through `@floating-ui/dom`). Without a `ThemeProvider` the portal falls back to `document.body`.

## 6. System settings: SystemScope and SystemSettingsScope

Components that adapt to the operating system read a `SystemSettings` object from the closest `SystemScope`:

| Field                | Example                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `platform`           | Linux, Windows or macOS; web or native                            |
| `desktopEnvironment` | `gnome`, `kde`, `xfce`, `cosmic`… (Linux only)                    |
| `windowControlStyle` | `gnome`, `breeze`, `xfwm`, `cosmic`, `windows`, `macos` or `none` |
| `windowButtonLayout` | Which window buttons go on which side, in order                   |
| `accentColor`        | The system accent as hex, or `null`                               |
| `highContrast`       | Whether the system asks for high contrast                         |

Without a scope, components use `fallbackSystemSettings`, derived from the platform alone. In a Tauri app, `SystemSettingsScope` from `@oito2/ui-settings` fills the scope with the real values read by `tauri-plugin-oito2-settings`, and keeps them up to date. Placed outside the `ThemeProvider`, it makes the theme follow the system accent and contrast too:

```svelte
<SystemSettingsScope>
	<ThemeProvider>
		{@render children()}
	</ThemeProvider>
</SystemSettingsScope>
```

See [System settings](../architecture/system-settings.md).

## 7. Window chrome: WindowScope and the title bars

Desktop apps usually replace the system title bar with their own (client-side decorations). The title bars of `@oito2/ui` — `HeaderBar`, `WindowTitleBar`, `TitleBar`, `DialogTitleBar` — draw the window buttons in the style and layout that the `SystemScope` reports, and talk to the window through a `WindowController` provided by `WindowScope`:

- in Tauri, `initWindow()` from `@oito2/ui-window` returns a `NativeWindowController` that minimizes, maximizes, closes, drags and resizes the real window and opens the native window menu;
- in a browser, `initWindow()` returns `null` and the title bars show no working window controls.

The six window control styles:

![GNOME-style title bar](../../img/title-bar-gnome.png)

<!-- TODO: capture a screenshot of a title bar in the gnome style -->

![KDE Breeze-style title bar](../../img/title-bar-breeze.png)

<!-- TODO: capture a screenshot of a title bar in the breeze style -->

![Xfwm-style title bar](../../img/title-bar-xfwm.png)

<!-- TODO: capture a screenshot of a title bar in the xfwm style -->

![COSMIC-style title bar](../../img/title-bar-cosmic.png)

<!-- TODO: capture a screenshot of a title bar in the cosmic style -->

![Windows-style title bar](../../img/title-bar-windows.png)

<!-- TODO: capture a screenshot of a title bar in the windows style -->

![macOS title bar with the native traffic lights](../../img/title-bar-macos.png)

<!-- TODO: capture a screenshot of a title bar on macOS with the traffic lights -->

See [Window chrome](../architecture/window-chrome.md).

## 8. The Rust plugins

Two Tauri v2 plugins do what the webview cannot:

| Plugin                        | Commands and events                                          | Webview side         |
| ----------------------------- | ------------------------------------------------------------ | -------------------- |
| `tauri-plugin-oito2-window`   | `set_decoration_mode`, `decoration_mode`, `show_window_menu` | `@oito2/ui-window`   |
| `tauri-plugin-oito2-settings` | `read_settings`, event `oito2-settings://changed`            | `@oito2/ui-settings` |

The plugins return raw values; the TypeScript packages turn them into what the components need. Each plugin's permissions are listed in its README and in [Tauri plugins](../reference/tauri-plugins.md).

## Putting it together

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { HeaderBar, ThemeProvider, WindowScope } from '@oito2/ui';
	import { SystemSettingsScope } from '@oito2/ui-settings';
	import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';
	import { onMount } from 'svelte';

	let { children } = $props();
	let controller: NativeWindowController | null = $state(null);

	onMount(() => {
		void initWindow().then((value) => (controller = value));
		return () => controller?.dispose();
	});
</script>

<SystemSettingsScope>
	<ThemeProvider>
		<WindowScope {controller}>
			<HeaderBar title="My app" />
			{@render children()}
			<WindowResizeHandles {controller} />
		</WindowScope>
	</ThemeProvider>
</SystemSettingsScope>
```

The [Quickstart](../getting-started/quickstart.md) walks through a complete setup, including the Rust side and the capability.
