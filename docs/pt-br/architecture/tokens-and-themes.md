🌐 [English](../../en/architecture/tokens-and-themes.md) | **Português** | 🏠 [Índice](../index.md)

---

# Tokens e temas

Como os valores de design viram CSS: o módulo de tokens, o gerador de CSS, as folhas de estilo, as funções de esquema de cores, o `ThemeProvider` e os presets do `@oito2/ui-themes`. Para usá-los em um app, veja o [guia de temas](../guides/theming.md); para cada variável, veja [Custom properties CSS](../reference/css-custom-properties.md).

## Visão geral

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

## O módulo de tokens

O `packages/ui/src/lib/tokens/values.ts` guarda todos os valores de token e nada mais. Ele **não tem imports**, então o gerador, o código de tema e os testes podem carregá-lo em qualquer lugar. Ele exporta:

| Export            | Conteúdo                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `radius`          | `check` 4, `small` 6, `medium` 8, `large` 12, `window` 14                                                                                                                                                  |
| `spacing`         | `xxs` 2, `xs` 4, `sm` 8, `md` 12, `lg` 16, `page` 20, `xl` 24, `xxl` 32, `xxxl` 48                                                                                                                         |
| `sizes`           | Alturas de botão (34 ponteiro, 40 toque), barra de título (46) e seus itens (34), ícone (20), progresso (6), anel de foco (2), controles de janela (24, Windows 46), alvos mínimos (24 ponteiro, 48 toque) |
| `accentColors`    | Os nove acentos nomeados da paleta do GNOME; `defaultAccent` é `blue`                                                                                                                                      |
| `neutralPalettes` | Neutros clara e escura no estilo GTK: superfícies, barra de título, texto e contornos                                                                                                                      |
| `statusPalettes`  | `success`, `warning`, `error`, `info`, `link` claros e escuros                                                                                                                                             |
| `typography`      | A família Inter empacotada, seus fallbacks de sistema, o peso de ênfase (600) e a escala tipográfica do Material 2021                                                                                      |

Todos os valores são em pixels CSS e precisam ser iguais aos do oito2_ui: o `values.test.ts` os compara com `fixtures/parity/tokens.json`.

## Folhas de estilo

| Arquivo       | Gerado | Conteúdo                                                                                                                                                                            |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`  | Sim    | As custom properties dos tokens em `:root`                                                                                                                                          |
| `schemes.css` | Sim    | Cada esquema base em `[data-oito2-scheme='<brilho>-<acento>']`, mais uma variante `-hc`: 2 × 9 × 2 = 36 regras                                                                      |
| `density.css` | Não    | Tamanhos de controle de ponteiro e de toque (`--oito2-control-height`, `--oito2-target-min`, `--oito2-icon-size`, `--oito2-toggle-size`, `--oito2-switch-*`, `--oito2-list-tile-*`) |
| `fonts.css`   | Não    | A fonte variável Inter (OFL-1.1), empacotada em `assets/fonts/inter/`                                                                                                               |
| `base.css`    | Não    | Dimensionamento border-box, tipografia do corpo, e os estilos dos attachments `focusBorder` e `undershoot`                                                                          |
| `styles.css`  | Não    | Importa `fonts.css`, `tokens.css`, `density.css` e `base.css`; o import único habitual                                                                                              |

Toda regra fica em `@layer oito2`. A densidade funciona pela cascata: `:root` e `[data-oito2-density='pointer']` definem os tamanhos de ponteiro, `@media (pointer: coarse)` passa a raiz para os tamanhos de toque a menos que ela esteja forçada em ponteiro, e `[data-oito2-density='touch']` força os tamanhos de toque em uma subárvore.

O `schemes.css` não faz parte do `styles.css`: um app que renderiza sem `ThemeProvider` (páginas estáticas, um host que não é Svelte) pode importá-lo e definir `data-oito2-scheme` em um elemento.

## Esquemas de cores (`theme/`)

Um esquema é um `ColorTheme`:

| Campo          | Conteúdo                                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| `brightness`   | `light` ou `dark`                                                                    |
| `highContrast` | Se as metas de alto contraste foram aplicadas                                        |
| `background`   | O fundo da página                                                                    |
| `colorScheme`  | Os papéis do Material 3 (`colorSchemeRoles`), em hex                                 |
| `semantic`     | `primaryText`, `errorText`, `success`, `warning`, `info`, `link`, seguros para texto |
| `chrome`       | `background`, `sidebar`, `mainbar`, `titleBar`, `dialog`                             |
| `syntax`       | Os 11 `syntaxRoles`                                                                  |

### `createColorTheme` — o esquema base

`createColorTheme({ brightness, accent?, highContrast? })` monta o esquema base do oito2 a partir das paletas neutras e de status do `values.ts`, com o acento (um nome ou qualquer hex) como matiz primária:

- o preenchimento primário mantém texto branco: sua luminosidade só é reduzida o necessário para o branco atingir 4.5:1 (7:1 com alto contraste);
- os demais papéis do Material vêm de um esquema tonal-spot do Material 3 gerado a partir da primária, calculado com `@material/material-color-utilities` e arredondado para 8 bits como no Flutter;
- com alto contraste, `onSurface` vira preto ou branco puro;
- as cores de sintaxe vêm da paleta do GNOME.

### `colorThemeFromRoles` — esquemas de uma família de temas

`colorThemeFromRoles(roles, { highContrast })` recebe a dúzia de `ColorRoles` que a maioria das famílias de temas publica (`background`, `card`, `foreground`, `primary`, `secondary`, `mutedForeground`, `destructive`, `border`, `success`, `warning`, `info`, `syntax`) e deriva delas a escada de superfícies: a mais baixa entre fundo e card, a meio caminho do card, e depois um e dois terços do caminho do card à superfície secundária. O preenchimento primário mantém `roles.primary` com texto preto ou branco, o que contrastar mais.

### Garantias de contraste

As duas funções terminam no mesmo passo de montagem, que ajusta as cores até atingirem sua meta contra **todas as superfícies** do esquema e o fundo:

| Cores                                                | Normal                       | Alto contraste |
| ---------------------------------------------------- | ---------------------------- | -------------- |
| `onSurface`, `onSurfaceVariant`, semânticas, sintaxe | 4.5:1 (AA)                   | 7:1 (AAA)      |
| `outline`                                            | 3:1                          | 4.5:1          |
| Superfícies de chrome vizinhas                       | 1.04:1 (`chromeMinimumStep`) | 1.04:1         |

Os resultados ficam em cache pelas entradas. Os utilitários de contraste (`contrastRatio`, `ensureContrastColor`, `foregroundColorFor`, `Contrast`) são exportados por `@oito2/ui/theme`, que não depende do Svelte, para scripts de build e pacotes de temas.

### Do esquema ao CSS (`theme/css.ts`)

`colorThemeVariables(theme)` dá nome a cada cor:

| Prefixo                                                                                                  | Origem                                                                              |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `--oito2-color-<papel>`                                                                                  | Papéis do Material, `background`, cores semânticas                                  |
| `--oito2-color-selected-fill`, `-on-selected-fill`, `-on-primary-text`, `-off-thumb`, `-on-primary-tint` | `componentColors(theme)`: cores que os componentes derivam além dos papéis          |
| `--oito2-color-info-<box\|box-text\|badge\|badge-text>-<tipo>`                                           | `infoColors(theme)` para `information`, `success`, `warning`, `danger`, `important` |
| `--oito2-chrome-<superfície>`                                                                            | Cores de chrome                                                                     |
| `--oito2-syntax-<papel>`                                                                                 | Cores de sintaxe                                                                    |

`colorThemeStyle(theme)` as devolve como `style` inline (mais `color-scheme`); `colorThemeRule(theme, selector)` devolve uma regra CSS, usada pelo gerador.

## ThemeProvider

O `ThemeProvider` resolve um esquema e o aplica à sua subárvore:

1. **Brilho** — `mode` (`light`, `dark`, ou `system` por `prefers-color-scheme`).
2. **Contraste** — `highContrast` (`true`, `false`, ou `system`: `SystemSettings.highContrast` ou `prefers-contrast: more`).
3. **Esquema** — a fonte `light` ou `dark` desse brilho, quando dada (um `ColorTheme`, ou uma função de `{ highContrast }` como um preset); senão `createColorTheme` com `accent` ou o acento do sistema.
4. **Saída** — uma `div.oito2-theme` com `data-oito2-brightness`, `data-oito2-contrast` (`high`/`normal`) e as custom properties inline; seu fundo é `--oito2-color-background` e seu texto `--oito2-color-on-surface`.

Ele também chama `setTheme` (lido com `useTheme()`, que recorre ao esquema base claro) e `setPortalTarget`, apontando os overlays para uma `div.oito2-portal-host` vazia (`display: contents`) no fim da `div` com tema.

## Presets (`@oito2/ui-themes`)

O `packages/ui-themes/src/lib/palettes.ts` guarda as paletas de origem de Everforest, Rosé Pine, Nord e Dracula/Alucard; o Catppuccin vem do `@catppuccin/palette`. O `presets.ts` mapeia cada um dos 13 presets para `ColorRoles` (`presetRoles`) e o monta com `colorThemeFromRoles` (`presetColorTheme`). `presetTheme(nome)` devolve a forma de função que o `ThemeProvider` aceita, então o preset é remontado com o contraste que o provider resolver. O `presets.css` guarda cada preset e sua variante `-hc` em regras `[data-oito2-scheme='<nome-kebab>']`. O `presets.test.ts` compara os presets com o `fixtures/parity/schemes.json` do `@oito2/ui`.

## Regerando

Depois de mudar o `values.ts`, o código de tema ou um preset:

```bash
pnpm generate          # rewrites tokens.css, schemes.css and presets.css
pnpm generate:check    # fails if a file on disk differs (run in CI)
```

Veja [Paridade e geradores](parity-and-generators.md).
