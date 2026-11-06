# @oito2/ui

Svelte 5 design system for oito2 desktop apps on Tauri v2: tokens, themes, window chrome and components with desktop-grade density and GTK-style surfaces.

[![npm](https://img.shields.io/npm/v/@oito2/ui?label=npm)](https://www.npmjs.com/package/@oito2/ui)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

The components are written in Svelte 5 runes mode, follow the WAI-ARIA Authoring Practices for roles, keyboard and focus, and ship English and Brazilian Portuguese strings. The package has no Tauri dependency: it runs in any browser as well as in a Tauri webview.

## Installation

```bash
pnpm add @oito2/ui svelte
```

`svelte` (`^5.57.0`) is a peer dependency. Optional companion packages:

| Package                                                                  | Adds                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| [`@oito2/ui-themes`](https://www.npmjs.com/package/@oito2/ui-themes)     | 13 named color presets (Everforest, Nord, Catppuccin...) |
| [`@oito2/ui-syntax`](https://www.npmjs.com/package/@oito2/ui-syntax)     | Syntax highlighting and a `CodeBlock` component          |
| [`@oito2/ui-extras`](https://www.npmjs.com/package/@oito2/ui-extras)     | QR code, signature pad, image cropper, navigation menu   |
| [`@oito2/ui-files`](https://www.npmjs.com/package/@oito2/ui-files)       | File upload and download trigger                         |
| [`@oito2/ui-window`](https://www.npmjs.com/package/@oito2/ui-window)     | Native window controller for the title bars (Tauri)      |
| [`@oito2/ui-settings`](https://www.npmjs.com/package/@oito2/ui-settings) | Real system settings: desktop, button layout, accent     |

> **License note:** `@oito2/ui` is GPL-3.0. An app that uses it must be distributed under a GPL-compatible license.

## Setup

Import the stylesheet once (fonts, tokens, density and base styles) and wrap the app in a `ThemeProvider`, which applies the color theme and hosts the overlays (dialogs, menus, popovers):

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { LocaleProvider, ThemeProvider, Toaster } from '@oito2/ui';

	let { children } = $props();
</script>

<LocaleProvider locale="en">
	<ThemeProvider mode="system" accent="blue">
		{@render children()}
		<Toaster placement="bottom-end" />
	</ThemeProvider>
</LocaleProvider>
```

`ThemeProvider` follows `prefers-color-scheme` by default (`mode="light" | "dark" | "system"`); `highContrast` and the `light`/`dark` theme sources are optional. `LocaleProvider` selects the built-in strings (`en` or `pt-BR`).

### Stylesheets

| Import                  | Contents                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `@oito2/ui/styles.css`  | Everything below except `schemes.css`; the usual single import                          |
| `@oito2/ui/fonts.css`   | Inter variable font (OFL-1.1), bundled with the package                                 |
| `@oito2/ui/tokens.css`  | `--oito2-*` design tokens (spacing, radius, sizes, typography)                          |
| `@oito2/ui/density.css` | Pointer and touch control sizes (`data-oito2-density`)                                  |
| `@oito2/ui/base.css`    | Border-box sizing and body typography                                                   |
| `@oito2/ui/schemes.css` | Precomputed base color schemes under `[data-oito2-scheme='light-blue']`-style selectors |

All component styles live in the `oito2` cascade layer, so unlayered app CSS always wins.

## Usage

```svelte
<script lang="ts">
	import { Button, Dialog, Switch, toast } from '@oito2/ui';

	let darkMode = $state(false);
</script>

<label for="dark-mode">Dark mode</label>
<Switch id="dark-mode" bind:checked={darkMode} />

<Button variant="tonal" onclick={() => toast('Saved')}>Save</Button>

<Dialog.Root>
	<Dialog.Trigger variant="tonal">About this app</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.TitleBar>About this app</Dialog.TitleBar>
		<Dialog.Description>Free software under the GPL-3.0.</Dialog.Description>
		<Dialog.Actions>
			<Dialog.Close variant="filled">OK</Dialog.Close>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>
```

Atomic components are exported by name (`Button`, `Switch`); compound components are namespaces of parts (`Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`):

```svelte
<script lang="ts">
	import { Tabs } from '@oito2/ui';
</script>

<Tabs.Root defaultValue="overview" variant="pill">
	<Tabs.List aria-label="Project">
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="details">Details</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="overview">Overview panel</Tabs.Content>
	<Tabs.Content value="details">Details panel</Tabs.Content>
</Tabs.Root>
```

Controllable components take a bindable value (`bind:value`, `bind:open`, `bind:checked`), an `on<Name>Change` callback and a `default<Name>` for uncontrolled use.

## What's inside

| Area                   | Exports (selection)                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme and foundation   | `ThemeProvider`, `useTheme`, `createColorTheme`, `SystemScope`, `fallbackSystemSettings`, `Platform`, `LocaleProvider`, `Format`, token values             |
| Buttons and toggles    | `Button`, `IconButton`, `Fab`, `SplitButton`, `Checkbox`, `Switch`, `RadioGroup`, `ToggleButton`, `ToggleGroup`, `SegmentGroup`, `ChoiceChipBar`           |
| Text and entries       | `TextField`, `TextArea`, `Field`, `SearchField`, `PasswordField`, `TagsField`, `PinEntry`, `NumberEntry`, `DateEntry`, `TimeEntry`, `EditableLabel`        |
| Pickers and selection  | `Select`, `Combobox`, `ListBox`, `Slider`, `AngleSlider`, `Rating`, `Calendar`, `DatePicker`, `ColorPicker`, `ShortcutRecorder`                            |
| Overlays               | `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `HoverCard`, `Tooltip`, `Menu`, `ContextMenu`, `Toaster` / `toast`, `FloatingPanel`, `Tour`, `CommandPalette` |
| Layout and navigation  | `MasterDetail`, `PanedView`, `Splitter`, `Section`, `Card`, `Tabs`, `NavigationRail`, `NavigationBar`, `NavigationPage`, `Steps`, `Pagination`, `Carousel` |
| Data display           | `ListTile`, `TreeView`, `JsonTreeView`, `Avatar`, `Badge`, `Chip`, `Banner`, `InfoBox`, `LinearProgress`, `CircularProgress`, `TimerText`, `Marquee`       |
| Window chrome          | `WindowScope`, `HeaderBar`, `TitleBar`, `WindowTitleBar`, `DialogTitleBar`, `WindowControls`                                                               |
| Collections and state  | `ListCollection`, `TreeCollection`, `SelectionController`, `AsyncListController`, `Commands`, `Shortcut`                                                   |
| Attachments and motion | `focusBorder`, `edgeFocus`, `draggable`, `undershoot`, `pageTransition`                                                                                    |
| Icons                  | `AnimatedIcon`, `PlaceholderIcon`                                                                                                                          |

Subpath exports:

- **`@oito2/ui/icons`** — every [Lucide](https://lucide.dev) icon re-exported from `@lucide/svelte`, plus `freedesktopIcon` / `freedesktopIcons`, which map freedesktop.org icon names (such as `document-open`) to them. Bundlers keep only the icons an app uses.
- **`@oito2/ui/theme`** — the color scheme functions (`createColorTheme`, `colorThemeFromRoles`, contrast helpers, syntax palettes) without Svelte, for theme packages and build scripts.

Title bars get their window through `WindowScope`; inside Tauri, feed it with `initWindow()` from `@oito2/ui-window`. Outside Tauri the title bars show no working window controls.

### Server-side rendering

`@material/material-color-utilities` imports its own modules without file extensions. An app that renders `@oito2/ui` on a Node server must add it to `ssr.noExternal` in its Vite config. Client-only apps (such as Tauri SPAs) need nothing.

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
