🌐 [Português](../../pt-br/guides/desktop-integration.md) | **English** | 🏠 [Index](../index.md)

---

# Desktop integration

How to give a Tauri v2 app the real desktop settings (accent, high contrast, window button layout), the oito2 title bar with working window controls, and a window frame that suits each operating system. Everything here follows the showcase app ([`apps/showcase`](../../../apps/showcase)), which is itself a Tauri app built from these packages.

![The showcase with its header bar on Linux](../../img/desktop-integration-header-bar.png)

<!-- TODO: capture a screenshot of the showcase header bar and window controls on Linux -->

## Table of Contents

- [The pieces](#the-pieces)
- [Rust side](#rust-side)
- [Window configuration per OS](#window-configuration-per-os)
- [Capabilities](#capabilities)
- [Webview side](#webview-side)
- [Title bars](#title-bars)
- [Decoration modes and resize handles](#decoration-modes-and-resize-handles)
- [Reading the settings](#reading-the-settings)
- [Running the same code in a browser](#running-the-same-code-in-a-browser)

## The pieces

| Piece                                        | Package / crate                                      | Role                                                                                              |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `SystemSettingsScope`                        | `@oito2/ui-settings` + `tauri-plugin-oito2-settings` | Reads the desktop environment, button layout, accent and high contrast, and follows their changes |
| `initWindow()`, `NativeWindowController`     | `@oito2/ui-window` + `tauri-plugin-oito2-window`     | Sets the window frame and connects the title bar to the real window                               |
| `WindowScope`, `HeaderBar`, `WindowTitleBar` | `@oito2/ui`                                          | Provide the controller to the title bars and draw them in the desktop's style                     |
| `WindowResizeHandles`                        | `@oito2/ui-window`                                   | Resize edges for an `undecorated` window on Linux                                                 |

## Rust side

Add both plugins from the repository (they are not on crates.io) in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Register them in `src-tauri/src/lib.rs` and apply the frame in `setup`, while the window is still hidden, then show it. This is the showcase's `run()` without its debug-only commands:

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

`apply_decoration_mode` must run on the main thread before the window is shown, which `setup` guarantees; on Linux it fails with `unsupported: window already visible` for a window that is already shown (GTK cannot switch a visible window to client-side decorations), and the webview's `setDecorationMode` rejects the same way. `DecorationMode::platform_default()` is `gtk-headerless` on Linux, `undecorated` on Windows and `native` on macOS. On Linux, `tauri_plugin_oito2_settings::init()` also starts watching the settings.

The showcase additionally reads the mode from the `OITO2_DECORATIONS` environment variable (`native`, `undecorated` or `gtk-headerless`) to try the other frames; that is showcase code, not a plugin feature.

## Window configuration per OS

The base `tauri.conf.json` declares the window hidden, so `setup` can change its frame first:

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

Tauri merges `tauri.linux.conf.json` and `tauri.macos.conf.json` over it on those systems. The override replaces the whole `windows` array, so the showcase repeats the complete window entry in each file and adds:

| File                    | Added keys                                                                                          | Effect                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `tauri.linux.conf.json` | `"transparent": true`                                                                               | An RGBA window, which `gtk-headerless` needs: see below                                  |
| `tauri.macos.conf.json` | `"titleBarStyle": "Overlay"`, `"hiddenTitle": true`, `"trafficLightPosition": { "x": 16, "y": 17 }` | Keeps the native frame and traffic lights, and lets the app's header bar draw under them |

There is no Windows override: the `undecorated` default removes the system frame.

`"transparent": true` on Linux gives the window an RGBA visual, so the shadow and rounded corners that GTK draws around a `gtk-headerless` window are not painted on an opaque rectangle. The page must then paint its own opaque background (the `ThemeProvider` host and `body` of the showcase do), and on X11 without a compositor such a window shows black. Apps that use the `native` or `undecorated` frame on Linux do not need it.

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

The files of the showcase are in [`apps/showcase/src-tauri/`](../../../apps/showcase/src-tauri).

## Capabilities

The showcase grants its main window exactly these permissions ([`capabilities/default.json`](../../../apps/showcase/src-tauri/capabilities/default.json)):

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

| Permission                                                       | Needed for                                                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `core:default`                                                   | Reading the window state and listening to events (including `oito2-settings://changed`) |
| `core:window:allow-minimize`, `-toggle-maximize`, `-close`       | The window control buttons                                                              |
| `core:window:allow-start-dragging`                               | Moving the window from the title bar                                                    |
| `core:window:allow-start-resize-dragging`                        | `WindowResizeHandles`                                                                   |
| `oito2-window:default`                                           | `set_decoration_mode`, `decoration_mode` and `show_window_menu`                         |
| `oito2-settings:default`                                         | `read_settings`                                                                         |
| `dialog:*`, `fs:*`                                               | The file components only — see [Files](./files.md)                                      |
| `opener:allow-open-url` (scoped to `https://github.com/oito2/*`) | The "Open on GitHub" links, opened in the system browser through `tauri-plugin-opener`  |

External links are opened through `tauri-plugin-opener` (registered in `lib.rs`), because a `target="_blank"` link opens nothing inside the webview; the permission is scoped to the repository's URLs, so no other address can be opened from the page.

`initWindow()` options that change the window need more: `title` → `core:window:allow-set-title`, `size` → `core:window:allow-set-size`, `minimumSize` → `core:window:allow-set-min-size`, `center` → `core:window:allow-center`, and `show` (on by default) → `core:window:allow-show` and `core:window:allow-set-focus`. The showcase calls `initWindow({ show: false })` and passes no other option, so it needs none of them. Every permission identifier is listed in [Tauri plugins](../reference/tauri-plugins.md).

## Webview side

Install the guest packages:

```bash
pnpm add @oito2/ui @oito2/ui-window @oito2/ui-settings
```

Then nest the scopes in the root layout. `SystemSettingsScope` goes **outside** `ThemeProvider`, so the theme follows the system accent and contrast; `WindowScope` goes inside it, around the title bar:

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

`initWindow` resolves to the same controller when it is called again for a window whose controller is still alive, and to `null` when its `signal` aborts before it finishes (the controller it was creating is disposed), so a layout that unmounts before the window is ready leaks nothing. It rejects with `oito2: tauri-plugin-oito2-window is not registered or the capability does not allow it` (the Tauri error as `cause`) when the plugin or the `oito2-window:default` permission is missing.

A Tauri app built with SvelteKit is a client-only SPA (`export const ssr = false` in the root `+layout.ts`, `adapter-static` with `fallback: 'index.html'`), as the showcase is.

Without a Rust `setup`, let the webview apply the frame and show the window instead — this needs `core:window:allow-show` and `core:window:allow-set-focus`:

```ts
const controller = await initWindow({ decorations: 'gtk-headerless' });
```

## Title bars

All title bars read the controller from the closest `WindowScope` and the desktop style from the closest `SystemScope` (which `SystemSettingsScope` provides).

| Component        | Use                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HeaderBar`      | GNOME-style header bar: `start` and `end` snippets, a `title`, an optional search (`searchable`) or `tabs` as a view switcher                                 |
| `WindowTitleBar` | The plain window title bar, set up for the platform: the desktop's control style and button layout on Linux and Windows, room for the traffic lights on macOS |
| `TitleBar`       | The low-level bar: you pass `controlStyle`, `buttonLayout`, `leading`/`trailing` content and `barStyle` yourself                                              |
| `DialogTitleBar` | The title bar of a dialog window or panel: a title and only a close button                                                                                    |

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

The empty background of a title bar moves the window, a double click maximizes it, and the secondary button opens the native window menu (Linux and Windows). The window control styles cover GNOME, Breeze, Xfwm, COSMIC, Windows and macOS. The full props are in the showcase API reference of [Header bar](https://oito2.github.io/oito2_uikit/header-bar) and [Title bar](https://oito2.github.io/oito2_uikit/title-bar).

## Decoration modes and resize handles

| Mode             | Frame                                                                                                                                | Default on |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `native`         | The system title bar and frame                                                                                                       | macOS      |
| `undecorated`    | No system frame; the app draws the title bar                                                                                         | Windows    |
| `gtk-headerless` | GTK client-side decorations with an empty title bar: GTK keeps the shadow and resize edges; elsewhere it falls back to `undecorated` | Linux      |

`WindowResizeHandles` renders invisible edge and corner handles only on Linux, while the window is `undecorated` and neither maximized nor full screen; with `gtk-headerless`, GTK resizes the window itself. Its `thickness` prop (default 6 pixels) sets the handle size.

`NativeWindowController` mirrors the window on the root element for CSS: `data-oito2-decorations` (the mode) and the boolean attributes `data-oito2-window-maximized`, `data-oito2-window-fullscreen` and `data-oito2-window-inactive`.

## Reading the settings

Components read the settings through `useSystemSettings()` from `@oito2/ui`:

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

`SystemSettingsScope` reads the settings once mounted, follows the change event the plugin emits on Linux, and reads them again whenever the window regains focus (the only update path on Windows and macOS). Its optional props are `initialSettings`, `source`, `platform` and `onSettingsChange`. To read the settings once without a component, call `loadSystemSettings()`. When a read or the subscription fails (no plugin, no permission), the scope keeps the current settings and prints one `console.warn` with the cause. Inside a Flatpak or Snap sandbox, `XDG_CONFIG_HOME` points at the sandbox's own directory (`~/.var/app/<id>/config` for Flatpak), so the plugin does not find `kwinrc`, `kdeglobals`, `xfwm4.xml` or the COSMIC files there; the XDG desktop portal and GSettings sources still work. What each platform reports is in the [`@oito2/ui-settings` README](../../../packages/ui-settings/README.md#platform-coverage) and in [System settings](../architecture/system-settings.md).

## Running the same code in a browser

Outside Tauri, `initWindow()` resolves to `null` and the title bars show no working window controls; `SystemSettingsScope` keeps the platform defaults (`fallbackSystemSettings`). The same layout therefore runs in a plain web build. The showcase goes one step further: in the browser it renders a `SystemScope` with simulated settings and a simulated window controller, so its title bar can imitate each desktop.

## See also

- [`@oito2/ui-window` README](../../../packages/ui-window/README.md) and [`@oito2/ui-settings` README](../../../packages/ui-settings/README.md)
- [Window chrome](../architecture/window-chrome.md) and [System settings](../architecture/system-settings.md) — the internals.
- [Tauri plugins](../reference/tauri-plugins.md) — commands, permissions and events.
