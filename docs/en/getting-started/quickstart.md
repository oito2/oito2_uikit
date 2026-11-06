🌐 [Português](../../pt-br/getting-started/quickstart.md) | **English** | 🏠 [Index](../index.md)

---

# Quickstart

The shortest path to a Tauri v2 + SvelteKit desktop app that uses `@oito2/ui`, with a themed window, the oito2 title bar and the system settings. It follows what the showcase does in `apps/showcase`, simplified. Install the [prerequisites](./prerequisites.md) first.

![A minimal app with the oito2 title bar](../../img/quickstart-window.png)

<!-- TODO: capture a screenshot of the quickstart app window -->

## 1. Create a Tauri v2 + SvelteKit app

Start from any Tauri v2 project with a SvelteKit frontend, for example the official scaffold (pick pnpm, Svelte and TypeScript):

```bash
pnpm create tauri-app
cd my-app
pnpm install
```

The steps below assume the usual layout: the SvelteKit app in `src/`, the Rust side in `src-tauri/`.

## 2. Make the frontend a client-only app

Tauri serves static files, so the app is a single-page app without server-side rendering. In `src/routes/+layout.ts`:

```ts
export const ssr = false;
export const prerender = false;
```

Use `@sveltejs/adapter-static` with `fallback: 'index.html'`. The showcase (SvelteKit 3) configures Kit in `vite.config.ts`:

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

If your scaffold keeps the Kit options in `svelte.config.js`, set the same adapter there. Keep `build.devUrl` and `build.frontendDist` in `tauri.conf.json` pointing at the dev server port and the adapter's output folder.

## 3. Add the packages

```bash
pnpm add @oito2/ui @oito2/ui-window @oito2/ui-settings
```

In `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Use the tag of the release that matches your npm packages.

## 4. Register the plugins and set the frame

In `src-tauri/src/lib.rs`, register both plugins and apply the window frame while the window is still hidden, then show it:

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

The platform default is GTK client-side decorations on Linux (`gtk-headerless`), no system frame on Windows (`undecorated`) and the native frame on macOS (`native`).

## 5. Configure the window

In `src-tauri/tauri.conf.json`, give the window the label `main` and start it hidden:

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

The showcase adds two platform files next to it. Each repeats the window, because Tauri merges the `windows` array as a whole.

`src-tauri/tauri.linux.conf.json` — a transparent window on Linux:

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

`src-tauri/tauri.macos.conf.json` — the app's title bar drawn under the native traffic lights:

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

## 6. Grant the permissions

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

Keep any permission your scaffold already needs (such as `opener:default`).

## 7. Theme the window

Replace `src/routes/+layout.svelte`:

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

What each part does:

| Part                  | Role                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `styles.css`          | Fonts, tokens, density sizes and base styles                                                                                   |
| `SystemSettingsScope` | Reads the desktop environment, button layout, accent and contrast through the settings plugin; platform defaults outside Tauri |
| `ThemeProvider`       | Applies the color theme (follows the system light/dark preference and accent by default) and hosts the overlays                |
| `WindowScope`         | Gives the title bars the window controller; `initWindow()` returns `null` outside Tauri                                        |
| `WindowTitleBar`      | The title bar in the style of the desktop (GNOME, Breeze, Xfwm, COSMIC, Windows) or with room for the macOS traffic lights     |
| `WindowResizeHandles` | Edge and corner handles that resize an `undecorated` Linux window                                                              |

Then use components in a page, e.g. `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { Button, toast } from '@oito2/ui';
</script>

<Button variant="tonal" onclick={() => toast('Hello')}>Say hello</Button>
```

`toast()` needs a `<Toaster />` (from `@oito2/ui`) inside the `ThemeProvider`; add one to the layout if you use it.

## 8. Run it

```bash
pnpm tauri dev
```

The window opens with the oito2 title bar and follows the system theme. Build the installers with `pnpm tauri build` (see [Installation](./installation.md)).

## Next steps

- Browse every component in the [live showcase](https://oito2.github.io/oito2_uikit/).
- [Theming](../guides/theming.md) — accents, presets, high contrast and density.
- [Desktop integration](../guides/desktop-integration.md) — window chrome and system settings in depth.
- [Common issues](../troubleshooting/common-issues.md) if something does not work.
