🌐 [Português](../../pt-br/reference/css-custom-properties.md) | **English** | 🏠 [Index](../index.md)

---

# CSS custom properties

Every `--oito2-*` custom property `@oito2/ui` defines, and the `data-oito2-*` attributes its styles and scripts read or write. All of them are declared inside the `oito2` cascade layer, so an unlayered rule of the app overrides any of them (see [Theming](../guides/theming.md#overriding-tokens-and-styles)).

## Table of Contents

- [Design tokens (`tokens.css`)](#design-tokens-tokenscss)
- [Density (`density.css`)](#density-densitycss)
- [Theme colors](#theme-colors)
- [Component custom properties](#component-custom-properties)
- [Data attributes](#data-attributes)

## Design tokens (`tokens.css`)

Declared on `:root` by `@oito2/ui/tokens.css` (included in `styles.css`). The file is generated from [`packages/ui/src/lib/tokens/values.ts`](../../../packages/ui/src/lib/tokens/values.ts) by `pnpm generate`; the values are static.

### Radius

| Property                | Value  |
| ----------------------- | ------ |
| `--oito2-radius-check`  | `4px`  |
| `--oito2-radius-small`  | `6px`  |
| `--oito2-radius-medium` | `8px`  |
| `--oito2-radius-large`  | `12px` |
| `--oito2-radius-window` | `14px` |

### Spacing

| Property             | Value  |
| -------------------- | ------ |
| `--oito2-space-xxs`  | `2px`  |
| `--oito2-space-xs`   | `4px`  |
| `--oito2-space-sm`   | `8px`  |
| `--oito2-space-md`   | `12px` |
| `--oito2-space-lg`   | `16px` |
| `--oito2-space-page` | `20px` |
| `--oito2-space-xl`   | `24px` |
| `--oito2-space-xxl`  | `32px` |
| `--oito2-space-xxxl` | `48px` |

### Sizes

| Property                                    | Value  |
| ------------------------------------------- | ------ |
| `--oito2-size-button-height`                | `34px` |
| `--oito2-size-touch-button-height`          | `40px` |
| `--oito2-size-title-bar-height`             | `46px` |
| `--oito2-size-title-bar-item-height`        | `34px` |
| `--oito2-size-icon`                         | `20px` |
| `--oito2-size-progress-height`              | `6px`  |
| `--oito2-size-focus-border-width`           | `2px`  |
| `--oito2-size-window-control`               | `24px` |
| `--oito2-size-windows-window-control-width` | `46px` |
| `--oito2-size-min-pointer-target`           | `24px` |
| `--oito2-size-min-touch-target`             | `48px` |

### Accent colors

| Property                | Value     |
| ----------------------- | --------- |
| `--oito2-accent-blue`   | `#3584e4` |
| `--oito2-accent-teal`   | `#2190a4` |
| `--oito2-accent-green`  | `#3a944a` |
| `--oito2-accent-yellow` | `#c88800` |
| `--oito2-accent-orange` | `#ed5b00` |
| `--oito2-accent-red`    | `#e62d42` |
| `--oito2-accent-pink`   | `#d56199` |
| `--oito2-accent-purple` | `#9141ac` |
| `--oito2-accent-slate`  | `#6f8396` |

### Font

| Property                       | Value                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `--oito2-font-family`          | `Inter, Ubuntu, Cantarell, Roboto, 'Segoe UI', 'SF Pro Text', 'Noto Sans', sans-serif` |
| `--oito2-font-weight-emphasis` | `600`                                                                                  |

### Typography

Each of the 15 type styles has a shorthand for the `font` property and four longhands:

| Style             | `--oito2-type-<style>` (font shorthand)    | `-size` | `-line-height` | `-weight` | `-tracking` |
| ----------------- | ------------------------------------------ | ------- | -------------- | --------- | ----------- |
| `display-large`   | `400 57px / 1.12 var(--oito2-font-family)` | `57px`  | `1.12`         | `400`     | `-0.25px`   |
| `display-medium`  | `400 45px / 1.16 var(--oito2-font-family)` | `45px`  | `1.16`         | `400`     | `0px`       |
| `display-small`   | `400 36px / 1.22 var(--oito2-font-family)` | `36px`  | `1.22`         | `400`     | `0px`       |
| `headline-large`  | `600 32px / 1.25 var(--oito2-font-family)` | `32px`  | `1.25`         | `600`     | `0px`       |
| `headline-medium` | `600 28px / 1.29 var(--oito2-font-family)` | `28px`  | `1.29`         | `600`     | `0px`       |
| `headline-small`  | `600 24px / 1.33 var(--oito2-font-family)` | `24px`  | `1.33`         | `600`     | `0px`       |
| `title-large`     | `600 22px / 1.27 var(--oito2-font-family)` | `22px`  | `1.27`         | `600`     | `0px`       |
| `title-medium`    | `600 16px / 1.5 var(--oito2-font-family)`  | `16px`  | `1.5`          | `600`     | `0.15px`    |
| `title-small`     | `600 14px / 1.43 var(--oito2-font-family)` | `14px`  | `1.43`         | `600`     | `0.1px`     |
| `body-large`      | `400 16px / 1.5 var(--oito2-font-family)`  | `16px`  | `1.5`          | `400`     | `0.5px`     |
| `body-medium`     | `400 14px / 1.43 var(--oito2-font-family)` | `14px`  | `1.43`         | `400`     | `0.25px`    |
| `body-small`      | `400 12px / 1.33 var(--oito2-font-family)` | `12px`  | `1.33`         | `400`     | `0.4px`     |
| `label-large`     | `600 14px / 1.43 var(--oito2-font-family)` | `14px`  | `1.43`         | `600`     | `0.1px`     |
| `label-medium`    | `500 12px / 1.33 var(--oito2-font-family)` | `12px`  | `1.33`         | `500`     | `0.5px`     |
| `label-small`     | `500 11px / 1.45 var(--oito2-font-family)` | `11px`  | `1.45`         | `500`     | `0.5px`     |

## Density (`density.css`)

Declared by `@oito2/ui/density.css` (included in `styles.css`). The pointer values apply on `:root` and on any element with `data-oito2-density="pointer"`; the touch values apply on `:root` under `@media (pointer: coarse)` (unless `:root` has `data-oito2-density="pointer"`) and on any element with `data-oito2-density="touch"`.

| Property                            | Pointer                                       | Touch                                          |
| ----------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `--oito2-control-height`            | `var(--oito2-size-button-height)` (34px)      | `var(--oito2-size-touch-button-height)` (40px) |
| `--oito2-target-min`                | `var(--oito2-size-min-pointer-target)` (24px) | `var(--oito2-size-min-touch-target)` (48px)    |
| `--oito2-icon-size`                 | `var(--oito2-size-icon)` (20px)               | `24px`                                         |
| `--oito2-toggle-size`               | `20px`                                        | `24px`                                         |
| `--oito2-toggle-target`             | `var(--oito2-size-button-height)` (34px)      | `var(--oito2-size-min-touch-target)` (48px)    |
| `--oito2-switch-width`              | `42px`                                        | `52px`                                         |
| `--oito2-switch-height`             | `24px`                                        | `30px`                                         |
| `--oito2-list-tile-height`          | `40px`                                        | `56px`                                         |
| `--oito2-list-tile-two-line-height` | `52px`                                        | `72px`                                         |

## Theme colors

`ThemeProvider` writes these properties as an inline style on its `div` (with `color-scheme: light` or `dark`), from the active `ColorTheme`. The function that writes them is `colorThemeVariables` ([`packages/ui/src/lib/theme/css.ts`](../../../packages/ui/src/lib/theme/css.ts)), also exported for your own use with `colorThemeStyle` and `colorThemeRule`. Values are lowercase hex colors.

Their values depend on the mode, accent, contrast and preset, so the tables show two examples: the base scheme with the blue accent in light and dark mode — the `light-blue` and `dark-blue` rules of `@oito2/ui/schemes.css`. The same 94 properties are set by every rule of `schemes.css` and `@oito2/ui-themes/presets.css`.

### Material 3 roles

`--oito2-color-<role>` for every Material 3 color scheme role, in kebab-case (`colorSchemeRoles`). Text uses the `on-*` roles; `primary` and `error` are fills.

| Property                                   | `light-blue` | `dark-blue` |
| ------------------------------------------ | ------------ | ----------- |
| `--oito2-color-primary`                    | `#1e75df`    | `#1e75df`   |
| `--oito2-color-on-primary`                 | `#ffffff`    | `#ffffff`   |
| `--oito2-color-primary-container`          | `#d7e3ff`    | `#284777`   |
| `--oito2-color-on-primary-container`       | `#284777`    | `#d7e3ff`   |
| `--oito2-color-primary-fixed`              | `#d7e3ff`    | `#d7e3ff`   |
| `--oito2-color-primary-fixed-dim`          | `#aac7ff`    | `#aac7ff`   |
| `--oito2-color-on-primary-fixed`           | `#001b3e`    | `#001b3e`   |
| `--oito2-color-on-primary-fixed-variant`   | `#284777`    | `#284777`   |
| `--oito2-color-secondary`                  | `#565e71`    | `#bec6dc`   |
| `--oito2-color-on-secondary`               | `#ffffff`    | `#283141`   |
| `--oito2-color-secondary-container`        | `#dae2f9`    | `#3e4759`   |
| `--oito2-color-on-secondary-container`     | `#3e4759`    | `#dae2f9`   |
| `--oito2-color-secondary-fixed`            | `#dae2f9`    | `#dae2f9`   |
| `--oito2-color-secondary-fixed-dim`        | `#bec6dc`    | `#bec6dc`   |
| `--oito2-color-on-secondary-fixed`         | `#131c2b`    | `#131c2b`   |
| `--oito2-color-on-secondary-fixed-variant` | `#3e4759`    | `#3e4759`   |
| `--oito2-color-tertiary`                   | `#705575`    | `#ddbce0`   |
| `--oito2-color-on-tertiary`                | `#ffffff`    | `#3f2844`   |
| `--oito2-color-tertiary-container`         | `#fad8fd`    | `#573e5c`   |
| `--oito2-color-on-tertiary-container`      | `#573e5c`    | `#fad8fd`   |
| `--oito2-color-tertiary-fixed`             | `#fad8fd`    | `#fad8fd`   |
| `--oito2-color-tertiary-fixed-dim`         | `#ddbce0`    | `#ddbce0`   |
| `--oito2-color-on-tertiary-fixed`          | `#28132e`    | `#28132e`   |
| `--oito2-color-on-tertiary-fixed-variant`  | `#573e5c`    | `#573e5c`   |
| `--oito2-color-error`                      | `#c01c28`    | `#ff7b63`   |
| `--oito2-color-on-error`                   | `#ffffff`    | `#000000`   |
| `--oito2-color-error-container`            | `#ffdad6`    | `#93000a`   |
| `--oito2-color-on-error-container`         | `#93000a`    | `#ffdad6`   |
| `--oito2-color-surface`                    | `#ffffff`    | `#202020`   |
| `--oito2-color-on-surface`                 | `#202020`    | `#f7f7f7`   |
| `--oito2-color-surface-dim`                | `#e8e8e8`    | `#1a1a1a`   |
| `--oito2-color-surface-bright`             | `#ffffff`    | `#383838`   |
| `--oito2-color-surface-container-lowest`   | `#ffffff`    | `#1a1a1a`   |
| `--oito2-color-surface-container-low`      | `#fafafa`    | `#242424`   |
| `--oito2-color-surface-container`          | `#f5f5f5`    | `#2a2a2a`   |
| `--oito2-color-surface-container-high`     | `#efefef`    | `#303030`   |
| `--oito2-color-surface-container-highest`  | `#e8e8e8`    | `#383838`   |
| `--oito2-color-on-surface-variant`         | `#5e5e5e`    | `#bdbdbd`   |
| `--oito2-color-outline`                    | `#7e7e7e`    | `#8a8a8a`   |
| `--oito2-color-outline-variant`            | `#d9d9d9`    | `#3d3d3d`   |
| `--oito2-color-shadow`                     | `#000000`    | `#000000`   |
| `--oito2-color-scrim`                      | `#000000`    | `#000000`   |
| `--oito2-color-inverse-surface`            | `#202020`    | `#f7f7f7`   |
| `--oito2-color-on-inverse-surface`         | `#ffffff`    | `#202020`   |
| `--oito2-color-inverse-primary`            | `#3c88e5`    | `#1d70d6`   |
| `--oito2-color-surface-tint`               | `#00000000`  | `#00000000` |

### Background and semantic colors

The page background and the text-safe semantic colors (`theme.background` and `theme.semantic`). Use `primary-text` and `error-text` for text and icons, not `primary` and `error`.

| Property                     | `light-blue` | `dark-blue` |
| ---------------------------- | ------------ | ----------- |
| `--oito2-color-background`   | `#fafafa`    | `#242424`   |
| `--oito2-color-primary-text` | `#1a67c4`    | `#6ba5eb`   |
| `--oito2-color-error-text`   | `#c01c28`    | `#ff7b63`   |
| `--oito2-color-success`      | `#187549`    | `#8ff0a4`   |
| `--oito2-color-warning`      | `#886003`    | `#f8e45c`   |
| `--oito2-color-info`         | `#1966c2`    | `#78aeed`   |
| `--oito2-color-link`         | `#1a67c4`    | `#6ba5eb`   |

### Component colors

Colors the components derive from the theme (`componentColors`): the fill and mark of selected controls, the color on top of `primary-text` (focus ring, cursor), the thumb of an off switch, and text on a faint primary tint.

| Property                         | `light-blue` | `dark-blue` |
| -------------------------------- | ------------ | ----------- |
| `--oito2-color-selected-fill`    | `#1e75df`    | `#1e75df`   |
| `--oito2-color-on-selected-fill` | `#ffffff`    | `#ffffff`   |
| `--oito2-color-on-primary-text`  | `#ffffff`    | `#000000`   |
| `--oito2-color-off-thumb`        | `#ffffff`    | `#bdbdbd`   |
| `--oito2-color-on-primary-tint`  | `#1a66c2`    | `#6ba5eb`   |

### Message colors

For each message type (`information`, `success`, `warning`, `danger`, `important`), the box and badge backgrounds and their text colors (`infoColors`), used by `InfoBox` and `InfoBadge`: `--oito2-color-info-box-<type>`, `--oito2-color-info-box-text-<type>`, `--oito2-color-info-badge-<type>` and `--oito2-color-info-badge-text-<type>`.

| Property                                    | `light-blue` | `dark-blue` |
| ------------------------------------------- | ------------ | ----------- |
| `--oito2-color-info-box-information`        | `#edf3fa`    | `#272b30`   |
| `--oito2-color-info-box-text-information`   | `#1966c2`    | `#78aeed`   |
| `--oito2-color-info-badge-information`      | `#dfeaf6`    | `#2c343d`   |
| `--oito2-color-info-badge-text-information` | `#1966c2`    | `#78aeed`   |
| `--oito2-color-info-box-success`            | `#edf4f0`    | `#29312b`   |
| `--oito2-color-info-box-text-success`       | `#187549`    | `#8ff0a4`   |
| `--oito2-color-info-badge-success`          | `#dfece6`    | `#303d32`   |
| `--oito2-color-info-badge-text-success`     | `#187549`    | `#8ff0a4`   |
| `--oito2-color-info-box-warning`            | `#f5f2eb`    | `#313025`   |
| `--oito2-color-info-box-text-warning`       | `#886003`    | `#f8e45c`   |
| `--oito2-color-info-badge-warning`          | `#eee9dc`    | `#3e3b28`   |
| `--oito2-color-info-badge-text-warning`     | `#886003`    | `#f8e45c`   |
| `--oito2-color-info-box-danger`             | `#faedee`    | `#322725`   |
| `--oito2-color-info-box-text-danger`        | `#c01c28`    | `#ff7b63`   |
| `--oito2-color-info-badge-danger`           | `#f6dfe1`    | `#3f2d29`   |
| `--oito2-color-info-badge-text-danger`      | `#c01c28`    | `#ff7b63`   |
| `--oito2-color-info-box-important`          | `#edf3fa`    | `#262b30`   |
| `--oito2-color-info-box-text-important`     | `#1a67c4`    | `#6ba5eb`   |
| `--oito2-color-info-badge-important`        | `#dfeaf7`    | `#2b333c`   |
| `--oito2-color-info-badge-text-important`   | `#1a67c4`    | `#6ba5eb`   |

### Chrome surfaces

The surfaces of the window chrome (`theme.chrome`): window background, sidebars, the main bar beside them, the title bar and dialogs.

| Property                    | `light-blue` | `dark-blue` |
| --------------------------- | ------------ | ----------- |
| `--oito2-chrome-background` | `#fafafa`    | `#242424`   |
| `--oito2-chrome-sidebar`    | `#f5f5f5`    | `#2a2a2a`   |
| `--oito2-chrome-mainbar`    | `#e8e8e8`    | `#383838`   |
| `--oito2-chrome-title-bar`  | `#ebebeb`    | `#303030`   |
| `--oito2-chrome-dialog`     | `#ffffff`    | `#303030`   |

### Syntax colors

The code colors by syntax role (`syntaxRoles`), used by `@oito2/ui-syntax`.

| Property                    | `light-blue` | `dark-blue` |
| --------------------------- | ------------ | ----------- |
| `--oito2-syntax-foreground` | `#202020`    | `#f7f7f7`   |
| `--oito2-syntax-comment`    | `#69686d`    | `#a2a19e`   |
| `--oito2-syntax-keyword`    | `#9141ac`    | `#dc8add`   |
| `--oito2-syntax-string`     | `#1c774d`    | `#8ff0a4`   |
| `--oito2-syntax-number`     | `#b74100`    | `#ffa348`   |
| `--oito2-syntax-function`   | `#1966c4`    | `#99c1f1`   |
| `--oito2-syntax-type`       | `#1a7282`    | `#93ddc2`   |
| `--oito2-syntax-tag`        | `#c01c28`    | `#f87e71`   |
| `--oito2-syntax-attribute`  | `#885f3d`    | `#f9f06b`   |
| `--oito2-syntax-constant`   | `#ba3274`    | `#f49ac1`   |
| `--oito2-syntax-invalid`    | `#ce1921`    | `#ff7b63`   |

## Component custom properties

Some components read an optional custom property with a fallback, so the app can change one detail without touching the component's CSS. Set them on the component (through `class`) or on an ancestor:

| Property                           | Read by                               | Fallback                      |
| ---------------------------------- | ------------------------------------- | ----------------------------- |
| `--oito2-master-detail-pane-color` | `MasterDetail.Master`                 | `var(--oito2-chrome-mainbar)` |
| `--oito2-navigation-rail-color`    | `NavigationRail.Root`                 | `var(--oito2-chrome-sidebar)` |
| `--oito2-navigation-rail-padding`  | `NavigationRail.Root`                 | `var(--oito2-space-sm)`       |
| `--oito2-tabs-list-width`          | `Tabs.List` (vertical)                | `200px`                       |
| `--oito2-expandable-gap`           | `Expandable.Content`                  | `var(--oito2-space-xs)`       |
| `--oito2-focus-border-radius`      | `focusBorder` attachment (`base.css`) | `var(--oito2-radius-medium)`  |

Other `--oito2-*` names that appear in component styles (`--oito2-rating-color`, `--oito2-marquee-gap`, `--oito2-progress-bar-height`, `--oito2-title-bar-height`, `--oito2-tree-indent`, `--oito2-avatar-size`, `--oito2-undershoot-extent`, ...) are set by the components themselves from their props or by attachments at run time; change the prop instead of the property.

## Data attributes

| Attribute                                                                                                      | Set by                                                     | Read by / purpose                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `data-oito2-density="pointer" \| "touch"`                                                                      | The app, on any element                                    | `density.css` (control sizes for the element and its content); `NavigationPage` reads the closest one                                   |
| `data-oito2-scheme="<name>"`                                                                                   | The app, on any element                                    | `schemes.css` (`light-blue`, `dark-teal-hc`, ...) and `presets.css` (`nord-dark`, `catppuccin-mocha-hc`, ...)                           |
| `data-oito2-brightness="light" \| "dark"`                                                                      | `ThemeProvider`, on its `div`                              | App selectors                                                                                                                           |
| `data-oito2-contrast="normal" \| "high"`                                                                       | `ThemeProvider`, on its `div`                              | App selectors                                                                                                                           |
| `data-oito2-decorations="<mode>"`                                                                              | `NativeWindowController`, on `<html>`                      | The window frame: `native`, `undecorated` or `gtk-headerless`                                                                           |
| `data-oito2-window-maximized`, `data-oito2-window-fullscreen`, `data-oito2-window-inactive`                    | `NativeWindowController`, on `<html>` (boolean attributes) | The window state, for CSS (`NativeWindowController.attach` with `reflectToDocument: false` turns them and `data-oito2-decorations` off) |
| `data-oito2-drag-region`                                                                                       | The app, on elements inside a title bar                    | Their empty background also moves the window, like the bar's own (`dragRegionAttribute`)                                                |
| `data-oito2-focus-border="auto" \| "on" \| "off"`                                                              | The `focusBorder` attachment                               | `base.css` (the focus ring)                                                                                                             |
| `data-oito2-undershoot="vertical" \| "horizontal"`, `data-oito2-undershoot-start`, `data-oito2-undershoot-end` | The `undershoot` attachment                                | `base.css` (edge shadows of a scrolling element)                                                                                        |

Components also style their states through their own data attributes (`data-state`, `data-disabled`, `data-orientation`, `data-highlighted`, `data-placement`, `data-variant`, ...), which app CSS can target too.

## See also

- [Theming](../guides/theming.md) — how to choose and override these values.
- [Tokens and themes](../architecture/tokens-and-themes.md) — how the values are computed and generated.
