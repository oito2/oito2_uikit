🌐 [English](../../en/guides/theming.md) | **Português** | 🏠 [Índice](../index.md)

---

# Temas

Como escolher o modo claro ou escuro, a cor de destaque, o alto contraste e um preset nomeado, ler o tema ativo a partir de um componente, sobrescrever tokens com o seu próprio CSS e alternar entre os tamanhos de ponteiro e de toque. Todas as APIs desta página vêm de `@oito2/ui`, salvo indicação contrária.

## Índice

- [Configuração](#configuração)
- [Modo, destaque e alto contraste](#modo-destaque-e-alto-contraste)
- [Presets nomeados](#presets-nomeados)
- [Temas próprios](#temas-próprios)
- [Lendo o tema](#lendo-o-tema)
- [Sobrescrevendo tokens e estilos](#sobrescrevendo-tokens-e-estilos)
- [Densidade](#densidade)
- [CSS estático dos esquemas](#css-estático-dos-esquemas)

## Configuração

Importe a folha de estilos uma vez e envolva o app num `ThemeProvider`. O provider renderiza uma `div` que carrega as propriedades personalizadas de cor, pinta o fundo da página e a cor do texto, e hospeda as sobreposições (diálogos, menus, popovers), que assim mantêm o tema.

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

`styles.css` contém a fonte Inter embutida, os tokens, as variáveis de densidade e os estilos base. As variáveis de cor não estão nele: quem as escreve é o `ThemeProvider`.

## Modo, destaque e alto contraste

| Prop           | Tipo                                               | Padrão     | Efeito                                                                                                                                      |
| -------------- | -------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`         | `'light' \| 'dark' \| 'system'`                    | `'system'` | `system` segue `prefers-color-scheme`                                                                                                       |
| `accent`       | `AccentColor` ou uma string hex                    | —          | Sem ela, o destaque do `SystemScope` mais próximo (o do desktop, veja [Integração com o desktop](./desktop-integration.md)) e, depois, azul |
| `highContrast` | `boolean \| 'system'`                              | `'system'` | `system` liga o alto contraste quando o `SystemScope` mais próximo o informa ou quando `prefers-contrast: more` é atendida                  |
| `light`        | `ColorTheme` ou `({ highContrast }) => ColorTheme` | —          | O tema usado no modo claro, no lugar do esquema base                                                                                        |
| `dark`         | `ColorTheme` ou `({ highContrast }) => ColorTheme` | —          | O tema usado no modo escuro, no lugar do esquema base                                                                                       |

Qualquer outro atributo (`class`, `dir`, `data-*`, ...) é repassado para a `div` do provider.

```svelte
<ThemeProvider mode="dark" accent="teal" highContrast={false}>
	{@render children()}
</ThemeProvider>
```

Os destaques nomeados, exportados como `accentColors` (e como as propriedades personalizadas `--oito2-accent-*`):

| Nome     | Cor       |
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

Qualquer cor hex também é aceita (`accent="#7c3aed"`). O esquema base ajusta o destaque até que texto branco sobre ele alcance 4,5:1, ou 7:1 em alto contraste, então o papel `primary` pode ficar mais escuro que a cor informada. O alto contraste também eleva o texto a 7:1 e os contornos a 4,5:1.

`accent` só afeta o esquema base: quando `light` ou `dark` fornece um tema (um preset, por exemplo), esse tema é usado como está.

## Presets nomeados

`@oito2/ui-themes` oferece 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard e Catppuccin). `presetTheme(name)` devolve uma fonte de tema para a prop `light` ou `dark` que mantém o alto contraste funcionando:

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

Cada preset tem um brilho fixo (`themePresets[name].isDark`). O showcase deixa o usuário escolher o esquema base ou um preset, e fixa o modo no brilho do preset ([`apps/showcase/src/routes/+layout.svelte`](../../../apps/showcase/src/routes/+layout.svelte)):

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

`themePresetNames` lista o nome de cada preset e `themePresets[name].label` o nome de exibição, para um seletor. A lista completa está no [README de `@oito2/ui-themes`](../../../packages/ui-themes/README.md).

## Temas próprios

`createColorTheme` monta o esquema base a partir de qualquer destaque. Passe-o como função para `light`/`dark`, para que o provider possa reconstruí-lo com o contraste que resolver:

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

`colorThemeFromRoles` monta um tema a partir de um conjunto completo de cores de papéis; é o que os presets usam. As duas funções também são exportadas por `@oito2/ui/theme`, que não depende do Svelte, para scripts de build e pacotes de temas.

## Lendo o tema

`useTheme()` devolve uma referência viva ao tema do `ThemeProvider` mais próximo (ou ao esquema base claro, quando não há nenhum). Chame-a durante a inicialização do componente e leia `.current`:

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

| Campo          | Conteúdo                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| `brightness`   | `'light'` ou `'dark'`                                                     |
| `highContrast` | Se o tema foi montado para alto contraste                                 |
| `background`   | O fundo da página                                                         |
| `colorScheme`  | Os papéis do Material 3 (`primary`, `onSurface`, `surfaceContainer`, ...) |
| `semantic`     | `primaryText`, `errorText`, `success`, `warning`, `info`, `link`          |
| `chrome`       | `background`, `sidebar`, `mainbar`, `titleBar`, `dialog`                  |
| `syntax`       | As cores de código, por papel (`keyword`, `string`, `comment`, ...)       |

No CSS, leia os mesmos valores pelas propriedades personalizadas (`var(--oito2-color-primary-text)`, `var(--oito2-chrome-sidebar)`, `var(--oito2-syntax-keyword)`). A `div` do provider também carrega `data-oito2-brightness` (`light`/`dark`) e `data-oito2-contrast` (`normal`/`high`) para seletores. A lista completa está em [Propriedades CSS personalizadas](../reference/css-custom-properties.md).

## Sobrescrevendo tokens e estilos

Todas as regras de `@oito2/ui` ficam na camada de cascata `oito2`, então qualquer regra **sem camada** do seu app vence, seja qual for a especificidade.

- **Tokens** (espaçamento, raio, tamanhos, tipografia) são declarados em `:root`. Redefina-os em `:root` ou em qualquer elemento:

  ```css
  :root {
  	--oito2-radius-medium: 4px;
  	--oito2-font-family: 'IBM Plex Sans', sans-serif;
  }
  ```

- **Variáveis de cor** são escritas pelo `ThemeProvider` como `style` inline na sua `div`, que uma folha de estilos não consegue sobrescrever nesse mesmo elemento. Defina-as num elemento **dentro** do provider:

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

  A prop `style` do próprio `ThemeProvider` é substituída pelas variáveis do tema, então não a use para sobrescritas.

- **Estilos dos componentes**: os componentes têm classes `oito2-*` (`oito2-button`, `oito2-file-drop-zone`, ...) e atributos de estado (`data-variant`, `data-state`, `data-disabled`, ...). Uma regra sem camada numa folha de estilos global vence a regra do próprio componente:

  ```css
  /* A global, unlayered stylesheet of the app */
  .oito2-button[data-variant='filled'] {
  	text-transform: uppercase;
  }
  ```

Alguns componentes leem propriedades personalizadas opcionais com um valor de reserva, como `--oito2-navigation-rail-color` ou `--oito2-master-detail-pane-color`; elas estão listadas em [Propriedades CSS personalizadas](../reference/css-custom-properties.md#propriedades-personalizadas-dos-componentes).

## Densidade

Os controles têm dois tamanhos: **ponteiro** (controles de 34 px, o padrão) e **toque** (controles de 40 px, alvos maiores). `density.css` (parte de `styles.css`) escolhe entre eles:

| Condição                                                                      | Tamanho  |
| ----------------------------------------------------------------------------- | -------- |
| Padrão                                                                        | ponteiro |
| `@media (pointer: coarse)` e nenhum `data-oito2-density="pointer"` em `:root` | toque    |
| `data-oito2-density="touch"` num elemento                                     | toque    |
| `data-oito2-density="pointer"` num elemento                                   | ponteiro |

O atributo vale para o elemento e tudo o que está dentro dele. O showcase o coloca no seu `ThemeProvider` a partir de uma configuração (`auto`, `pointer` ou `touch`):

```svelte
<ThemeProvider data-oito2-density={density === 'auto' ? undefined : density}>
	{@render children()}
</ThemeProvider>
```

Os componentes se dimensionam pelas variáveis de densidade (`--oito2-control-height`, `--oito2-icon-size`, `--oito2-toggle-size`, ...), que os seus próprios controles também podem usar.

## CSS estático dos esquemas

Duas folhas de estilo opcionais trazem temas pré-calculados como propriedades personalizadas, aplicados com o atributo `data-oito2-scheme`. São úteis para conteúdo fora de um `ThemeProvider`, ou para dar a uma parte da página um tema diferente:

| Import                         | Seletores                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui/schemes.css`        | O esquema base de cada brilho e destaque nomeado, com uma variante de alto contraste: `light-blue`, `dark-teal-hc`, ... |
| `@oito2/ui-themes/presets.css` | Cada preset e a sua variante de alto contraste: `everforest-light`, `rose-pine-moon`, `catppuccin-mocha-hc`, ...        |

```svelte
<script lang="ts">
	import '@oito2/ui/schemes.css';
</script>

<aside data-oito2-scheme="dark-purple">
	<p style:color="var(--oito2-color-on-surface)">A dark panel with the purple accent.</p>
</aside>
```

O atributo só define as propriedades personalizadas (e `color-scheme`); pinte o fundo você mesmo (`var(--oito2-color-background)` ou um papel de superfície). As regras ficam na camada `oito2`, e cada elemento com o atributo define os seus próprios valores, então ele também funciona dentro de um `ThemeProvider`.

## Veja também

- [Tokens e temas](../architecture/tokens-and-themes.md) — como os esquemas são calculados e gerados.
- [Propriedades CSS personalizadas](../reference/css-custom-properties.md) — todas as variáveis e atributos de dados.
- As páginas [Colors](https://oito2.github.io/oito2_uikit/colors) e [Material theme](https://oito2.github.io/oito2_uikit/material) do showcase.
