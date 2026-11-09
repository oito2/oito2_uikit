# @oito2/ui-settings

System integration for `@oito2/ui` on Tauri v2: desktop environment detection, window button layout, accent color and high contrast.

[![npm](https://img.shields.io/npm/v/@oito2/ui-settings?label=npm)](https://www.npmjs.com/package/@oito2/ui-settings)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

`@oito2/ui` components read the system preferences (`SystemSettings`) from the closest `SystemScope`: the Linux desktop environment, the window control style and button layout, the accent color and the high-contrast preference. `SystemSettingsScope` fills that scope with the real values, read through the Rust plugin `tauri-plugin-oito2-settings`. Outside Tauri it keeps the platform defaults (`fallbackSystemSettings`).

## Installation

```bash
pnpm add @oito2/ui-settings @oito2/ui svelte
```

`svelte` (`^5.57.0`), `@oito2/ui` and `@tauri-apps/api` (`^2.12.0`) are peer dependencies; install them alongside.

### Tauri setup

Add the Rust plugin [`tauri-plugin-oito2-settings`](https://github.com/oito2/oito2_uikit/tree/main/plugins/tauri-plugin-oito2-settings), which is not on crates.io, from the repository in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Register it in the Builder:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_oito2_settings::init())
```

Grant the window the plugin's default permission set (it allows the `read_settings` command) in a capability (`src-tauri/capabilities/*.json`):

```json
"permissions": ["core:default", "oito2-settings:default"]
```

`core:default` covers listening to the `oito2-settings://changed` event.

## Usage

Wrap the app content in `SystemSettingsScope`, outside the `ThemeProvider`, so the theme also follows the system accent and contrast:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';
	import { SystemSettingsScope } from '@oito2/ui-settings';

	let { children } = $props();
</script>

<SystemSettingsScope>
	<ThemeProvider>
		{@render children()}
	</ThemeProvider>
</SystemSettingsScope>
```

The scope reads the settings once mounted, follows the changes the plugin reports (Linux) and reads them again whenever the window regains focus. Its props are all optional: `initialSettings`, `source`, `platform` and an `onSettingsChange` callback. When a read or the subscription fails (for example without the plugin or its permission), the scope keeps the current settings and logs one `console.warn` with the cause per instance.

Components read the result with `useSystemSettings()` from `@oito2/ui`:

```svelte
<script lang="ts">
	import { useSystemSettings } from '@oito2/ui';

	const system = useSystemSettings();
</script>

<p>
	Desktop: {system.current.desktopEnvironment ?? 'n/a'}, accent: {system.current.accentColor ??
		'none'}
</p>
```

To read the settings once without a component, call `loadSystemSettings()`; it resolves to the platform defaults in a browser or when the read fails.

## What's inside

| Export                                                            | Purpose                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `SystemSettingsScope`                                             | A `SystemScope` fed by the plugin, kept up to date                                                                  |
| `loadSystemSettings(options)`                                     | Reads the `SystemSettings` once                                                                                     |
| `composeSystemSettings(raw, platform)`                            | Turns the plugin's `RawSettings` into `SystemSettings` (pure, testable without Tauri)                               |
| `sameSystemSettings(a, b)`                                        | Field-by-field comparison                                                                                           |
| `tauriSettingsSource`, `SettingsSource` (type)                    | The source that calls the plugin; pass another `source` to the scope for tests                                      |
| `settingsChangedEvent`                                            | `'oito2-settings://changed'`, the event the plugin emits                                                            |
| `RawSettings`, `ConfigValues`, `SettingValue`, `emptyRawSettings` | The raw values the plugin reports                                                                                   |
| `isRawSettings(value)`                                            | Whether a value has the shape of `RawSettings`; `tauriSettingsSource` rejects reads and ignores events that fail it |
| `CommandError` (type), `isCommandError`                           | The `{ kind, message }` value the plugin's commands reject with (`unsupported` or `internal`), and its type guard   |

### Platform coverage

| Platform | Read                                                                                                                                                            | Live updates              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Linux    | Desktop session (`XDG_CURRENT_DESKTOP`, `DESKTOP_SESSION`), GSettings (GNOME, Cinnamon, MATE), the XDG desktop portal, KDE, Xfce and COSMIC configuration files | Yes, plus on window focus |
| Windows  | Accent color and high contrast                                                                                                                                  | On window focus           |
| macOS    | Accent color and "Increase contrast"                                                                                                                            | On window focus           |

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
