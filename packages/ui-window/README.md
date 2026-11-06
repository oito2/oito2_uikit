# @oito2/ui-window

Window chrome integration for `@oito2/ui` on Tauri v2: client-side decorations and window controls on Linux, Windows and macOS.

[![npm](https://img.shields.io/npm/v/@oito2/ui-window?label=npm)](https://www.npmjs.com/package/@oito2/ui-window)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

`@oito2/ui` title bars (`HeaderBar`, `TitleBar`, `WindowTitleBar`) read their window from a `WindowScope`. This package provides the controller that connects them to the real Tauri window: minimize, maximize, close, drag, resize, the native window menu and the window state (maximized, full screen, focused). Outside Tauri `initWindow()` returns `null` and the title bars show no working window controls, so the same code runs in a browser.

## Installation

```bash
pnpm add @oito2/ui-window @oito2/ui svelte
```

`svelte` (`^5.57.0`) is a peer dependency; `@tauri-apps/api` comes as a dependency.

### Tauri setup

The package talks to the Rust plugin [`tauri-plugin-oito2-window`](https://github.com/oito2/oito2_uikit/tree/main/plugins/tauri-plugin-oito2-window), which is not on crates.io. Add it from the repository in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Register it and, optionally, apply the frame in `setup` while the window is still hidden (configure the window with `"visible": false`):

```rust
use tauri::Manager;
use tauri_plugin_oito2_window::{DecorationMode, apply_decoration_mode};

tauri::Builder::default()
    .plugin(tauri_plugin_oito2_window::init())
    .setup(|app| {
        if let Some(window) = app.get_webview_window("main") {
            if let Err(error) = apply_decoration_mode(&window, DecorationMode::platform_default()) {
                eprintln!("could not apply the decoration mode: {error}");
            }
            window.show()?;
        }
        Ok(())
    })
```

Grant the window these permissions in a capability (`src-tauri/capabilities/*.json`):

```json
"permissions": [
	"core:default",
	"core:window:allow-minimize",
	"core:window:allow-toggle-maximize",
	"core:window:allow-close",
	"core:window:allow-start-dragging",
	"core:window:allow-start-resize-dragging",
	"oito2-window:default"
]
```

The `initWindow()` options that change the window need their own permissions: `title` → `core:window:allow-set-title`, `size` → `core:window:allow-set-size`, `minimumSize` → `core:window:allow-set-min-size`, `center` → `core:window:allow-center`, and `show` (on by default) → `core:window:allow-show` and `core:window:allow-set-focus`.

On macOS the default mode keeps the native frame; to draw the app's header under the traffic lights, overlay the title bar in `tauri.macos.conf.json`, as the showcase does with `"titleBarStyle": "Overlay"`, `"hiddenTitle": true` and a `trafficLightPosition` on the window.

## Usage

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { HeaderBar, ThemeProvider, WindowScope } from '@oito2/ui';
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

<ThemeProvider>
	<WindowScope {controller}>
		<HeaderBar title="My app" />
		{@render children()}
		<WindowResizeHandles {controller} />
	</WindowScope>
</ThemeProvider>
```

Without a Rust `setup`, let the webview apply the frame and show the window instead: `initWindow({ decorations: 'gtk-headerless' })`.

## What's inside

| Export                                | Purpose                                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initWindow(options)`                 | Prepares the current window (frame, title, size, minimum size, center, show) and returns a `NativeWindowController`, or `null` outside Tauri                             |
| `NativeWindowController`              | The `WindowController` for `WindowScope`: `state`, `decorations`, `minimize()`, `toggleMaximize()`, `close()`, `startDrag()`, `startResize()`, `showMenu()`, `dispose()` |
| `WindowResizeHandles`                 | Invisible edge and corner handles that resize an `undecorated` Linux window                                                                                              |
| `setDecorationMode`, `decorationMode` | Set or read the frame of the current window                                                                                                                              |
| `showWindowMenu(x, y)`                | Opens the native window menu (Linux and Windows)                                                                                                                         |
| `DecorationMode` (type)               | `native`, `undecorated` or `gtk-headerless`                                                                                                                              |

### Decoration modes

| Mode             | Frame                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `native`         | The system title bar and frame. Default on macOS                                                                                                    |
| `undecorated`    | No system frame; the app draws the title bar, and `WindowResizeHandles` resizes it on Linux. Default on Windows                                     |
| `gtk-headerless` | GTK client-side decorations with an empty title bar: GTK keeps the shadow and resize edges. Default on Linux; falls back to `undecorated` elsewhere |

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
