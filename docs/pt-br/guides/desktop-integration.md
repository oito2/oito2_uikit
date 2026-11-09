🌐 [English](../../en/guides/desktop-integration.md) | **Português** | 🏠 [Índice](../index.md)

---

# Integração com o desktop

Como dar a um app Tauri v2 as configurações reais do desktop (destaque, alto contraste, disposição dos botões da janela), a barra de título oito2 com controles de janela que funcionam, e uma moldura de janela adequada a cada sistema operacional. Tudo aqui segue o app showcase ([`apps/showcase`](../../../apps/showcase)), que é ele mesmo um app Tauri feito com estes pacotes.

![O showcase com a sua header bar no Linux](../../img/desktop-integration-header-bar.png)

<!-- TODO: capture a screenshot of the showcase header bar and window controls on Linux -->

## Índice

- [As peças](#as-peças)
- [Lado Rust](#lado-rust)
- [Configuração da janela por sistema](#configuração-da-janela-por-sistema)
- [Capabilities](#capabilities)
- [Lado do webview](#lado-do-webview)
- [Barras de título](#barras-de-título)
- [Modos de decoração e alças de redimensionamento](#modos-de-decoração-e-alças-de-redimensionamento)
- [Lendo as configurações](#lendo-as-configurações)
- [Rodando o mesmo código num navegador](#rodando-o-mesmo-código-num-navegador)

## As peças

| Peça                                         | Pacote / crate                                       | Papel                                                                                                     |
| -------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `SystemSettingsScope`                        | `@oito2/ui-settings` + `tauri-plugin-oito2-settings` | Lê o ambiente de desktop, a disposição dos botões, o destaque e o alto contraste, e acompanha as mudanças |
| `initWindow()`, `NativeWindowController`     | `@oito2/ui-window` + `tauri-plugin-oito2-window`     | Define a moldura da janela e liga a barra de título à janela real                                         |
| `WindowScope`, `HeaderBar`, `WindowTitleBar` | `@oito2/ui`                                          | Fornecem o controlador às barras de título e as desenham no estilo do desktop                             |
| `WindowResizeHandles`                        | `@oito2/ui-window`                                   | Bordas de redimensionamento para uma janela `undecorated` no Linux                                        |

## Lado Rust

Adicione os dois plugins a partir do repositório (eles não estão no crates.io) em `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Registre-os em `src-tauri/src/lib.rs` e aplique a moldura no `setup`, enquanto a janela ainda está oculta; depois mostre-a. Este é o `run()` do showcase sem os seus comandos de depuração:

```rust
use tauri::Manager;
use tauri_plugin_oito2_window::{DecorationMode, apply_decoration_mode};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oito2_window::init())
        .plugin(tauri_plugin_oito2_settings::init())
        .setup(|app| {
            // The main window starts hidden so the frame can change before it is shown.
            if let Some(window) = app.get_webview_window("main") {
                let mode = DecorationMode::platform_default();
                if let Err(error) = apply_decoration_mode(&window, mode) {
                    eprintln!("could not apply decoration mode {mode:?}: {error}");
                }
                window.show()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the app");
}
```

`apply_decoration_mode` precisa rodar na thread principal antes de a janela aparecer, o que o `setup` garante; no Linux ele falha com `unsupported: window already visible` para uma janela já mostrada (o GTK não consegue passar uma janela visível para decorações do lado do cliente), e o `setDecorationMode` do webview rejeita do mesmo jeito. `DecorationMode::platform_default()` é `gtk-headerless` no Linux, `undecorated` no Windows e `native` no macOS. No Linux, `tauri_plugin_oito2_settings::init()` também começa a vigiar as configurações.

O showcase lê ainda o modo da variável de ambiente `OITO2_DECORATIONS` (`native`, `undecorated` ou `gtk-headerless`) para experimentar as outras molduras; isso é código do showcase, não um recurso do plugin.

## Configuração da janela por sistema

O `tauri.conf.json` base declara a janela oculta, para que o `setup` possa trocar a moldura primeiro:

```json
"app": {
	"windows": [
		{
			"label": "main",
			"title": "My app",
			"width": 1100,
			"height": 760,
			"minWidth": 360,
			"minHeight": 300,
			"resizable": true,
			"visible": false
		}
	]
}
```

O Tauri mescla `tauri.linux.conf.json` e `tauri.macos.conf.json` sobre ele nesses sistemas. A sobreposição substitui o array `windows` inteiro, por isso o showcase repete a entrada completa da janela em cada arquivo e acrescenta:

| Arquivo                 | Chaves acrescentadas                                                                                | Efeito                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tauri.linux.conf.json` | `"transparent": true`                                                                               | Uma janela RGBA, de que o `gtk-headerless` precisa: veja abaixo                                      |
| `tauri.macos.conf.json` | `"titleBarStyle": "Overlay"`, `"hiddenTitle": true`, `"trafficLightPosition": { "x": 16, "y": 17 }` | Mantém a moldura e os botões de semáforo nativos, e deixa a header bar do app ser desenhada sob eles |

Não há sobreposição para o Windows: o padrão `undecorated` remove a moldura do sistema.

`"transparent": true` no Linux dá à janela um visual RGBA, para que a sombra e os cantos arredondados que o GTK desenha em volta de uma janela `gtk-headerless` não sejam pintados sobre um retângulo opaco. A página precisa então pintar o seu próprio fundo opaco (o host do `ThemeProvider` e o `body` do showcase o fazem), e no X11 sem compositor uma janela assim aparece preta. Apps que usam a moldura `native` ou `undecorated` no Linux não precisam disso.

```json
{
	"$schema": "https://schema.tauri.app/config/2",
	"app": {
		"windows": [
			{
				"label": "main",
				"title": "My app",
				"width": 1100,
				"height": 760,
				"minWidth": 360,
				"minHeight": 300,
				"resizable": true,
				"visible": false,
				"titleBarStyle": "Overlay",
				"hiddenTitle": true,
				"trafficLightPosition": { "x": 16, "y": 17 }
			}
		]
	}
}
```

Os arquivos do showcase estão em [`apps/showcase/src-tauri/`](../../../apps/showcase/src-tauri).

## Capabilities

O showcase concede à janela principal exatamente estas permissões ([`capabilities/default.json`](../../../apps/showcase/src-tauri/capabilities/default.json)):

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"core:window:allow-minimize",
		"core:window:allow-toggle-maximize",
		"core:window:allow-close",
		"core:window:allow-start-dragging",
		"core:window:allow-start-resize-dragging",
		"oito2-window:default",
		"oito2-settings:default",
		"dialog:allow-open",
		"dialog:allow-save",
		"fs:allow-stat",
		"fs:allow-read-file",
		"fs:allow-write-file",
		{ "identifier": "opener:allow-open-url", "allow": [{ "url": "https://github.com/oito2/*" }] }
	]
}
```

| Permissão                                                         | Necessária para                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `core:default`                                                    | Ler o estado da janela e escutar eventos (inclusive `oito2-settings://changed`)       |
| `core:window:allow-minimize`, `-toggle-maximize`, `-close`        | Os botões de controle da janela                                                       |
| `core:window:allow-start-dragging`                                | Mover a janela pela barra de título                                                   |
| `core:window:allow-start-resize-dragging`                         | `WindowResizeHandles`                                                                 |
| `oito2-window:default`                                            | `set_decoration_mode`, `decoration_mode` e `show_window_menu`                         |
| `oito2-settings:default`                                          | `read_settings`                                                                       |
| `dialog:*`, `fs:*`                                                | Só os componentes de arquivo — veja [Arquivos](./files.md)                            |
| `opener:allow-open-url` (restrita a `https://github.com/oito2/*`) | Os links "Open on GitHub", abertos no navegador do sistema pelo `tauri-plugin-opener` |

Links externos são abertos pelo `tauri-plugin-opener` (registrado no `lib.rs`), porque um link `target="_blank"` não abre nada dentro do webview; a permissão é restrita às URLs do repositório, então nenhum outro endereço pode ser aberto a partir da página.

As opções de `initWindow()` que alteram a janela precisam de mais: `title` → `core:window:allow-set-title`, `size` → `core:window:allow-set-size`, `minimumSize` → `core:window:allow-set-min-size`, `center` → `core:window:allow-center`, e `show` (ligada por padrão) → `core:window:allow-show` e `core:window:allow-set-focus`. O showcase chama `initWindow({ show: false })` sem nenhuma outra opção, então não precisa de nenhuma delas. Todos os identificadores de permissão estão em [Plugins Tauri](../reference/tauri-plugins.md).

## Lado do webview

Instale os pacotes do lado do webview:

```bash
pnpm add @oito2/ui @oito2/ui-window @oito2/ui-settings
```

Depois aninhe os escopos no layout raiz. `SystemSettingsScope` fica **por fora** do `ThemeProvider`, para que o tema siga o destaque e o contraste do sistema; `WindowScope` fica dentro dele, em volta da barra de título:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { HeaderBar, ThemeProvider, Toaster, WindowScope } from '@oito2/ui';
	import { SystemSettingsScope } from '@oito2/ui-settings';
	import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';
	import { onMount } from 'svelte';

	let { children } = $props();
	let controller: NativeWindowController | null = $state(null);

	onMount(() => {
		const abort = new AbortController();
		// The Rust setup already applied the frame and showed the window.
		initWindow({ show: false, signal: abort.signal }).then(
			(value) => (controller = value),
			(error) => console.error('oito2: could not connect the window', error)
		);
		return () => {
			abort.abort();
			controller?.dispose();
		};
	});
</script>

<SystemSettingsScope>
	<ThemeProvider>
		<WindowScope {controller}>
			<div class="frame">
				<HeaderBar title="My app" />
				<main class="content">{@render children()}</main>
			</div>
			<Toaster placement="bottom-end" />
			<WindowResizeHandles {controller} />
		</WindowScope>
	</ThemeProvider>
</SystemSettingsScope>

<style>
	/* The title bar stays at the top; the content scrolls below it. */
	.frame {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.content {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
</style>
```

`initWindow` resolve para o mesmo controlador quando é chamado de novo para uma janela cujo controlador ainda está vivo, e para `null` quando o seu `signal` é abortado antes de terminar (o controlador que estava criando é descartado), então um layout que desmonta antes de a janela estar pronta não deixa nada vazando. Ele rejeita com `oito2: tauri-plugin-oito2-window is not registered or the capability does not allow it` (o erro do Tauri como `cause`) quando o plugin ou a permissão `oito2-window:default` está faltando.

Um app Tauri feito com SvelteKit é uma SPA só de cliente (`export const ssr = false` no `+layout.ts` raiz, `adapter-static` com `fallback: 'index.html'`), como o showcase.

Sem um `setup` em Rust, deixe o webview aplicar a moldura e mostrar a janela — isso exige `core:window:allow-show` e `core:window:allow-set-focus`:

```ts
const controller = await initWindow({ decorations: 'gtk-headerless' });
```

## Barras de título

Todas as barras de título leem o controlador do `WindowScope` mais próximo e o estilo do desktop do `SystemScope` mais próximo (que o `SystemSettingsScope` fornece).

| Componente       | Uso                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HeaderBar`      | Header bar no estilo GNOME: snippets `start` e `end`, um `title`, uma busca opcional (`searchable`) ou `tabs` como seletor de visões                                            |
| `WindowTitleBar` | A barra de título simples da janela, ajustada à plataforma: o estilo de controles e a disposição dos botões do desktop no Linux e no Windows, espaço para os semáforos no macOS |
| `TitleBar`       | A barra de baixo nível: você mesmo passa `controlStyle`, `buttonLayout`, o conteúdo `leading`/`trailing` e `barStyle`                                                           |
| `DialogTitleBar` | A barra de título de uma janela de diálogo ou painel: um título e só um botão de fechar                                                                                         |

```svelte
<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import Plus from '@lucide/svelte/icons/plus';
	import { HeaderBar, IconButton } from '@oito2/ui';
</script>

<HeaderBar title="Documents">
	{#snippet start()}<IconButton icon={Plus} label="New document" />{/snippet}
	{#snippet end()}<IconButton icon={Menu} label="Main menu" />{/snippet}
</HeaderBar>
```

O fundo vazio de uma barra de título move a janela, um clique duplo a maximiza, e o botão secundário abre o menu nativo da janela (Linux e Windows). Os estilos de controles de janela cobrem GNOME, Breeze, Xfwm, COSMIC, Windows e macOS. As props completas estão na referência de API do showcase em [Header bar](https://oito2.github.io/oito2_uikit/header-bar) e [Title bar](https://oito2.github.io/oito2_uikit/title-bar).

## Modos de decoração e alças de redimensionamento

| Modo             | Moldura                                                                                                                                                                 | Padrão em |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `native`         | A barra de título e a moldura do sistema                                                                                                                                | macOS     |
| `undecorated`    | Sem moldura do sistema; o app desenha a barra de título                                                                                                                 | Windows   |
| `gtk-headerless` | Decorações do lado do cliente do GTK com uma barra de título vazia: o GTK mantém a sombra e as bordas de redimensionamento; nos outros sistemas, cai para `undecorated` | Linux     |

`WindowResizeHandles` renderiza alças invisíveis nas bordas e cantos só no Linux, enquanto a janela está `undecorated` e não está maximizada nem em tela cheia; com `gtk-headerless`, o próprio GTK redimensiona a janela. A prop `thickness` (6 pixels por padrão) define a espessura das alças.

`NativeWindowController` espelha a janela no elemento raiz, para o CSS: `data-oito2-decorations` (o modo) e os atributos booleanos `data-oito2-window-maximized`, `data-oito2-window-fullscreen` e `data-oito2-window-inactive`.

## Lendo as configurações

Os componentes leem as configurações com `useSystemSettings()` de `@oito2/ui`:

```svelte
<script lang="ts">
	import { useSystemSettings } from '@oito2/ui';

	const system = useSystemSettings();
</script>

<p>
	{system.current.desktopEnvironment ?? 'no desktop environment'} ·
	{system.current.windowControlStyle} · accent {system.current.accentColor ?? 'none'}
</p>
```

`SystemSettingsScope` lê as configurações ao ser montado, acompanha o evento de mudança que o plugin emite no Linux e lê de novo sempre que a janela recupera o foco (o único caminho de atualização no Windows e no macOS). As suas props opcionais são `initialSettings`, `source`, `platform` e `onSettingsChange`. Para ler as configurações uma vez, sem componente, chame `loadSystemSettings()`. Quando uma leitura ou a assinatura falha (sem plugin, sem permissão), o escopo mantém as configurações atuais e imprime um `console.warn` com a causa. Dentro de um sandbox Flatpak ou Snap, `XDG_CONFIG_HOME` aponta para o diretório do próprio sandbox (`~/.var/app/<id>/config` no Flatpak), por isso o plugin não encontra ali `kwinrc`, `kdeglobals`, `xfwm4.xml` nem os arquivos do COSMIC; as fontes do portal XDG e do GSettings continuam funcionando. O que cada plataforma informa está no [README de `@oito2/ui-settings`](../../../packages/ui-settings/README.md#platform-coverage) e em [Configurações do sistema](../architecture/system-settings.md).

## Rodando o mesmo código num navegador

Fora do Tauri, `initWindow()` resolve para `null` e as barras de título não mostram controles de janela funcionais; `SystemSettingsScope` mantém os padrões da plataforma (`fallbackSystemSettings`). Assim, o mesmo layout roda num build web comum. O showcase vai um passo além: no navegador ele renderiza um `SystemScope` com configurações simuladas e um controlador de janela simulado, para que a sua barra de título imite cada desktop.

## Veja também

- [README de `@oito2/ui-window`](../../../packages/ui-window/README.md) e [README de `@oito2/ui-settings`](../../../packages/ui-settings/README.md)
- [Chrome da janela](../architecture/window-chrome.md) e [Configurações do sistema](../architecture/system-settings.md) — o funcionamento interno.
- [Plugins Tauri](../reference/tauri-plugins.md) — comandos, permissões e eventos.
