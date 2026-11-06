🌐 [Português](../../../pt-br/guides/workflows/examples.md) | **English** | 🏠 [Index](../../index.md)

---

# Workflow examples

Complete, minimal screens assembled from the components, each one a single Svelte 5 component. They assume the app root already imports `@oito2/ui/styles.css` and wraps everything in a `ThemeProvider` with a `Toaster` (see [Quickstart](../../getting-started/quickstart.md)). The patterns come from the showcase pages in [`apps/showcase/src/lib/pages/`](../../../../apps/showcase/src/lib/pages), where each component has more variants.

## Table of Contents

- [A settings dialog](#a-settings-dialog)
- [A master-detail file browser](#a-master-detail-file-browser)
- [Commands, shortcuts and a command palette](#commands-shortcuts-and-a-command-palette)
- [A code viewer](#a-code-viewer)
- [Notifications for a long task](#notifications-for-a-long-task)

## A settings dialog

A dialog with switches, a select and a slider, bound to a reactive settings object. `Select.Root` without parts renders its own trigger and list from a `ListCollection`.

```svelte
<script lang="ts">
	import { Dialog, ListCollection, Select, Slider, SwitchListTile } from '@oito2/ui';

	type Language = 'system' | 'en' | 'pt-BR';

	const settings = $state({
		compact: false,
		rtl: false,
		language: 'system' as Language,
		volume: 40
	});

	const languages = new ListCollection(
		[
			{ value: 'system', label: 'System' },
			{ value: 'en', label: 'English' },
			{ value: 'pt-BR', label: 'Português (Brasil)' }
		],
		{ getValue: (choice) => choice.value, getLabel: (choice) => choice.label }
	);
</script>

<Dialog.Root>
	<Dialog.Trigger variant="tonal">Settings</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.TitleBar>Settings</Dialog.TitleBar>
		<SwitchListTile
			title="Compact layout"
			subtitle="A navigation rail instead of the list"
			bind:checked={settings.compact}
		/>
		<SwitchListTile
			title="Right to left"
			subtitle="Lays the components out for right-to-left text"
			bind:checked={settings.rtl}
		/>
		<div class="field">
			<span>Language</span>
			<Select.Root
				collection={languages}
				label="Language"
				value={settings.language}
				onValueChange={(value) => {
					if (value) settings.language = value as Language;
				}}
			/>
		</div>
		<div class="field">
			<Slider label="Volume" bind:value={settings.volume} />
		</div>
		<Dialog.Actions>
			<Dialog.Close variant="filled">Done</Dialog.Close>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>

<style>
	.field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--oito2-space-md);
		padding: 0 var(--oito2-space-md);
	}
</style>
```

Escape and a click outside close the dialog, and focus stays inside it while it is open. To close it from code (after validating a form, for example), bind `open` on `Dialog.Root`. Showcase pages: [Dialog](https://oito2.github.io/oito2_uikit/dialog), [Switch](https://oito2.github.io/oito2_uikit/switch), [Select](https://oito2.github.io/oito2_uikit/select), [Slider](https://oito2.github.io/oito2_uikit/slider).

## A master-detail file browser

Folders in the master pane, the files of the selected folder in a `ListBox` in the detail. From the `breakpoint` width up the panes sit side by side; narrower, the list fills the area and the detail gets a back button.

```svelte
<script lang="ts">
	import { ListBox, ListCollection, MasterDetail, toast } from '@oito2/ui';
	import Folder from '@lucide/svelte/icons/folder';

	const folders: Record<string, string[]> = {
		Documents: ['report.pdf', 'budget.ods', 'notes.md'],
		Pictures: ['beach.jpg', 'mountain.png'],
		Music: []
	};

	let selected = $state<string | null>('Documents');
</script>

<div class="browser">
	<MasterDetail.Root bind:value={selected} defaultPaneSize={220} class="fill">
		<MasterDetail.Master>
			<MasterDetail.List aria-label="Folders">
				{#each Object.keys(folders) as folder (folder)}
					<MasterDetail.Tile
						value={folder}
						title={folder}
						subtitle="{folders[folder]?.length ?? 0} files"
					>
						{#snippet leading()}<Folder aria-hidden="true" />{/snippet}
					</MasterDetail.Tile>
				{/each}
			</MasterDetail.List>
		</MasterDetail.Master>
		<MasterDetail.Detail>
			{#snippet children(folder)}
				<MasterDetail.DetailHeader title={folder} level={2} />
				{#key folder}
					<ListBox.Root
						collection={new ListCollection(folders[folder] ?? [])}
						aria-label="Files in {folder}"
						onActivate={(file) => toast(`Opening ${file}`)}
					>
						{#snippet empty()}<p>This folder is empty.</p>{/snippet}
					</ListBox.Root>
				{/key}
			{/snippet}
			{#snippet empty()}<p>Pick a folder.</p>{/snippet}
		</MasterDetail.Detail>
	</MasterDetail.Root>
</div>

<style>
	.browser {
		height: 420px;
	}

	.browser :global(.fill) {
		height: 100%;
	}
</style>
```

Enter or a double click activates a file. For nested folders, use a `TreeView` with a `TreeCollection` (`TreeCollection.fromPaths([...])` builds one from paths) and a `TreeController` instead of the master list. Showcase pages: [Master-detail](https://oito2.github.io/oito2_uikit/master-detail), [List box](https://oito2.github.io/oito2_uikit/list-box), [Tree view](https://oito2.github.io/oito2_uikit/tree-view).

## Commands, shortcuts and a command palette

`Commands` is a scope of named actions: it runs a command when its shortcut is pressed while the focus is inside the scope (or anywhere with `global`), and offers its commands to `CommandPalette`. `Shortcut.parse` reads shortcuts such as `Mod+S` (Control, or Command on macOS) and sequences such as `G H`.

```svelte
<script lang="ts">
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import Save from '@lucide/svelte/icons/save';
	import Terminal from '@lucide/svelte/icons/terminal';
	import {
		Button,
		CommandPalette,
		Commands,
		Shortcut,
		ShortcutLabel,
		openCommandPalette,
		toast,
		type Command
	} from '@oito2/ui';

	const paletteShortcut = Shortcut.parse('Mod+K');
	let dirty = $state(false);

	let commands: Command[] = $derived([
		{
			id: 'new-file',
			label: 'New file',
			group: 'File',
			icon: FilePlus,
			description: 'Creates an empty document',
			onInvoke: () => (dirty = true)
		},
		{
			id: 'save',
			label: 'Save',
			group: 'File',
			icon: Save,
			shortcut: Shortcut.parse('Mod+S'),
			enabled: dirty,
			onInvoke: () => {
				dirty = false;
				toast({ title: 'Saved', type: 'success' });
			}
		},
		{
			id: 'palette',
			label: 'Show all commands',
			icon: Terminal,
			shortcut: paletteShortcut,
			onInvoke: () => openCommandPalette()
		}
	]);
</script>

<Commands {commands} global>
	<Button onclick={() => openCommandPalette()}>Commands</Button>
	<ShortcutLabel shortcut={paletteShortcut} />
	<CommandPalette />
</Commands>
```

Every typed word must match the label, description, group or keywords of a command; Up and Down move, Enter runs, Escape closes. Disabled commands (`enabled: false`) are left out of the palette. Shortcuts without Control, Alt or Meta are ignored while the user types in a text field. `ShortcutRecorder` lets the user record a new shortcut. Showcase pages: [Command palette](https://oito2.github.io/oito2_uikit/command-palette), [Shortcuts](https://oito2.github.io/oito2_uikit/shortcuts).

## A code viewer

`CodeBlock` from `@oito2/ui-syntax` shows read-only highlighted code in the syntax colors of the active theme, with line numbers and a copy button. Import the bundled JetBrains Mono font once, at the app root:

```bash
pnpm add @oito2/ui-syntax
```

```svelte
<script lang="ts">
	import '@oito2/ui-syntax/fonts.css';
	import { ListBox, ListCollection, SelectionController } from '@oito2/ui';
	import { CodeBlock } from '@oito2/ui-syntax';

	const files: Record<string, { language: string; code: string }> = {
		'main.rs': { language: 'rust', code: 'fn main() {\n    println!("Hello");\n}' },
		'app.ts': { language: 'ts', code: "export const greeting = 'Hello';" },
		'Cargo.toml': { language: 'ini', code: '[package]\nname = "hello"' }
	};

	const names = new ListCollection(Object.keys(files));
	const picked = new SelectionController(names, {
		deselectable: false,
		initialValues: ['main.rs']
	});
	let name = $derived(picked.firstSelectedValue ?? 'main.rs');
	let file = $derived(files[name]);
</script>

<div class="viewer">
	<ListBox.Root collection={names} controller={picked} aria-label="Files" />
	{#if file}
		<CodeBlock code={file.code} language={file.language} showLineNumbers label={name} />
	{/if}
</div>

<style>
	.viewer {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: var(--oito2-space-md);
	}
</style>
```

Without a known `language` the block shows plain text; with `autoDetect` and no language it guesses among the registered grammars. Twenty-seven grammars are registered by default; the [`@oito2/ui-syntax` README](../../../../packages/ui-syntax/README.md) shows how to add others. Showcase page: [Code block](https://oito2.github.io/oito2_uikit/code-block).

## Notifications for a long task

`toast()` shows a message in the app's `Toaster` and returns a handle. `toast.promise` shows a loading toast until a promise settles, then its outcome; an action button can retry.

```svelte
<script lang="ts">
	import { Button, toast, type ToastHandle } from '@oito2/ui';

	let progress: ToastHandle | null = null;

	/** Pretends to upload files: resolves with the count, or fails three times in ten. */
	function upload(): Promise<number> {
		return new Promise((resolve, reject) =>
			setTimeout(() => (Math.random() > 0.3 ? resolve(3) : reject(new Error('offline'))), 1500)
		);
	}

	function send() {
		void toast.promise(upload(), {
			loading: { title: 'Uploading 3 files…' },
			success: (count) => ({ title: `Uploaded ${count} files`, type: 'success' }),
			error: () => ({
				title: 'Upload failed',
				description: 'The server could not be reached.',
				type: 'danger',
				actionLabel: 'Retry',
				onAction: send
			})
		});
	}

	function exportAll() {
		let percent = 0;
		progress?.dismiss();
		const handle = toast({ title: 'Exporting… 0%', loading: true, duration: null });
		progress = handle;
		const timer = setInterval(() => {
			percent += 25;
			if (percent >= 100) {
				clearInterval(timer);
				handle.update({ title: 'Export finished', type: 'success' });
			} else {
				handle.update({ title: `Exporting… ${percent}%`, loading: true, duration: null });
			}
		}, 500);
	}
</script>

<Button variant="tonal" onclick={send}>Upload</Button>
<Button variant="outlined" onclick={exportAll}>Export</Button>
```

The toast types are `information`, `success`, `warning`, `danger` and `important`. `duration: null` keeps a toast until it is closed; `toast.dismissAll()` closes every toast. The timers pause while the pointer is over the toasts, and the toaster shows a few at a time while the rest wait. Showcase page: [Toast](https://oito2.github.io/oito2_uikit/toast).

## See also

- [Components](../../reference/components.md) — every component with its showcase page.
- [Theming](../theming.md), [Desktop integration](../desktop-integration.md), [Files](../files.md) and [Localization](../localization.md).
