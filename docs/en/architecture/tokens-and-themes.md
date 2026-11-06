🌐 [Português](../../pt-br/architecture/tokens-and-themes.md) | **English** | 🏠 [Index](../index.md)

---

# Tokens and themes

How design values become CSS: the token module, the CSS generator, the stylesheets, the color scheme functions, `ThemeProvider` and the presets of `@oito2/ui-themes`. For how to use them in an app, see the [Theming guide](../guides/theming.md); for every variable, see [CSS custom properties](../reference/css-custom-properties.md).

## Overview

```text
packages/ui/src/lib/tokens/values.ts          (single source, no imports)
        │
        ├─► tools/generate-css ─► styles/tokens.css      (--oito2-radius-*, -space-*, -size-*, -accent-*, -font-*, -type-*)
        │
        └─► theme/color-theme.ts (createColorTheme, colorThemeFromRoles)
                │
                ├─► tools/generate-css ─► styles/schemes.css          (36 base schemes)
                ├─► ui-themes presets  ─► tools/generate-css ─► presets.css (13 presets × 2 contrasts)
                └─► ThemeProvider (run time) ─► inline custom properties on its div
```

## The token module

`packages/ui/src/lib/tokens/values.ts` holds every token value and nothing else. It has **no imports**, so the generator, the theme code and the tests can load it anywhere. It exports:

| Export            | Contents                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `radius`          | `check` 4, `small` 6, `medium` 8, `large` 12, `window` 14                                                                                                                                   |
| `spacing`         | `xxs` 2, `xs` 4, `sm` 8, `md` 12, `lg` 16, `page` 20, `xl` 24, `xxl` 32, `xxxl` 48                                                                                                          |
| `sizes`           | Button heights (34 pointer, 40 touch), title bar (46) and its items (34), icon (20), progress (6), focus ring (2), window controls (24, Windows 46), minimum targets (24 pointer, 48 touch) |
| `accentColors`    | The nine named accents of the GNOME palette; `defaultAccent` is `blue`                                                                                                                      |
| `neutralPalettes` | GTK-style light and dark neutrals: surfaces, title bar, text and outlines                                                                                                                   |
| `statusPalettes`  | Light and dark `success`, `warning`, `error`, `info`, `link`                                                                                                                                |
| `typography`      | The bundled Inter family, its system fallbacks, the emphasis weight (600) and the Material 2021 type scale                                                                                  |

All values are in CSS pixels and must equal oito2_ui's: `values.test.ts` compares them with `fixtures/parity/tokens.json`.

## Stylesheets

| File          | Generated | Contents                                                                                                                                                                |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`  | Yes       | The token custom properties on `:root`                                                                                                                                  |
| `schemes.css` | Yes       | Every base scheme under `[data-oito2-scheme='<brightness>-<accent>']`, plus a `-hc` variant: 2 × 9 × 2 = 36 rules                                                       |
| `density.css` | No        | Pointer and touch control sizes (`--oito2-control-height`, `--oito2-target-min`, `--oito2-icon-size`, `--oito2-toggle-size`, `--oito2-switch-*`, `--oito2-list-tile-*`) |
| `fonts.css`   | No        | The Inter variable font (OFL-1.1), bundled under `assets/fonts/inter/`                                                                                                  |
| `base.css`    | No        | Border-box sizing, body typography, and the styles of the `focusBorder` and `undershoot` attachments                                                                    |
| `styles.css`  | No        | Imports `fonts.css`, `tokens.css`, `density.css` and `base.css`; the usual single import                                                                                |

Every rule sits in `@layer oito2`. Density works by cascade: `:root` and `[data-oito2-density='pointer']` set the pointer sizes, `@media (pointer: coarse)` switches the root to touch sizes unless it is forced to pointer, and `[data-oito2-density='touch']` forces touch sizes on a subtree.

`schemes.css` is not part of `styles.css`: an app that renders without `ThemeProvider` (static pages, a non-Svelte host) can import it and set `data-oito2-scheme` on an element.

## Color schemes (`theme/`)

A scheme is a `ColorTheme`:

| Field          | Contents                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| `brightness`   | `light` or `dark`                                                          |
| `highContrast` | Whether the high-contrast targets were applied                             |
| `background`   | The page background                                                        |
| `colorScheme`  | The Material 3 roles (`colorSchemeRoles`), as hex                          |
| `semantic`     | Text-safe `primaryText`, `errorText`, `success`, `warning`, `info`, `link` |
| `chrome`       | `background`, `sidebar`, `mainbar`, `titleBar`, `dialog`                   |
| `syntax`       | The 11 `syntaxRoles`                                                       |

### `createColorTheme` — the base scheme

`createColorTheme({ brightness, accent?, highContrast? })` builds the oito2 base scheme from the neutral and status palettes of `values.ts`, with the accent (a name or any hex) as the primary hue:

- the primary fill keeps white text: its lightness is lowered only as far as needed for white to reach 4.5:1 (7:1 with high contrast);
- the remaining Material roles come from a Material 3 tonal-spot scheme seeded with the primary, computed with `@material/material-color-utilities` and rounded to 8 bits like Flutter;
- with high contrast, `onSurface` becomes pure black or white;
- the syntax colors come from the GNOME palette.

### `colorThemeFromRoles` — schemes from a theme family

`colorThemeFromRoles(roles, { highContrast })` takes the dozen `ColorRoles` most theme families publish (`background`, `card`, `foreground`, `primary`, `secondary`, `mutedForeground`, `destructive`, `border`, `success`, `warning`, `info`, `syntax`) and derives the surface ladder from them: the lower of background and card, halfway to the card, then one and two thirds of the way from the card to the secondary surface. The primary fill keeps `roles.primary` with black or white text, whichever contrasts more.

### Contrast guarantees

Both functions finish in the same assembly step, which raises colors until they meet their target against **every surface** of the scheme and the background:

| Colors                                            | Normal                       | High contrast |
| ------------------------------------------------- | ---------------------------- | ------------- |
| `onSurface`, `onSurfaceVariant`, semantic, syntax | 4.5:1 (AA)                   | 7:1 (AAA)     |
| `outline`                                         | 3:1                          | 4.5:1         |
| Adjacent chrome surfaces                          | 1.04:1 (`chromeMinimumStep`) | 1.04:1        |

Results are cached by their inputs. The contrast helpers (`contrastRatio`, `ensureContrastColor`, `foregroundColorFor`, `Contrast`) are exported from `@oito2/ui/theme`, which has no Svelte dependency, for build scripts and theme packages.

### From scheme to CSS (`theme/css.ts`)

`colorThemeVariables(theme)` names every color:

| Prefix                                                                                                   | Source                                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `--oito2-color-<role>`                                                                                   | Material roles, `background`, semantic colors                                      |
| `--oito2-color-selected-fill`, `-on-selected-fill`, `-on-primary-text`, `-off-thumb`, `-on-primary-tint` | `componentColors(theme)`: colors components derive beyond the roles                |
| `--oito2-color-info-<box\|box-text\|badge\|badge-text>-<type>`                                           | `infoColors(theme)` for `information`, `success`, `warning`, `danger`, `important` |
| `--oito2-chrome-<surface>`                                                                               | Chrome colors                                                                      |
| `--oito2-syntax-<role>`                                                                                  | Syntax colors                                                                      |

`colorThemeStyle(theme)` returns them as an inline `style` (plus `color-scheme`); `colorThemeRule(theme, selector)` returns a CSS rule, used by the generator.

## ThemeProvider

`ThemeProvider` resolves a scheme and applies it to its subtree:

1. **Brightness** — `mode` (`light`, `dark`, or `system` from `prefers-color-scheme`).
2. **Contrast** — `highContrast` (`true`, `false`, or `system`: `SystemSettings.highContrast` or `prefers-contrast: more`).
3. **Scheme** — the `light` or `dark` source for that brightness when given (a `ColorTheme`, or a function of `{ highContrast }` such as a preset), else `createColorTheme` with `accent` or the system accent.
4. **Output** — a `div.oito2-theme` with `data-oito2-brightness`, `data-oito2-contrast` (`high`/`normal`) and the inline custom properties; its background is `--oito2-color-background` and its text `--oito2-color-on-surface`.

It also calls `setTheme` (read with `useTheme()`, which falls back to the light base scheme) and `setPortalTarget`, pointing overlays at an empty `div.oito2-portal-host` (`display: contents`) at the end of the themed `div`.

## Presets (`@oito2/ui-themes`)

`packages/ui-themes/src/lib/palettes.ts` holds the source palettes of Everforest, Rosé Pine, Nord and Dracula/Alucard; Catppuccin comes from `@catppuccin/palette`. `presets.ts` maps each of the 13 presets to `ColorRoles` (`presetRoles`) and builds it with `colorThemeFromRoles` (`presetColorTheme`). `presetTheme(name)` returns the function form `ThemeProvider` accepts, so the preset is rebuilt with whatever contrast the provider resolves. `presets.css` holds every preset and its `-hc` variant as `[data-oito2-scheme='<kebab-name>']` rules. `presets.test.ts` compares the presets with `fixtures/parity/schemes.json` of `@oito2/ui`.

## Regenerating

After changing `values.ts`, the theme code or a preset:

```bash
pnpm generate          # rewrites tokens.css, schemes.css and presets.css
pnpm generate:check    # fails if a file on disk differs (run in CI)
```

See [Parity and generators](parity-and-generators.md).
