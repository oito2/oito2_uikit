🌐 [Português](../../pt-br/architecture/window-chrome.md) | **English** | 🏠 [Index](../index.md)

---

# Window chrome

How oito2 apps draw their own title bar and window buttons, and how those reach the real window. Three layers take part:

| Layer                          | Package                            | Role                                                                                   |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------- |
| Title bars and window controls | `@oito2/ui` (`window/`)            | Draw the bar and the buttons; translate clicks and drags into `WindowController` calls |
| Window controller              | `@oito2/ui-window`                 | Implements `WindowController` for a Tauri window; follows the window state             |
| Frame and window menu          | `tauri-plugin-oito2-window` (Rust) | Applies the decoration mode; shows the native window menu                              |

For setting it up in an app, see the [Desktop integration guide](../guides/desktop-integration.md) and the [`@oito2/ui-window` README](../../../packages/ui-window/README.md).

## Title bars in `@oito2/ui`

| Component        | What it is                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TitleBar`       | The base bar: 46 px high in `--oito2-chrome-title-bar`, `leading` content, a `title` (centered by default), `trailing` content, and the window controls of `buttonLayout` in `controlStyle`. `barStyle` is `normal`, `undecorated` (no controls) or `hidden`. |
| `WindowTitleBar` | A `TitleBar` set up from the closest `SystemScope` (see below). Most apps use this or `HeaderBar`.                                                                                                                                                            |
| `HeaderBar`      | A GNOME-style header bar on top of `WindowTitleBar`: `start` and `end` controls, a `title`, an optional search (`searchable`) and an optional view switcher (`tabs`).                                                                                         |
| `DialogTitleBar` | The bar of a dialog window or panel: a title and only a close button, on the side the desktop puts it; transparent and not draggable. Inside a `Dialog` the button closes it.                                                                                 |
| `WindowControls` | A row of `WindowControl` buttons in the given order, wired to a controller; no spacing for Windows buttons and traffic lights, 8 px otherwise.                                                                                                                |
| `WindowControl`  | One minimize, maximize/restore or close button in a style: `gnome`, `breeze`, `xfwm`, `cosmic`, `windows`, `macos` or `none` (renders nothing). Out of the Tab order, like native buttons.                                                                    |

### How `WindowTitleBar` adapts to the platform

| Platform (from `SystemScope`)      | Result                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Touch platform                     | A 56 px app bar, no window controls, not draggable                                                                                    |
| Web (not a native desktop webview) | No window controls, not draggable                                                                                                     |
| macOS (native)                     | No drawn controls; a 72 px leading inset for the native traffic lights (none in full screen)                                          |
| Linux and Windows (native)         | The `windowControlStyle` and `windowButtonLayout` of the system settings; the title starts at the left on Windows, centered elsewhere |

`buttonSides` (`both`, `leading`, `trailing`) keeps the buttons of one side only, for split layouts where each pane has its own bar.

### Gestures

`titleBarGestures(controller)` is the attachment behind the bar's empty areas — the bar itself and descendants marked with `data-oito2-drag-region` (`dragRegionAttribute`):

| Gesture on an empty area | Action                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| Primary press and move   | `controller.startDrag()` (not in full screen)                     |
| Double click             | `controller.toggleMaximize()`                                     |
| Secondary click          | `controller.showMenu({ x, y })` where `state.canShowMenu` is true |

Controls placed on the bar keep their own clicks.

## The window controller contract

`window/window-controller.ts` defines what a title bar needs from a window:

```ts
interface WindowController {
	readonly state: WindowState; // isMaximized, isFullScreen, isActive, canShowMenu
	minimize(): Promise<void>;
	toggleMaximize(): Promise<void>;
	close(): Promise<void>;
	startDrag(): Promise<void>;
	showMenu(position?: { x: number; y: number }): Promise<void>;
}
```

`state` must be reactive so the bar re-renders (maximize turns into restore, and an inactive window marks the bar with `data-inactive`). `WindowScope` provides a controller through context (`setWindowController` / `useWindowController`); when it is `null` — on the web or before the window is ready — the bars show no working controls. Tests and previews can provide their own controller; the showcase uses a simulated one to imitate each desktop in the browser.

## `@oito2/ui-window`

| Export                                                  | Role                                                                                                                                                                                                                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initWindow(options)`                                   | Returns `null` outside Tauri. Inside Tauri it loads `@tauri-apps/api/window`, optionally applies `decorations`, `title`, `size`, `minimumSize` and `center`, shows and focuses the window (`show`, default true), and returns a `NativeWindowController` |
| `NativeWindowController`                                | The `WindowController` of a Tauri window: `minimize`, `toggleMaximize`, `close`, `startDrag`, `startResize(direction)`, `showMenu`, `dispose`. Its `state` follows the window's resize, focus and full-screen changes.                                   |
| `WindowResizeHandles`                                   | Invisible edge and corner handles that call `startResize`; shown only for an `undecorated` Linux window that is not maximized or full screen                                                                                                             |
| `setDecorationMode`, `decorationMode`, `showWindowMenu` | Typed wrappers of the plugin commands (`plugin:oito2-window\|…`)                                                                                                                                                                                         |

`canShowMenu` is true on Linux and Windows. By default the controller mirrors the state on the root element as `data-oito2-window-maximized`-style attributes and `data-oito2-decorations`, so app CSS can react to it.

The window actions use Tauri core permissions (`core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`, `allow-start-resize-dragging`); the `initWindow` options need their own (`allow-set-title`, `allow-set-size`, `allow-set-min-size`, `allow-center`, `allow-show`, `allow-set-focus`).

## `tauri-plugin-oito2-window`

### Decoration modes

`DecorationMode` (serialized in kebab-case, re-exported from the [`oito2_foundation`](https://docs.rs/oito2_foundation) crate of oito2_rs) is applied with `apply_decoration_mode(&window, mode)` from Rust or the `set_decoration_mode` command, ideally while the window is still hidden (`"visible": false`):

| Mode             | Implementation                                                                                                                                                                       | Default on |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `native`         | `set_decorations(true)`                                                                                                                                                              | macOS      |
| `undecorated`    | `set_decorations(false)`; the app draws the bar, and `WindowResizeHandles` resizes the window on Linux                                                                               | Windows    |
| `gtk-headerless` | On Linux, an empty, hidden `gtk::Box` set as the GTK title bar: GTK switches to client-side decorations and keeps the shadow and resize edges. Elsewhere, the same as `undecorated`. | Linux      |

`DecorationMode::platform_default()` returns the default of the running system. The plugin records the mode applied to each window label (`DecorationState`), and `decoration_mode` returns it, or `native`/`undecorated` from whether the window has a system frame.

The showcase applies the mode in its Rust `setup` and reads an override from the `OITO2_DECORATIONS` environment variable (a debug aid of the showcase, not of the plugin).

### The native window menu (`src/menu.rs`)

`show_window_menu(x, y)` (CSS pixels from the top left of the webview, each validated as a finite number from 0 to 100 000 by `oito2_foundation::window_menu::validate_position`) opens the system's window menu — Restore, Move, Size, Minimize, Maximize, Close and whatever the desktop adds — on the main thread:

| Platform | Implementation                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Linux    | Builds a synthetic GDK button-press event at the position (translated from the webview to the whole window, which includes the client-side shadow) and calls `gdk_window_show_window_menu` |
| Windows  | `GetSystemMenu` + `TrackPopupMenu`, enabling items for the current state (Restore only when maximized, Move/Size/Maximize only when not), then posts the chosen `WM_SYSCOMMAND`            |
| macOS    | Not supported: returns an `Unsupported` error                                                                                                                                              |

Both implementations need raw platform APIs. This module is the **only** place in the repository allowed to use `unsafe`: the workspace sets `unsafe_code = "forbid"`, this crate lowers it to `deny`, and `lib.rs` marks `mod menu` with `#[allow(unsafe_code)]`. Each `unsafe` block is limited to the foreign calls and carries a `SAFETY` comment.

### Permissions

| Identifier                                        | Allows                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `oito2-window:default`                            | `allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu` |
| `oito2-window:allow-<command>` / `deny-<command>` | One command each (generated in `permissions/autogenerated/`)                   |

## macOS: overlaid title bar with traffic lights

macOS keeps the `native` mode, so the system still draws the traffic lights. To put the app's own header under them, the window is configured with an overlaid title bar in `tauri.macos.conf.json`, as the showcase does:

```json
{
	"label": "main",
	"visible": false,
	"titleBarStyle": "Overlay",
	"hiddenTitle": true,
	"trafficLightPosition": { "x": 16, "y": 17 }
}
```

`WindowTitleBar` then leaves a 72 px inset at the start of the bar for the traffic lights and draws no buttons of its own. The `macos` control style draws traffic lights where there are no native ones, when a `TitleBar` or `WindowControls` is given `controlStyle="macos"` directly (as the showcase's title bar and floating panel pages do).

## Per-OS summary

| OS      | Default frame      | Who draws the buttons       | Resizing                                             | Window menu                     |
| ------- | ------------------ | --------------------------- | ---------------------------------------------------- | ------------------------------- |
| Linux   | `gtk-headerless`   | `@oito2/ui` (desktop style) | GTK CSD edges (`undecorated`: `WindowResizeHandles`) | GDK, on secondary click         |
| Windows | `undecorated`      | `@oito2/ui` (`windows`)     | The system                                           | System menu, on secondary click |
| macOS   | `native` + Overlay | The system (traffic lights) | The system                                           | None                            |

![Title bars of every window control style](../../img/title-bars.png)

<!-- TODO: capture the title bars of the six window control styles side by side -->
