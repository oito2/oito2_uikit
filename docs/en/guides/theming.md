🌐 [Português](../../pt-br/guides/theming.md) | **English** | 🏠 [Index](../index.md)

---

# Theming

How to choose the light or dark mode, the accent color, high contrast and a named preset, read the active theme from a component, override tokens with your own CSS, and switch between pointer and touch sizes. Every API on this page comes from `@oito2/ui` unless stated otherwise.

## Table of Contents

- [Setup](#setup)
- [Mode, accent and high contrast](#mode-accent-and-high-contrast)
- [Named presets](#named-presets)
- [Custom themes](#custom-themes)
- [Reading the theme](#reading-the-theme)
- [Overriding tokens and styles](#overriding-tokens-and-styles)
- [Density](#density)
- [Static scheme CSS](#static-scheme-css)

## Setup

Import the stylesheet once and wrap the app in a `ThemeProvider`. The provider renders a `div` that carries the color custom properties, paints the page background and text color, and hosts the overlays (dialogs, menus, popovers), so they keep the theme.

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';

	let { children } = $props();
</script>

<ThemeProvider>
	{@render children()}
</ThemeProvider>
```

`styles.css` contains the bundled Inter font, the tokens, the density variables and the base styles. The color variables are not in it: `ThemeProvider` writes them.

## Mode, accent and high contrast

| Prop           | Type                                               | Default    | Effect                                                                                                                              |
| -------------- | -------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `mode`         | `'light' \| 'dark' \| 'system'`                    | `'system'` | `system` follows `prefers-color-scheme`                                                                                             |
| `accent`       | `AccentColor` or a hex string                      | —          | Without it, the accent of the closest `SystemScope` (the desktop's, see [Desktop integration](./desktop-integration.md)), then blue |
| `highContrast` | `boolean \| 'system'`                              | `'system'` | `system` turns it on when the closest `SystemScope` reports high contrast or `prefers-contrast: more` matches                       |
| `light`        | `ColorTheme` or `({ highContrast }) => ColorTheme` | —          | The theme used in light mode, instead of the base scheme                                                                            |
| `dark`         | `ColorTheme` or `({ highContrast }) => ColorTheme` | —          | The theme used in dark mode, instead of the base scheme                                                                             |

Any other attribute (`class`, `dir`, `data-*`, ...) is passed to the provider's `div`.

```svelte
<ThemeProvider mode="dark" accent="teal" highContrast={false}>
	{@render children()}
</ThemeProvider>
```

The named accents, exported as `accentColors` (and as the `--oito2-accent-*` custom properties):

| Name     | Color     |
| -------- | --------- |
| `blue`   | `#3584E4` |
| `teal`   | `#2190A4` |
| `green`  | `#3A944A` |
| `yellow` | `#C88800` |
| `orange` | `#ED5B00` |
| `red`    | `#E62D42` |
| `pink`   | `#D56199` |
| `purple` | `#9141AC` |
| `slate`  | `#6F8396` |

Any hex color is accepted too (`accent="#7c3aed"`). The base scheme adjusts the accent until white text on it reaches 4.5:1, or 7:1 in high contrast, so the `primary` role can be darker than the color you pass. High contrast also raises text to 7:1 and outlines to 4.5:1.

`accent` only affects the base scheme: when `light` or `dark` supplies a theme (a preset, for example), that theme is used as it is.

## Named presets

`@oito2/ui-themes` provides 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard and Catppuccin). `presetTheme(name)` returns a theme source for the `light` or `dark` prop that keeps high contrast working:

```svelte
<script lang="ts">
	import { ThemeProvider } from '@oito2/ui';
	import { presetTheme } from '@oito2/ui-themes';

	let { children } = $props();
</script>

<ThemeProvider light={presetTheme('catppuccinLatte')} dark={presetTheme('catppuccinMocha')}>
	{@render children()}
</ThemeProvider>
```

Each preset has a fixed brightness (`themePresets[name].isDark`). The showcase lets the user pick either the base scheme or one preset, and pins the mode to the preset's brightness ([`apps/showcase/src/routes/+layout.svelte`](../../../apps/showcase/src/routes/+layout.svelte)):

```svelte
<script lang="ts">
	import { ThemeProvider, type AccentColor } from '@oito2/ui';
	import { presetTheme, themePresets, type ThemePreset } from '@oito2/ui-themes';

	let { children } = $props();

	let scheme: 'base' | ThemePreset = $state('base');
	let chosenMode: 'light' | 'dark' | 'system' = $state('system');
	let accent: AccentColor | 'system' = $state('system');

	// A preset fixes the brightness; the base scheme follows the mode setting.
	let preset = $derived(scheme === 'base' ? null : themePresets[scheme]);
	let mode = $derived(preset ? (preset.isDark ? 'dark' : 'light') : chosenMode);
	let source = $derived(scheme === 'base' ? undefined : presetTheme(scheme));
</script>

<ThemeProvider
	{mode}
	accent={accent === 'system' ? undefined : accent}
	light={source}
	dark={source}
>
	{@render children()}
</ThemeProvider>
```

`themePresetNames` lists every preset name and `themePresets[name].label` its display name, for a picker. The full list is in the [`@oito2/ui-themes` README](../../../packages/ui-themes/README.md).

## Custom themes

`createColorTheme` builds the base scheme from any accent. Pass it as a function to `light`/`dark` so the provider can rebuild it for the contrast it resolves:

```svelte
<script lang="ts">
	import { ThemeProvider, createColorTheme } from '@oito2/ui';

	let { children } = $props();
</script>

<ThemeProvider
	light={({ highContrast }) =>
		createColorTheme({ brightness: 'light', accent: '#7c3aed', highContrast })}
	dark={({ highContrast }) =>
		createColorTheme({ brightness: 'dark', accent: '#7c3aed', highContrast })}
>
	{@render children()}
</ThemeProvider>
```

`colorThemeFromRoles` builds a theme from a full set of role colors; it is what the presets use. Both functions are also exported from `@oito2/ui/theme`, which has no Svelte dependency, for build scripts and theme packages.

## Reading the theme

`useTheme()` returns a live reference to the theme of the closest `ThemeProvider` (or the light base scheme when there is none). Call it during component initialization and read `.current`:

```svelte
<script lang="ts">
	import { Contrast, useTheme } from '@oito2/ui';

	const theme = useTheme();
	let ratio = $derived(
		Contrast.ratio(theme.current.semantic.primaryText, theme.current.background).toFixed(1)
	);
</script>

<p>
	{theme.current.brightness}{theme.current.highContrast ? ', high contrast' : ''} — primary text contrast
	{ratio}:1
</p>
```

| Field          | Contents                                                               |
| -------------- | ---------------------------------------------------------------------- |
| `brightness`   | `'light'` or `'dark'`                                                  |
| `highContrast` | Whether the theme was built for high contrast                          |
| `background`   | The page background                                                    |
| `colorScheme`  | The Material 3 roles (`primary`, `onSurface`, `surfaceContainer`, ...) |
| `semantic`     | `primaryText`, `errorText`, `success`, `warning`, `info`, `link`       |
| `chrome`       | `background`, `sidebar`, `mainbar`, `titleBar`, `dialog`               |
| `syntax`       | The code colors, by role (`keyword`, `string`, `comment`, ...)         |

In CSS, read the same values through the custom properties (`var(--oito2-color-primary-text)`, `var(--oito2-chrome-sidebar)`, `var(--oito2-syntax-keyword)`). The provider's `div` also carries `data-oito2-brightness` (`light`/`dark`) and `data-oito2-contrast` (`normal`/`high`) for selectors. The complete list is in [CSS custom properties](../reference/css-custom-properties.md).

## Overriding tokens and styles

Every rule of `@oito2/ui` sits in the `oito2` cascade layer, so any **unlayered** rule of your app wins, whatever its specificity.

- **Tokens** (spacing, radius, sizes, typography) are declared on `:root`. Redefine them on `:root` or on any element:

  ```css
  :root {
  	--oito2-radius-medium: 4px;
  	--oito2-font-family: 'IBM Plex Sans', sans-serif;
  }
  ```

- **Color variables** are written by `ThemeProvider` as an inline `style` on its `div`, which a stylesheet cannot override on that same element. Set them on an element **inside** the provider:

  ```svelte
  <ThemeProvider>
  	<div class="brand">{@render children()}</div>
  </ThemeProvider>

  <style>
  	.brand {
  		--oito2-color-link: #0b6e4f;
  	}
  </style>
  ```

  The `style` prop of `ThemeProvider` itself is replaced by the theme's variables, so do not use it for overrides.

- **Component styles**: components carry `oito2-*` classes (`oito2-button`, `oito2-file-drop-zone`, ...) and state attributes (`data-variant`, `data-state`, `data-disabled`, ...). An unlayered rule in a global stylesheet wins over the component's own rule:

  ```css
  /* A global, unlayered stylesheet of the app */
  .oito2-button[data-variant='filled'] {
  	text-transform: uppercase;
  }
  ```

Some components read optional custom properties with a fallback, such as `--oito2-navigation-rail-color` or `--oito2-master-detail-pane-color`; they are listed in [CSS custom properties](../reference/css-custom-properties.md#component-custom-properties).

## Density

Controls have two sizes: **pointer** (34 px controls, the default) and **touch** (40 px controls, larger targets). `density.css` (part of `styles.css`) picks them:

| Condition                                                                   | Size    |
| --------------------------------------------------------------------------- | ------- |
| Default                                                                     | pointer |
| `@media (pointer: coarse)` and no `data-oito2-density="pointer"` on `:root` | touch   |
| `data-oito2-density="touch"` on an element                                  | touch   |
| `data-oito2-density="pointer"` on an element                                | pointer |

The attribute applies to the element and everything inside it. The showcase sets it on its `ThemeProvider` from a setting (`auto`, `pointer` or `touch`):

```svelte
<ThemeProvider data-oito2-density={density === 'auto' ? undefined : density}>
	{@render children()}
</ThemeProvider>
```

Components size themselves from the density variables (`--oito2-control-height`, `--oito2-icon-size`, `--oito2-toggle-size`, ...), so your own controls can use them too.

## Static scheme CSS

Two optional stylesheets hold precomputed themes as custom properties, applied with the `data-oito2-scheme` attribute. They are useful for content outside a `ThemeProvider`, or to theme one part of a page differently:

| Import                         | Selectors                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui/schemes.css`        | The base scheme for each brightness and named accent, with a high-contrast variant: `light-blue`, `dark-teal-hc`, ... |
| `@oito2/ui-themes/presets.css` | Every preset and its high-contrast variant: `everforest-light`, `rose-pine-moon`, `catppuccin-mocha-hc`, ...          |

```svelte
<script lang="ts">
	import '@oito2/ui/schemes.css';
</script>

<aside data-oito2-scheme="dark-purple">
	<p style:color="var(--oito2-color-on-surface)">A dark panel with the purple accent.</p>
</aside>
```

`presetSchemeName(preset, { highContrast })` from `@oito2/ui-themes` returns the attribute value of a preset (`presetSchemeName('catppuccinMocha', { highContrast: true })` is `catppuccin-mocha-hc`), for apps that pick the preset at run time.

The attribute only sets the custom properties (and `color-scheme`); paint the background yourself (`var(--oito2-color-background)` or a surface role). The rules are in the `oito2` layer, and each element with the attribute defines its own values, so it also works inside a `ThemeProvider`.

## See also

- [Tokens and themes](../architecture/tokens-and-themes.md) — how the schemes are computed and generated.
- [CSS custom properties](../reference/css-custom-properties.md) — every variable and data attribute.
- [Colors](https://oito2.github.io/oito2_uikit/colors) and [Material theme](https://oito2.github.io/oito2_uikit/material) pages of the showcase.
