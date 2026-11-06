# @oito2/ui-files

`@oito2/ui` file components: a file upload with a drop zone, previews and validation, and a download trigger, for Tauri and the browser.

[![npm](https://img.shields.io/npm/v/@oito2/ui-files?label=npm)](https://www.npmjs.com/package/@oito2/ui-files)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

## Installation

```bash
pnpm add @oito2/ui-files @oito2/ui svelte
```

`svelte` (`^5.57.0`) is a peer dependency. Set up `@oito2/ui` first (its `styles.css` and a `ThemeProvider`). `@tauri-apps/api`, `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` come as dependencies; they are loaded only inside Tauri.

The components pick their platform adapter with `defaultFilesAdapter()`: inside Tauri the `tauriFilesAdapter` (native file chooser, "Save as" dialog and files dropped on the window), in a browser the `webFilesAdapter` (file input, download link and HTML drag and drop).

### Tauri setup

Register the official dialog and fs plugins in `src-tauri/Cargo.toml` and in the Builder:

```toml
[dependencies]
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
```

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
```

Grant these permissions to the window in a capability (`src-tauri/capabilities/*.json`):

```json
"permissions": [
	"core:default",
	"dialog:allow-open",
	"dialog:allow-save",
	"fs:allow-stat",
	"fs:allow-read-file",
	"fs:allow-write-file"
]
```

Both plugins add the chosen and dropped paths to the fs scope, so no wider scope is needed. Saving suggests the downloads directory.

## Usage

```svelte
<script lang="ts">
	import { FileUpload, FileUploadController } from '@oito2/ui-files';
	import { onDestroy } from 'svelte';

	const images = new FileUploadController({
		accept: [
			{ label: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'], mimeTypes: ['image/*'] }
		],
		maxFiles: 5,
		maxFileSize: 5_000_000
	});

	onDestroy(() => images.dispose());
</script>

<FileUpload controller={images} />

<p>{images.files.length} file(s), {images.rejected.length} refused.</p>
```

The controller is reactive: read `files` and `rejected` (each with a `reason`: `type`, `size`, `count` or `directory`), and call `add`, `remove`, `clear` or `clearRejected`. Each `PickedFile` exposes `name`, `path` (Tauri), `mimeType`, `size()` and `bytes()`.

```svelte
<script lang="ts">
	import { DownloadTrigger } from '@oito2/ui-files';

	let note = $state('Hello');
	const encoder = new TextEncoder();
</script>

<DownloadTrigger
	fileName="note.txt"
	mimeType="text/plain"
	data={() => encoder.encode(note)}
	onSaved={(saved) => console.log(saved ? 'Saved' : 'Cancelled')}
/>
```

## What's inside

| Export                                                                                                                                       | Purpose                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `FileUpload`                                                                                                                                 | Drop zone plus the list of accepted files, image previews and remove buttons       |
| `FileUploadController`                                                                                                                       | Holds the files; checks `accept`, `maxFiles` and `maxFileSize` as they are added   |
| `FileDropZone`                                                                                                                               | Just the drop zone / chooser button, with an `onFiles` callback                    |
| `DownloadTrigger`                                                                                                                            | Button that builds a file and saves it ("Save as" in Tauri, download in a browser) |
| `Downloads`                                                                                                                                  | `Downloads.save({ fileName, bytes, mimeType })` without a button                   |
| `defaultFilesAdapter`, `tauriFilesAdapter`, `webFilesAdapter`                                                                                | Platform adapters; every component takes an optional `adapter` prop                |
| `acceptAttribute`, `fileMatchesTypes`, `mimeTypeOf`, `extensionOf`, `baseName`, `isPreviewableImage`, `webFile`, `pathFile`, `dialogFilters` | File type and path helpers                                                         |

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
