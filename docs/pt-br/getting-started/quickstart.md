🌐 [English](../../en/getting-started/quickstart.md) | **Português** | 🏠 [Índice](../index.md)

---

# Início rápido

O caminho mais curto até um app desktop Tauri v2 + SvelteKit que usa o `@oito2/ui`, com uma janela com tema, a barra de título do oito2 e as configurações do sistema. Ele segue, de forma simplificada, o que o showcase faz em `apps/showcase`. Instale os [pré-requisitos](./prerequisites.md) antes.

![Um app mínimo com a barra de título do oito2](../../img/quickstart-window.png)

<!-- TODO: capture a screenshot of the quickstart app window -->

## 1. Crie um app Tauri v2 + SvelteKit

Parta de qualquer projeto Tauri v2 com frontend SvelteKit, por exemplo o scaffold oficial (escolha pnpm, Svelte e TypeScript):

```bash
pnpm create tauri-app
cd my-app
pnpm install
```

Os passos abaixo supõem o layout usual: o app SvelteKit em `src/` e o lado Rust em `src-tauri/`.

## 2. Torne o frontend um app só de cliente

O Tauri serve arquivos estáticos, então o app é uma single-page app sem renderização no servidor. Em `src/routes/+layout.ts`:

```ts
export const ssr = false;
export const prerender = false;
```

Use o `@sveltejs/adapter-static` com `fallback: 'index.html'`. O showcase (SvelteKit 3) configura o Kit em `vite.config.ts`:

```ts
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter({ fallback: 'index.html' }) })],
	// Tauri expects a fixed port and must see Rust errors in the terminal.
	clearScreen: false,
	server: { port: 5173, strictPort: true, watch: { ignored: ['**/src-tauri/**'] } }
});
```

Se o seu scaffold mantém as opções do Kit em `svelte.config.js`, configure o mesmo adapter lá. Mantenha `build.devUrl` e `build.frontendDist` do `tauri.conf.json` apontando para a porta do servidor de desenvolvimento e para a pasta de saída do adapter.

## 3. Adicione os pacotes

```bash
pnpm add @oito2/ui @oito2/ui-window @oito2/ui-settings
```

Em `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Use a tag da release que corresponde aos seus pacotes npm.

## 4. Registre os plugins e defina a moldura

Em `src-tauri/src/lib.rs`, registre os dois plugins e aplique a moldura da janela enquanto ela ainda está oculta; depois, mostre-a:

```rust
use tauri::Manager;
use tauri_plugin_oito2_window::{DecorationMode, apply_decoration_mode};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oito2_window::init())
        .plugin(tauri_plugin_oito2_settings::init())
        .setup(|app| {
            // The window starts hidden so the frame can change before it is shown.
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

O padrão da plataforma é a decoração do lado do cliente do GTK no Linux (`gtk-headerless`), nenhuma moldura do sistema no Windows (`undecorated`) e a moldura nativa no macOS (`native`).

## 5. Configure a janela

Em `src-tauri/tauri.conf.json`, dê à janela o rótulo `main` e inicie-a oculta:

```json
"app": {
	"windows": [
		{
			"label": "main",
			"title": "My app",
			"width": 1100,
			"height": 760,
			"visible": false
		}
	]
}
```

O showcase adiciona dois arquivos de plataforma ao lado dele. Cada um repete a janela, porque o Tauri mescla o array `windows` como um todo.

`src-tauri/tauri.linux.conf.json` — uma janela transparente no Linux:

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
				"visible": false,
				"transparent": true
			}
		]
	}
}
```

`src-tauri/tauri.macos.conf.json` — a barra de título do app desenhada sob os botões nativos ("semáforo") do macOS:

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
				"visible": false,
				"titleBarStyle": "Overlay",
				"hiddenTitle": true,
				"trafficLightPosition": { "x": 16, "y": 17 }
			}
		]
	}
}
```

## 6. Conceda as permissões

`src-tauri/capabilities/default.json`:

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"description": "Main window: core defaults, the window actions of the title bar and the system settings.",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"core:window:allow-minimize",
		"core:window:allow-toggle-maximize",
		"core:window:allow-close",
		"core:window:allow-start-dragging",
		"core:window:allow-start-resize-dragging",
		"oito2-window:default",
		"oito2-settings:default"
	]
}
```

Mantenha qualquer permissão de que o seu scaffold já precise (como `opener:default`).

## 7. Aplique o tema à janela

Substitua `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider, WindowScope, WindowTitleBar } from '@oito2/ui';
	import { SystemSettingsScope } from '@oito2/ui-settings';
	import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';
	import { onMount } from 'svelte';

	let { children } = $props();

	let controller: NativeWindowController | null = $state(null);

	onMount(() => {
		// The Rust setup already applied the frame and showed the window.
		void initWindow({ show: false }).then((value) => (controller = value));
		return () => controller?.dispose();
	});
</script>

<SystemSettingsScope>
	<ThemeProvider class="app">
		<WindowScope {controller}>
			<WindowTitleBar title="My app" />
			<main>{@render children()}</main>
			<WindowResizeHandles {controller} />
		</WindowScope>
	</ThemeProvider>
</SystemSettingsScope>

<style>
	:global(.app) {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
</style>
```

O que cada parte faz:

| Parte                 | Papel                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `styles.css`          | Fontes, tokens, tamanhos de densidade e estilos base                                                                                   |
| `SystemSettingsScope` | Lê o ambiente desktop, o layout dos botões, o destaque e o contraste pelo plugin de configurações; padrões da plataforma fora do Tauri |
| `ThemeProvider`       | Aplica o tema de cores (segue por padrão a preferência claro/escuro e o destaque do sistema) e hospeda as sobreposições                |
| `WindowScope`         | Entrega às barras de título o controlador da janela; `initWindow()` retorna `null` fora do Tauri                                       |
| `WindowTitleBar`      | A barra de título no estilo do desktop (GNOME, Breeze, Xfwm, COSMIC, Windows) ou com espaço para os botões nativos do macOS            |
| `WindowResizeHandles` | Alças nas bordas e cantos que redimensionam uma janela `undecorated` no Linux                                                          |

Depois, use componentes em uma página, por exemplo `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { Button, toast } from '@oito2/ui';
</script>

<Button variant="tonal" onclick={() => toast('Hello')}>Say hello</Button>
```

O `toast()` precisa de um `<Toaster />` (do `@oito2/ui`) dentro do `ThemeProvider`; adicione um ao layout se usá-lo.

## 8. Execute

```bash
pnpm tauri dev
```

A janela abre com a barra de título do oito2 e segue o tema do sistema. Gere os instaladores com `pnpm tauri build` (veja [Instalação](./installation.md)).

## Próximos passos

- Navegue por todos os componentes no [showcase online](https://oito2.github.io/oito2_uikit/).
- [Temas](../guides/theming.md) — destaques, presets, alto contraste e densidade.
- [Integração com o desktop](../guides/desktop-integration.md) — moldura da janela e configurações do sistema em detalhe.
- [Problemas comuns](../troubleshooting/common-issues.md) se algo não funcionar.
