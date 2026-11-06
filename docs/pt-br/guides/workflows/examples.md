🌐 [English](../../../en/guides/workflows/examples.md) | **Português** | 🏠 [Índice](../../index.md)

---

# Exemplos de fluxos

Telas completas e mínimas montadas com os componentes, cada uma num único componente Svelte 5. Elas supõem que a raiz do app já importa `@oito2/ui/styles.css` e envolve tudo num `ThemeProvider` com um `Toaster` (veja [Início rápido](../../getting-started/quickstart.md)). Os padrões vêm das páginas do showcase em [`apps/showcase/src/lib/pages/`](../../../../apps/showcase/src/lib/pages), onde cada componente tem mais variações.

## Índice

- [Um diálogo de configurações](#um-diálogo-de-configurações)
- [Um navegador de arquivos mestre-detalhe](#um-navegador-de-arquivos-mestre-detalhe)
- [Comandos, atalhos e uma paleta de comandos](#comandos-atalhos-e-uma-paleta-de-comandos)
- [Um visualizador de código](#um-visualizador-de-código)
- [Notificações para uma tarefa longa](#notificações-para-uma-tarefa-longa)

## Um diálogo de configurações

Um diálogo com chaves, uma seleção e um controle deslizante, vinculados a um objeto reativo de configurações. `Select.Root` sem partes renderiza o seu próprio gatilho e a sua lista a partir de uma `ListCollection`.

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

Escape e um clique fora fecham o diálogo, e o foco fica dentro dele enquanto está aberto. Para fechá-lo pelo código (depois de validar um formulário, por exemplo), vincule `open` em `Dialog.Root`. Páginas do showcase: [Dialog](https://oito2.github.io/oito2_uikit/dialog), [Switch](https://oito2.github.io/oito2_uikit/switch), [Select](https://oito2.github.io/oito2_uikit/select), [Slider](https://oito2.github.io/oito2_uikit/slider).

## Um navegador de arquivos mestre-detalhe

Pastas no painel mestre e os arquivos da pasta selecionada num `ListBox` no detalhe. A partir da largura `breakpoint`, os painéis ficam lado a lado; abaixo dela, a lista ocupa a área e o detalhe ganha um botão de voltar.

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

Enter ou um clique duplo ativa um arquivo. Para pastas aninhadas, use um `TreeView` com uma `TreeCollection` (`TreeCollection.fromPaths([...])` monta uma a partir de caminhos) e um `TreeController` no lugar da lista mestre. Páginas do showcase: [Master-detail](https://oito2.github.io/oito2_uikit/master-detail), [List box](https://oito2.github.io/oito2_uikit/list-box), [Tree view](https://oito2.github.io/oito2_uikit/tree-view).

## Comandos, atalhos e uma paleta de comandos

`Commands` é um escopo de ações nomeadas: ele executa um comando quando o seu atalho é pressionado com o foco dentro do escopo (ou em qualquer lugar, com `global`), e oferece os seus comandos à `CommandPalette`. `Shortcut.parse` lê atalhos como `Mod+S` (Control, ou Command no macOS) e sequências como `G H`.

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

Cada palavra digitada precisa corresponder ao rótulo, à descrição, ao grupo ou às palavras-chave de um comando; as setas para cima e para baixo movem, Enter executa, Escape fecha. Comandos desabilitados (`enabled: false`) ficam fora da paleta. Atalhos sem Control, Alt ou Meta são ignorados enquanto o usuário digita num campo de texto. `ShortcutRecorder` permite que o usuário grave um novo atalho. Páginas do showcase: [Command palette](https://oito2.github.io/oito2_uikit/command-palette), [Shortcuts](https://oito2.github.io/oito2_uikit/shortcuts).

## Um visualizador de código

`CodeBlock`, de `@oito2/ui-syntax`, mostra código destacado somente para leitura, nas cores de sintaxe do tema ativo, com números de linha e um botão de copiar. Importe a fonte JetBrains Mono embutida uma vez, na raiz do app:

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

Sem uma `language` conhecida, o bloco mostra texto simples; com `autoDetect` e sem linguagem, ele adivinha entre as gramáticas registradas. Vinte e sete gramáticas vêm registradas por padrão; o [README de `@oito2/ui-syntax`](../../../../packages/ui-syntax/README.md) mostra como acrescentar outras. Página do showcase: [Code block](https://oito2.github.io/oito2_uikit/code-block).

## Notificações para uma tarefa longa

`toast()` mostra uma mensagem no `Toaster` do app e devolve um identificador. `toast.promise` mostra um toast de carregamento até a promessa se resolver e, depois, o resultado; um botão de ação pode tentar de novo.

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

Os tipos de toast são `information`, `success`, `warning`, `danger` e `important`. `duration: null` mantém um toast até ele ser fechado; `toast.dismissAll()` fecha todos. Os temporizadores pausam enquanto o ponteiro está sobre os toasts, e o toaster mostra alguns de cada vez enquanto os demais esperam. Página do showcase: [Toast](https://oito2.github.io/oito2_uikit/toast).

## Veja também

- [Componentes](../../reference/components.md) — todos os componentes, com a sua página no showcase.
- [Temas](../theming.md), [Integração com o desktop](../desktop-integration.md), [Arquivos](../files.md) e [Localização](../localization.md).
