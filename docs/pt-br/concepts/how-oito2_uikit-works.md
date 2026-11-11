🌐 [English](../../en/concepts/how-oito2_uikit-works.md) | **Português** | 🏠 [Índice](../index.md)

---

# Como o oito2_uikit funciona

Esta página acompanha um app desde os design tokens até uma janela com tema e uma barra de título de aparência nativa. Cada passo aponta para a página que o detalha.

![O showcase do oito2_uikit](../../img/showcase.png)

<!-- TODO: capture a screenshot of the showcase main window -->

## 1. Tokens

Tudo começa pelos design tokens do oito2_ui: raios de canto, espaçamento, tamanhos de controle, os nove acentos nomeados, as paletas neutras clara e escura, as cores de status e a escala tipográfica. Eles ficam em um único módulo TypeScript, `packages/ui/src/lib/tokens/values.ts`, e um gerador os transforma em custom properties CSS no `tokens.css`:

```css
--oito2-radius-medium: 8px;
--oito2-space-md: 12px;
--oito2-size-button-height: 34px;
--oito2-accent-blue: #3584e4;
```

O `density.css` deriva os tamanhos de controle que os componentes leem (`--oito2-control-height`, `--oito2-icon-size`…): tamanhos de ponteiro por padrão, tamanhos de toque sob um ponteiro grosso ou `data-oito2-density="touch"`.

Veja [Tokens e temas](../architecture/tokens-and-themes.md).

## 2. Esquemas de cores

Um esquema de cores (`ColorTheme`) é calculado em TypeScript a partir de um brilho, um acento e um nível de contraste:

- `createColorTheme({ brightness, accent, highContrast })` monta o **esquema base**: neutros no estilo GTK com o acento como matiz primária, mais os papéis do Material 3 gerados a partir do acento.
- `colorThemeFromRoles(roles)` monta um esquema a partir das poucas cores de papel que uma família de temas publica; o `@oito2/ui-themes` o usa nos seus 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard, Catppuccin).

Nos dois casos, as cores de texto, contorno, semânticas e de sintaxe são ajustadas até atingir WCAG AA (AAA com alto contraste) contra todas as superfícies do esquema.

## 3. ThemeProvider

O `ThemeProvider` transforma o esquema em CSS. Ele renderiza uma `div` que carrega cada cor como custom property (`--oito2-color-primary`, `--oito2-chrome-title-bar`, `--oito2-syntax-keyword`…), então tudo dentro dela fica com o tema:

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

Por padrão ele segue o sistema: claro ou escuro por `prefers-color-scheme`, o acento e o alto contraste pelo `SystemScope` mais próximo, e `prefers-contrast: more`.

![O showcase no modo escuro](../../img/showcase-dark.png)

<!-- TODO: capture a screenshot of the showcase in dark mode -->

![O showcase em alto contraste](../../img/showcase-high-contrast.png)

<!-- TODO: capture a screenshot of the showcase with high contrast on -->

## 4. Componentes

Os componentes leem os tokens e o tema apenas por `var(--oito2-…)`. Todas as suas regras ficam na camada de cascata `oito2`, então o CSS do próprio app, fora de camadas, sempre vence. O comportamento — papéis, teclado, foco, fechamento — segue as WAI-ARIA Authoring Practices e é construído sobre primitivas internas compartilhadas (escopo de foco, foco itinerante, typeahead, camada dispensável, posicionamento flutuante). Veja [Primitivas de interação](../architecture/interaction-primitives.md).

Todos os componentes seguem os mesmos dois contratos de props:

- **Valores e estados de abertura.** Um componente com valor ou estado de abertura o recebe como prop (`value`, `checked`, `open`, `page`…) que pode ser vinculada, o valor inicial como `default<Nome>` quando o pai não o controla, e informa cada mudança por `on<Nome>Change`. Vincule a prop para manter o valor sincronizado; um valor passado sem `bind:` muda dentro do componente até o pai passar um novo, e toda mudança é informada.
- **Atributos HTML.** Atributos e handlers de evento que o componente não nomeia chegam ao seu elemento principal. O handler do consumidor roda antes do handler do próprio componente para o mesmo evento, e chamar `preventDefault()` nele cancela o comportamento do componente; `class` e `style` são concatenados aos do componente.

## 5. Overlays e o Portal

Diálogos, menus, popovers, tooltips e selects precisam escapar do recorte e do empilhamento do elemento que os abre. Eles renderizam por um `Portal` interno em um elemento hospedeiro que o `ThemeProvider` mais próximo coloca no fim da própria `div`. Como o hospedeiro está dentro da `div` com tema, os overlays mantêm as custom properties do tema; eles são posicionados com `position: fixed` (os ancorados, pelo `@floating-ui/dom`). Sem um `ThemeProvider`, o portal usa o `document.body`.

## 6. Configurações do sistema: SystemScope e SystemSettingsScope

Os componentes que se adaptam ao sistema operacional leem um objeto `SystemSettings` do `SystemScope` mais próximo:

| Campo                | Exemplo                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `platform`           | Linux, Windows ou macOS; web ou nativo                            |
| `desktopEnvironment` | `gnome`, `kde`, `xfce`, `cosmic`… (só no Linux)                   |
| `windowControlStyle` | `gnome`, `breeze`, `xfwm`, `cosmic`, `windows`, `macos` ou `none` |
| `windowButtonLayout` | Quais botões da janela ficam em qual lado, em ordem               |
| `accentColor`        | O acento do sistema em hex, ou `null`                             |
| `highContrast`       | Se o sistema pede alto contraste                                  |

Sem um escopo, os componentes usam `fallbackSystemSettings`, derivado só da plataforma. Em um app Tauri, o `SystemSettingsScope` do `@oito2/ui-settings` preenche o escopo com os valores reais lidos pelo `tauri-plugin-oito2-settings` e os mantém atualizados. Colocado por fora do `ThemeProvider`, ele faz o tema também seguir o acento e o contraste do sistema:

```svelte
<SystemSettingsScope>
	<ThemeProvider>
		{@render children()}
	</ThemeProvider>
</SystemSettingsScope>
```

Veja [Configurações do sistema](../architecture/system-settings.md).

## 7. Moldura da janela: WindowScope e as barras de título

Apps desktop costumam trocar a barra de título do sistema pela sua (decorações client-side). As barras de título do `@oito2/ui` — `HeaderBar`, `WindowTitleBar`, `TitleBar`, `DialogTitleBar` — desenham os botões da janela no estilo e no layout que o `SystemScope` informa, e conversam com a janela por um `WindowController` fornecido pelo `WindowScope`:

- no Tauri, `initWindow()` do `@oito2/ui-window` devolve um `NativeWindowController` que minimiza, maximiza, fecha, arrasta e redimensiona a janela real e abre o menu nativo da janela;
- no navegador, `initWindow()` devolve `null` e as barras de título não mostram controles de janela funcionais.

Os seis estilos de controles de janela:

![Barra de título no estilo GNOME](../../img/title-bar-gnome.png)

<!-- TODO: capture a screenshot of a title bar in the gnome style -->

![Barra de título no estilo KDE Breeze](../../img/title-bar-breeze.png)

<!-- TODO: capture a screenshot of a title bar in the breeze style -->

![Barra de título no estilo Xfwm](../../img/title-bar-xfwm.png)

<!-- TODO: capture a screenshot of a title bar in the xfwm style -->

![Barra de título no estilo COSMIC](../../img/title-bar-cosmic.png)

<!-- TODO: capture a screenshot of a title bar in the cosmic style -->

![Barra de título no estilo Windows](../../img/title-bar-windows.png)

<!-- TODO: capture a screenshot of a title bar in the windows style -->

![Barra de título do macOS com os semáforos nativos](../../img/title-bar-macos.png)

<!-- TODO: capture a screenshot of a title bar on macOS with the traffic lights -->

Veja [Moldura da janela](../architecture/window-chrome.md).

## 8. Os plugins Rust

Dois plugins Tauri v2 fazem o que o webview não consegue:

| Plugin                        | Comandos e eventos                                           | Lado do webview      |
| ----------------------------- | ------------------------------------------------------------ | -------------------- |
| `tauri-plugin-oito2-window`   | `set_decoration_mode`, `decoration_mode`, `show_window_menu` | `@oito2/ui-window`   |
| `tauri-plugin-oito2-settings` | `read_settings`, evento `oito2-settings://changed`           | `@oito2/ui-settings` |

Os plugins devolvem valores brutos; os pacotes TypeScript os transformam no que os componentes precisam. As permissões de cada plugin estão no README dele e em [Plugins Tauri](../reference/tauri-plugins.md).

## Juntando tudo

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

O [Início rápido](../getting-started/quickstart.md) mostra uma configuração completa, incluindo o lado Rust e a capability.
