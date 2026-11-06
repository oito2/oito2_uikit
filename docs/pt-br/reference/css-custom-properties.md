🌐 [English](../../en/reference/css-custom-properties.md) | **Português** | 🏠 [Índice](../index.md)

---

# Propriedades CSS personalizadas

Todas as propriedades personalizadas `--oito2-*` que `@oito2/ui` define, e os atributos `data-oito2-*` que os seus estilos e scripts leem ou escrevem. Todas são declaradas dentro da camada de cascata `oito2`, então uma regra sem camada do app sobrescreve qualquer uma delas (veja [Temas](../guides/theming.md#sobrescrevendo-tokens-e-estilos)).

## Índice

- [Tokens de design (`tokens.css`)](#tokens-de-design-tokenscss)
- [Densidade (`density.css`)](#densidade-densitycss)
- [Cores do tema](#cores-do-tema)
- [Propriedades personalizadas dos componentes](#propriedades-personalizadas-dos-componentes)
- [Atributos de dados](#atributos-de-dados)

## Tokens de design (`tokens.css`)

Declarados em `:root` por `@oito2/ui/tokens.css` (incluído em `styles.css`). O arquivo é gerado a partir de [`packages/ui/src/lib/tokens/values.ts`](../../../packages/ui/src/lib/tokens/values.ts) por `pnpm generate`; os valores são estáticos.

### Raio

| Propriedade             | Valor  |
| ----------------------- | ------ |
| `--oito2-radius-check`  | `4px`  |
| `--oito2-radius-small`  | `6px`  |
| `--oito2-radius-medium` | `8px`  |
| `--oito2-radius-large`  | `12px` |
| `--oito2-radius-window` | `14px` |

### Espaçamento

| Propriedade          | Valor  |
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

### Tamanhos

| Propriedade                                 | Valor  |
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

### Cores de destaque

| Propriedade             | Valor     |
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

### Fonte

| Propriedade                    | Valor                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `--oito2-font-family`          | `Inter, Ubuntu, Cantarell, Roboto, 'Segoe UI', 'SF Pro Text', 'Noto Sans', sans-serif` |
| `--oito2-font-weight-emphasis` | `600`                                                                                  |

### Tipografia

Cada um dos 15 estilos de texto tem uma forma abreviada para a propriedade `font` e quatro formas completas:

| Estilo            | `--oito2-type-<style>` (abreviação de `font`) | `-size` | `-line-height` | `-weight` | `-tracking` |
| ----------------- | --------------------------------------------- | ------- | -------------- | --------- | ----------- |
| `display-large`   | `400 57px / 1.12 var(--oito2-font-family)`    | `57px`  | `1.12`         | `400`     | `-0.25px`   |
| `display-medium`  | `400 45px / 1.16 var(--oito2-font-family)`    | `45px`  | `1.16`         | `400`     | `0px`       |
| `display-small`   | `400 36px / 1.22 var(--oito2-font-family)`    | `36px`  | `1.22`         | `400`     | `0px`       |
| `headline-large`  | `600 32px / 1.25 var(--oito2-font-family)`    | `32px`  | `1.25`         | `600`     | `0px`       |
| `headline-medium` | `600 28px / 1.29 var(--oito2-font-family)`    | `28px`  | `1.29`         | `600`     | `0px`       |
| `headline-small`  | `600 24px / 1.33 var(--oito2-font-family)`    | `24px`  | `1.33`         | `600`     | `0px`       |
| `title-large`     | `600 22px / 1.27 var(--oito2-font-family)`    | `22px`  | `1.27`         | `600`     | `0px`       |
| `title-medium`    | `600 16px / 1.5 var(--oito2-font-family)`     | `16px`  | `1.5`          | `600`     | `0.15px`    |
| `title-small`     | `600 14px / 1.43 var(--oito2-font-family)`    | `14px`  | `1.43`         | `600`     | `0.1px`     |
| `body-large`      | `400 16px / 1.5 var(--oito2-font-family)`     | `16px`  | `1.5`          | `400`     | `0.5px`     |
| `body-medium`     | `400 14px / 1.43 var(--oito2-font-family)`    | `14px`  | `1.43`         | `400`     | `0.25px`    |
| `body-small`      | `400 12px / 1.33 var(--oito2-font-family)`    | `12px`  | `1.33`         | `400`     | `0.4px`     |
| `label-large`     | `600 14px / 1.43 var(--oito2-font-family)`    | `14px`  | `1.43`         | `600`     | `0.1px`     |
| `label-medium`    | `500 12px / 1.33 var(--oito2-font-family)`    | `12px`  | `1.33`         | `500`     | `0.5px`     |
| `label-small`     | `500 11px / 1.45 var(--oito2-font-family)`    | `11px`  | `1.45`         | `500`     | `0.5px`     |

## Densidade (`density.css`)

Declaradas por `@oito2/ui/density.css` (incluído em `styles.css`). Os valores de ponteiro valem em `:root` e em qualquer elemento com `data-oito2-density="pointer"`; os valores de toque valem em `:root` sob `@media (pointer: coarse)` (a menos que `:root` tenha `data-oito2-density="pointer"`) e em qualquer elemento com `data-oito2-density="touch"`.

| Propriedade                         | Ponteiro                                      | Toque                                          |
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

## Cores do tema

O `ThemeProvider` escreve estas propriedades como estilo inline na sua `div` (com `color-scheme: light` ou `dark`), a partir do `ColorTheme` ativo. A função que as escreve é `colorThemeVariables` ([`packages/ui/src/lib/theme/css.ts`](../../../packages/ui/src/lib/theme/css.ts)), também exportada para uso próprio junto com `colorThemeStyle` e `colorThemeRule`. Os valores são cores hex em minúsculas.

Os valores dependem do modo, do destaque, do contraste e do preset, então as tabelas mostram dois exemplos: o esquema base com o destaque azul nos modos claro e escuro — as regras `light-blue` e `dark-blue` de `@oito2/ui/schemes.css`. As mesmas 94 propriedades são definidas por todas as regras de `schemes.css` e de `@oito2/ui-themes/presets.css`.

### Papéis do Material 3

`--oito2-color-<papel>` para cada papel do esquema de cores do Material 3, em kebab-case (`colorSchemeRoles`). O texto usa os papéis `on-*`; `primary` e `error` são preenchimentos.

| Propriedade                                | `light-blue` | `dark-blue` |
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

### Fundo e cores semânticas

O fundo da página e as cores semânticas seguras para texto (`theme.background` e `theme.semantic`). Use `primary-text` e `error-text` para textos e ícones, não `primary` e `error`.

| Propriedade                  | `light-blue` | `dark-blue` |
| ---------------------------- | ------------ | ----------- |
| `--oito2-color-background`   | `#fafafa`    | `#242424`   |
| `--oito2-color-primary-text` | `#1a67c4`    | `#6ba5eb`   |
| `--oito2-color-error-text`   | `#c01c28`    | `#ff7b63`   |
| `--oito2-color-success`      | `#187549`    | `#8ff0a4`   |
| `--oito2-color-warning`      | `#886003`    | `#f8e45c`   |
| `--oito2-color-info`         | `#1966c2`    | `#78aeed`   |
| `--oito2-color-link`         | `#1a67c4`    | `#6ba5eb`   |

### Cores dos componentes

Cores que os componentes derivam do tema (`componentColors`): o preenchimento e a marca dos controles selecionados, a cor sobre `primary-text` (anel de foco, cursor), o polegar de uma chave desligada e o texto sobre um leve tom primário.

| Propriedade                      | `light-blue` | `dark-blue` |
| -------------------------------- | ------------ | ----------- |
| `--oito2-color-selected-fill`    | `#1e75df`    | `#1e75df`   |
| `--oito2-color-on-selected-fill` | `#ffffff`    | `#ffffff`   |
| `--oito2-color-on-primary-text`  | `#ffffff`    | `#000000`   |
| `--oito2-color-off-thumb`        | `#ffffff`    | `#bdbdbd`   |
| `--oito2-color-on-primary-tint`  | `#1a66c2`    | `#6ba5eb`   |

### Cores das mensagens

Para cada tipo de mensagem (`information`, `success`, `warning`, `danger`, `important`), os fundos da caixa e do selo e as respectivas cores de texto (`infoColors`), usados por `InfoBox` e `InfoBadge`: `--oito2-color-info-box-<tipo>`, `--oito2-color-info-box-text-<tipo>`, `--oito2-color-info-badge-<tipo>` e `--oito2-color-info-badge-text-<tipo>`.

| Propriedade                                 | `light-blue` | `dark-blue` |
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

### Superfícies do chrome

As superfícies do chrome da janela (`theme.chrome`): fundo da janela, barras laterais, a barra principal ao lado delas, a barra de título e os diálogos.

| Propriedade                 | `light-blue` | `dark-blue` |
| --------------------------- | ------------ | ----------- |
| `--oito2-chrome-background` | `#fafafa`    | `#242424`   |
| `--oito2-chrome-sidebar`    | `#f5f5f5`    | `#2a2a2a`   |
| `--oito2-chrome-mainbar`    | `#e8e8e8`    | `#383838`   |
| `--oito2-chrome-title-bar`  | `#ebebeb`    | `#303030`   |
| `--oito2-chrome-dialog`     | `#ffffff`    | `#303030`   |

### Cores de sintaxe

As cores de código por papel de sintaxe (`syntaxRoles`), usadas por `@oito2/ui-syntax`.

| Propriedade                 | `light-blue` | `dark-blue` |
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

## Propriedades personalizadas dos componentes

Alguns componentes leem uma propriedade personalizada opcional com valor de reserva, para que o app mude um detalhe sem mexer no CSS do componente. Defina-as no componente (por `class`) ou num ancestral:

| Propriedade                        | Lida por                              | Valor de reserva              |
| ---------------------------------- | ------------------------------------- | ----------------------------- |
| `--oito2-master-detail-pane-color` | `MasterDetail.Master`                 | `var(--oito2-chrome-mainbar)` |
| `--oito2-navigation-rail-color`    | `NavigationRail.Root`                 | `var(--oito2-chrome-sidebar)` |
| `--oito2-navigation-rail-padding`  | `NavigationRail.Root`                 | `var(--oito2-space-sm)`       |
| `--oito2-tabs-list-width`          | `Tabs.List` (vertical)                | `200px`                       |
| `--oito2-expandable-gap`           | `Expandable.Content`                  | `var(--oito2-space-xs)`       |
| `--oito2-focus-border-radius`      | Attachment `focusBorder` (`base.css`) | `var(--oito2-radius-medium)`  |

Outros nomes `--oito2-*` que aparecem nos estilos dos componentes (`--oito2-rating-color`, `--oito2-marquee-gap`, `--oito2-progress-bar-height`, `--oito2-title-bar-height`, `--oito2-tree-indent`, `--oito2-avatar-size`, `--oito2-undershoot-extent`, ...) são definidos pelos próprios componentes a partir das suas props, ou por attachments em tempo de execução; altere a prop em vez da propriedade.

## Atributos de dados

| Atributo                                                                                                       | Definido por                                                | Lido por / finalidade                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `data-oito2-density="pointer" \| "touch"`                                                                      | O app, em qualquer elemento                                 | `density.css` (tamanhos dos controles do elemento e do seu conteúdo); `NavigationPage` lê o mais próximo                                 |
| `data-oito2-scheme="<name>"`                                                                                   | O app, em qualquer elemento                                 | `schemes.css` (`light-blue`, `dark-teal-hc`, ...) e `presets.css` (`nord-dark`, `catppuccin-mocha-hc`, ...)                              |
| `data-oito2-brightness="light" \| "dark"`                                                                      | `ThemeProvider`, na sua `div`                               | Seletores do app                                                                                                                         |
| `data-oito2-contrast="normal" \| "high"`                                                                       | `ThemeProvider`, na sua `div`                               | Seletores do app                                                                                                                         |
| `data-oito2-decorations="<mode>"`                                                                              | `NativeWindowController`, em `<html>`                       | A moldura da janela: `native`, `undecorated` ou `gtk-headerless`                                                                         |
| `data-oito2-window-maximized`, `data-oito2-window-fullscreen`, `data-oito2-window-inactive`                    | `NativeWindowController`, em `<html>` (atributos booleanos) | O estado da janela, para o CSS (`NativeWindowController.attach` com `reflectToDocument: false` desliga estes e `data-oito2-decorations`) |
| `data-oito2-drag-region`                                                                                       | O app, em elementos dentro de uma barra de título           | O fundo vazio deles também move a janela, como o da própria barra (`dragRegionAttribute`)                                                |
| `data-oito2-focus-border="auto" \| "on" \| "off"`                                                              | O attachment `focusBorder`                                  | `base.css` (o anel de foco)                                                                                                              |
| `data-oito2-undershoot="vertical" \| "horizontal"`, `data-oito2-undershoot-start`, `data-oito2-undershoot-end` | O attachment `undershoot`                                   | `base.css` (sombras nas bordas de um elemento com rolagem)                                                                               |

Os componentes também estilizam os seus estados pelos seus próprios atributos de dados (`data-state`, `data-disabled`, `data-orientation`, `data-highlighted`, `data-placement`, `data-variant`, ...), que o CSS do app também pode usar.

## Veja também

- [Temas](../guides/theming.md) — como escolher e sobrescrever estes valores.
- [Tokens e temas](../architecture/tokens-and-themes.md) — como os valores são calculados e gerados.
