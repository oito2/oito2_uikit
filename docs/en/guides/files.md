🌐 [Português](../../pt-br/guides/files.md) | **English** | 🏠 [Index](../index.md)

---

# Files

How to let users pick, drop and save files with `@oito2/ui-files`, in a Tauri app and in a browser, with the same components.

![The file upload page of the showcase](../../img/files-upload.png)

<!-- TODO: capture a screenshot of the showcase File upload page with images added -->

## Table of Contents

- [Install](#install)
- [Tauri setup](#tauri-setup)
- [Uploading files](#uploading-files)
- [A bare drop zone](#a-bare-drop-zone)
- [Saving files](#saving-files)
- [Adapters](#adapters)
- [Drag and drop and the fs scope](#drag-and-drop-and-the-fs-scope)
- [Helpers](#helpers)

## Install

```bash
pnpm add @oito2/ui-files @oito2/ui svelte @tauri-apps/api @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```

Set up `@oito2/ui` first (`styles.css` and a `ThemeProvider`). `@oito2/ui`, `@tauri-apps/api` (`^2.12.0`), `@tauri-apps/plugin-dialog` (`^2.8.0`) and `@tauri-apps/plugin-fs` (`^2.7.0`) are peer dependencies: the app picks their versions (the Tauri packages on the same major.minor as its crates), and a single copy of `@oito2/ui` is shared. Install them for a web-only build too, because the bundler resolves the dynamic imports at build time; they are only loaded inside Tauri.

## Tauri setup

Inside Tauri the components use the official **dialog** and **fs** plugins. Add the crates on the same major.minor as the npm packages (the repository uses `tauri-plugin-dialog` 2.8 and `tauri-plugin-fs` 2.7):

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
```

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
```

Grant the window these permissions — the exact set the showcase uses for its file pages:

| Permission            | Used by                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `dialog:allow-open`   | The native file chooser (`FileUpload`, `FileDropZone`)                 |
| `dialog:allow-save`   | The "Save as" dialog (`DownloadTrigger`, `Downloads.save`)             |
| `fs:allow-stat`       | File sizes and telling dropped folders from files                      |
| `fs:allow-read-file`  | Reading picked or dropped files (`PickedFile.bytes()`, image previews) |
| `fs:allow-write-file` | Writing the saved file                                                 |

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"dialog:allow-open",
		"dialog:allow-save",
		"fs:allow-stat",
		"fs:allow-read-file",
		"fs:allow-write-file"
	]
}
```

No `fs:scope` entry is needed: the paths the user chooses in a dialog, and the paths dropped on the window, are added to the fs scope at run time (see [below](#drag-and-drop-and-the-fs-scope)). Saving suggests the downloads directory, through `downloadDir()` of `@tauri-apps/api/path`.

## Uploading files

`FileUpload` is a drop zone, the list of refused files with the reason, and the list of accepted files with their size, an image preview and a remove button. A `FileUploadController` holds the files and checks them as they are added:

```svelte
<script lang="ts">
	import { Button } from '@oito2/ui';
	import { FileUpload, FileUploadController } from '@oito2/ui-files';
	import { onDestroy } from 'svelte';

	const images = new FileUploadController({
		accept: [
			{
				label: 'Images',
				extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
				mimeTypes: ['image/*']
			}
		],
		maxFiles: 5,
		maxFileSize: 5_000_000
	});

	onDestroy(() => images.dispose());

	async function send() {
		for (const file of images.files) {
			const bytes = await file.bytes();
			console.log(file.name, file.mimeType, bytes.length);
		}
	}
</script>

<FileUpload controller={images} />
<p>{images.files.length} of 5 images{images.canAddMore ? '' : ', the limit is reached'}.</p>
<Button variant="tonal" disabled={images.files.length === 0} onclick={send}>Send</Button>
```

| Controller option | Effect                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| `accept`          | `FileTypeGroup[]` (`label`, `extensions`, `mimeTypes`); empty accepts everything |

In Tauri a file has no MIME type of its own: `fileMatchesTypes` and the previews derive it from the extension through a built-in table of common types, and the native file chooser only filters by extension. A group accepted only by `mimeTypes` therefore matches fewer files in Tauri than in a browser (which reports the system's MIME type). List the extensions you expect in `extensions` as well, as the example does; `dialogFilters` maps `image/*`-style patterns to the extensions of the table.
| `maxFiles` | Largest number of files; `FileUpload` disables its zone once it is reached |
| `maxFileSize` | Largest size in bytes |
| `files` | Initial files |

The controller is reactive: read `files`, `rejected` (each with a `reason`: `type`, `size`, `count`, `directory` or `unreadable`, the last one for a file whose size could not be read, such as a path that no longer exists) and `canAddMore`; call `add`, `remove`, `clear` and `clearRejected`. Every `PickedFile` has `name`, `path` (Tauri only, else `null`), `mimeType`, `isDirectory`, `file` (the browser `File`, web only), `size()` and `bytes()`.

`FileUpload` props: `controller`, `hint` (string or snippet, replaces the default line of accepted types and size limit), `showPreviews` (default `true`), `enabled`, `adapter`, `zoneMinHeight` (default 160). The messages come from the active locale (see [Localization](./localization.md)).

## A bare drop zone

`FileDropZone` is just the dashed box: a button that opens the file chooser and receives dropped files. It passes everything to `onFiles` unchecked, folders included:

```svelte
<script lang="ts">
	import { FileDropZone, type PickedFile } from '@oito2/ui-files';

	let dropped: PickedFile[] = $state([]);
</script>

<FileDropZone onFiles={(files) => (dropped = files)} minHeight={120} hint="Anything goes" />

<ul>
	{#each dropped as file, index (index)}
		<li>{file.name}{file.isDirectory ? ' (folder)' : ''}{file.path ? ` — ${file.path}` : ''}</li>
	{/each}
</ul>
```

Props: `onFiles`, `accept` (filters the chooser), `multiple` (default `true`; drops always pass every dropped file), `enabled`, `hint`, `adapter`, `minHeight` (default 160) and a bindable `ref`.

## Saving files

`DownloadTrigger` is a button that builds the file when clicked, shows a spinner while `data` resolves, and saves it — the "Save as" dialog in Tauri, a download in a browser:

```svelte
<script lang="ts">
	import { DownloadTrigger } from '@oito2/ui-files';

	const encoder = new TextEncoder();
	let note = $state('Remember to water the plants.\n');
	let result = $state('');
</script>

<DownloadTrigger
	fileName="note.txt"
	mimeType="text/plain"
	data={() => encoder.encode(note)}
	onSaved={(saved) => (result = saved ? 'Saved.' : 'Canceled.')}
	onError={(error) => (result = `Failed: ${String(error)}`)}
/>
```

`data` returns a `Uint8Array` or a promise of one. Children replace the localized "Download" label. Where saving is not supported the button is disabled with an explanatory tooltip.

`Downloads` saves without a button:

```ts
import { Downloads } from '@oito2/ui-files';

if (Downloads.isSupported()) {
	const saved = await Downloads.save({
		fileName: 'settings.json',
		mimeType: 'application/json',
		bytes: new TextEncoder().encode(JSON.stringify({ theme: 'dark' }, null, 2))
	});
}
```

`Downloads.save` resolves to `false` when the user cancels, and throws when the adapter cannot save files.

## Adapters

Every component takes an optional `adapter` prop. Without it, `defaultFilesAdapter()` picks one once, with `isTauri()`:

| Behavior       | `tauriFilesAdapter()`                                                 | `webFilesAdapter()`                                           |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Choosing files | `open()` of the dialog plugin, filtered with `dialogFilters(accept)`  | A hidden `<input type="file">` with `acceptAttribute(accept)` |
| Saving         | `save()` of the dialog plugin, then `writeFile()` of the fs plugin    | A blob URL and a temporary `<a download>` link                |
| Dropping       | The webview's `onDragDropEvent`, matched against the zone's rectangle | HTML drag and drop events on the zone                         |
| File contents  | `stat()` and `readFile()` of the fs plugin, on demand (`pathFile`)    | The `File` object (`webFile`)                                 |

A custom adapter implements the `FilesAdapter` interface (`canDropFiles`, `canSaveFiles`, `openFiles`, `saveFile`, `dropTarget`), for tests or another platform.

## Drag and drop and the fs scope

In Tauri, files dropped on the window arrive as **paths**, not file objects. The Tauri adapter listens to the webview's drag-and-drop events, highlights the zone while the pointer is over it, and on a drop keeps only the paths dropped inside the zone's rectangle. It then calls `stat()` on each path to mark folders, and skips paths it cannot stat.

Reading those paths works without a configured scope because the fs plugin adds every dropped path to its runtime scope (files, and folders recursively). That is the fs plugin's `scopeDroppedPaths` option, which defaults to `true`; it applies to every webview that has an fs permission. If you set `plugins.fs.scopeDroppedPaths` to `false` in `tauri.conf.json`, dropped files can no longer be read and you must grant an `fs:scope` yourself. Paths chosen in the dialog plugin's file chooser and "Save as" dialog are likewise added to the scope by the dialog plugin.

The scope grows before the components see the drop: a folder dropped on the window enters the read and write scope of the webview with its whole tree, for the rest of the session, even though `FileUploadController` refuses folders and even when the drop lands outside the zone. Nothing in the components can narrow that. An app that never accepts folders, or that renders untrusted content, should set `plugins.fs.scopeDroppedPaths` to `false` and grant the directories it needs through an explicit `fs:scope`.

## Helpers

| Export                                                    | Purpose                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `fileMatchesTypes(file, accept)`                          | Whether a `PickedFile` matches the accepted types (`image/*` patterns too) |
| `acceptAttribute(groups)`                                 | The HTML `accept` attribute for the groups                                 |
| `dialogFilters(groups)`                                   | The dialog plugin's filters for the groups                                 |
| `extensionsForMimeType(pattern)`                          | The known extensions of a MIME type or `type/*` pattern                    |
| `mimeTypeOf(name)`, `extensionOf(name)`, `baseName(path)` | Name and path helpers                                                      |
| `isPreviewableImage(file)`                                | Whether `FileUpload` shows a preview (images except SVG)                   |
| `webFile(file)`, `pathFile(path)`                         | Wrap a browser `File` or a Tauri path as a `PickedFile`                    |

## See also

- [`@oito2/ui-files` README](../../../packages/ui-files/README.md)
- Showcase pages: [File upload](https://oito2.github.io/oito2_uikit/file-upload) and [Download trigger](https://oito2.github.io/oito2_uikit/download-trigger).
- [Desktop integration](./desktop-integration.md#capabilities) — the other permissions of the showcase.
