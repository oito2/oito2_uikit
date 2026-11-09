# @oito2/ui-themes

The 13 named color presets for `@oito2/ui`: Everforest, Rosé Pine, Nord, Dracula/Alucard and Catppuccin, mapped to complete, WCAG-checked oito2 schemes.

[![npm](https://img.shields.io/npm/v/@oito2/ui-themes?label=npm)](https://www.npmjs.com/package/@oito2/ui-themes)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

## Installation

```bash
pnpm add @oito2/ui-themes @oito2/ui svelte
```

`svelte` (`^5.57.0`) and `@oito2/ui` are peer dependencies. Set up `@oito2/ui` first (its `styles.css` and a `ThemeProvider`).

## Usage

`presetTheme(name)` returns a theme source for `ThemeProvider`'s `light` or `dark` prop. It builds the preset with the contrast the provider resolves, so high contrast keeps working:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';
	import { presetTheme } from '@oito2/ui-themes';

	let { children } = $props();
</script>

<ThemeProvider light={presetTheme('catppuccinLatte')} dark={presetTheme('catppuccinMocha')}>
	{@render children()}
</ThemeProvider>
```

Each preset has a fixed brightness, listed in `themePresets`. To use a single preset regardless of the system preference, pin the mode to it:

```svelte
<script lang="ts">
	import { ThemeProvider } from '@oito2/ui';
	import { presetTheme, themePresets, type ThemePreset } from '@oito2/ui-themes';

	let { children } = $props();
	let preset: ThemePreset = $state('nordDark');
	let source = $derived(presetTheme(preset));
</script>

<ThemeProvider mode={themePresets[preset].isDark ? 'dark' : 'light'} light={source} dark={source}>
	{@render children()}
</ThemeProvider>
```

### Static CSS

`@oito2/ui-themes/presets.css` holds the custom properties of every preset and its high-contrast variant under `[data-oito2-scheme='<name>']` selectors, such as `everforest-light`, `rose-pine-moon`, `catppuccin-mocha` and `catppuccin-mocha-hc`.

```js
import '@oito2/ui-themes/presets.css';
```

## What's inside

| Preset               | Name                  | Brightness |
| -------------------- | --------------------- | ---------- |
| Everforest Light     | `everforestLight`     | light      |
| Everforest Dark      | `everforestDark`      | dark       |
| Rosé Pine            | `rosePine`            | dark       |
| Rosé Pine Moon       | `rosePineMoon`        | dark       |
| Rosé Pine Dawn       | `rosePineDawn`        | light      |
| Nord Dark            | `nordDark`            | dark       |
| Nord Light           | `nordLight`           | light      |
| Dracula              | `dracula`             | dark       |
| Alucard              | `alucard`             | light      |
| Catppuccin Latte     | `catppuccinLatte`     | light      |
| Catppuccin Frappé    | `catppuccinFrappe`    | dark       |
| Catppuccin Macchiato | `catppuccinMacchiato` | dark       |
| Catppuccin Mocha     | `catppuccinMocha`     | dark       |

| Export                                                                     | Purpose                                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `themePresets`, `themePresetNames`, `ThemePreset`                          | Preset names with their display label and `isDark` flag           |
| `presetTheme(preset)`                                                      | Theme source for `ThemeProvider` (`light` / `dark` props)         |
| `presetSchemeName(preset, { highContrast })`                               | The `data-oito2-scheme` value of the preset in `presets.css`      |
| `presetColorTheme(preset, { highContrast })`                               | The complete `ColorTheme`, raised to WCAG AAA with `highContrast` |
| `presetRoles(preset)`                                                      | The role colors mapped from the preset's palette                  |
| `everforestPalettes`, `rosePinePalettes`, `nordPalette`, `draculaPalettes` | The source palettes (Catppuccin comes from `@catppuccin/palette`) |

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
