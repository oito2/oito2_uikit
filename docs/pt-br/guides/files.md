🌐 [English](../../en/guides/files.md) | **Português** | 🏠 [Índice](../index.md)

---

# Arquivos

Como deixar o usuário escolher, soltar e salvar arquivos com `@oito2/ui-files`, num app Tauri e num navegador, com os mesmos componentes.

![A página de envio de arquivos do showcase](../../img/files-upload.png)

<!-- TODO: capture a screenshot of the showcase File upload page with images added -->

## Índice

- [Instalação](#instalação)
- [Configuração no Tauri](#configuração-no-tauri)
- [Enviando arquivos](#enviando-arquivos)
- [Uma área de soltar simples](#uma-área-de-soltar-simples)
- [Salvando arquivos](#salvando-arquivos)
- [Adaptadores](#adaptadores)
- [Arrastar e soltar e o escopo do fs](#arrastar-e-soltar-e-o-escopo-do-fs)
- [Funções auxiliares](#funções-auxiliares)

## Instalação

```bash
pnpm add @oito2/ui-files @oito2/ui svelte
```

Configure `@oito2/ui` primeiro (`styles.css` e um `ThemeProvider`). `@tauri-apps/api`, `@tauri-apps/plugin-dialog` e `@tauri-apps/plugin-fs` vêm como dependências do pacote e só são carregados dentro do Tauri, por imports dinâmicos.

## Configuração no Tauri

Dentro do Tauri os componentes usam os plugins oficiais **dialog** e **fs**. Adicione os crates na mesma versão major.minor dos pacotes npm (o repositório usa `tauri-plugin-dialog` 2.8 e `tauri-plugin-fs` 2.7):

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

Conceda à janela estas permissões — exatamente o conjunto que o showcase usa nas suas páginas de arquivos:

| Permissão             | Usada por                                                                           |
| --------------------- | ----------------------------------------------------------------------------------- |
| `dialog:allow-open`   | O seletor de arquivos nativo (`FileUpload`, `FileDropZone`)                         |
| `dialog:allow-save`   | O diálogo "Salvar como" (`DownloadTrigger`, `Downloads.save`)                       |
| `fs:allow-stat`       | Tamanho dos arquivos e distinção entre pastas e arquivos soltos                     |
| `fs:allow-read-file`  | Leitura dos arquivos escolhidos ou soltos (`PickedFile.bytes()`, prévias de imagem) |
| `fs:allow-write-file` | Gravação do arquivo salvo                                                           |

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

Nenhuma entrada `fs:scope` é necessária: os caminhos que o usuário escolhe num diálogo, e os caminhos soltos na janela, são acrescentados ao escopo do fs em tempo de execução (veja [abaixo](#arrastar-e-soltar-e-o-escopo-do-fs)). Ao salvar, a pasta sugerida é a de downloads, por `downloadDir()` de `@tauri-apps/api/path`.

## Enviando arquivos

`FileUpload` é uma área de soltar, a lista dos arquivos recusados com o motivo e a lista dos arquivos aceitos com o tamanho, uma prévia das imagens e um botão de remover. Um `FileUploadController` guarda os arquivos e os verifica à medida que são adicionados:

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

| Opção do controlador | Efeito                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| `accept`             | `FileTypeGroup[]` (`label`, `extensions`, `mimeTypes`); vazio aceita tudo   |
| `maxFiles`           | Número máximo de arquivos; ao atingi-lo, `FileUpload` desabilita a sua área |
| `maxFileSize`        | Tamanho máximo em bytes                                                     |
| `files`              | Arquivos iniciais                                                           |

O controlador é reativo: leia `files`, `rejected` (cada um com um `reason`: `type`, `size`, `count` ou `directory`) e `canAddMore`; chame `add`, `remove`, `clear` e `clearRejected`. Todo `PickedFile` tem `name`, `path` (só no Tauri, senão `null`), `mimeType`, `isDirectory`, `file` (o `File` do navegador, só na web), `size()` e `bytes()`.

Props de `FileUpload`: `controller`, `hint` (string ou snippet, substitui a linha padrão de tipos aceitos e limite de tamanho), `showPreviews` (padrão `true`), `enabled`, `adapter`, `zoneMinHeight` (padrão 160). As mensagens vêm do idioma ativo (veja [Localização](./localization.md)).

## Uma área de soltar simples

`FileDropZone` é só a caixa tracejada: um botão que abre o seletor de arquivos e recebe arquivos soltos. Ela passa tudo para `onFiles` sem verificar, pastas inclusive:

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

Props: `onFiles`, `accept` (filtra o seletor), `multiple` (padrão `true`; ao soltar, todos os arquivos soltos são passados sempre), `enabled`, `hint`, `adapter`, `minHeight` (padrão 160) e uma `ref` vinculável.

## Salvando arquivos

`DownloadTrigger` é um botão que monta o arquivo ao ser clicado, mostra um indicador de progresso enquanto `data` resolve, e o salva — o diálogo "Salvar como" no Tauri, um download no navegador:

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

`data` devolve um `Uint8Array` ou uma promessa de um. O conteúdo filho substitui o rótulo localizado "Download". Onde não é possível salvar, o botão fica desabilitado com uma dica explicando o motivo.

`Downloads` salva sem botão:

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

`Downloads.save` resolve para `false` quando o usuário cancela, e lança um erro quando o adaptador não consegue salvar arquivos.

## Adaptadores

Todo componente aceita uma prop `adapter` opcional. Sem ela, `defaultFilesAdapter()` escolhe um, uma única vez, com `isTauri()`:

| Comportamento         | `tauriFilesAdapter()`                                             | `webFilesAdapter()`                                           |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Escolher arquivos     | `open()` do plugin dialog, filtrado com `dialogFilters(accept)`   | Um `<input type="file">` oculto com `acceptAttribute(accept)` |
| Salvar                | `save()` do plugin dialog, depois `writeFile()` do plugin fs      | Uma URL de blob e um link `<a download>` temporário           |
| Soltar                | O `onDragDropEvent` do webview, comparado com o retângulo da área | Os eventos de arrastar e soltar do HTML na área               |
| Conteúdo dos arquivos | `stat()` e `readFile()` do plugin fs, sob demanda (`pathFile`)    | O objeto `File` (`webFile`)                                   |

Um adaptador próprio implementa a interface `FilesAdapter` (`canDropFiles`, `canSaveFiles`, `openFiles`, `saveFile`, `dropTarget`), para testes ou outra plataforma.

## Arrastar e soltar e o escopo do fs

No Tauri, os arquivos soltos na janela chegam como **caminhos**, não como objetos de arquivo. O adaptador do Tauri escuta os eventos de arrastar e soltar do webview, destaca a área enquanto o ponteiro está sobre ela e, ao soltar, fica só com os caminhos soltos dentro do retângulo da área. Depois chama `stat()` em cada caminho para marcar as pastas, e ignora os caminhos que não consegue consultar.

Ler esses caminhos funciona sem escopo configurado porque o plugin fs acrescenta cada caminho solto ao seu escopo de tempo de execução (arquivos, e pastas recursivamente). É a opção `scopeDroppedPaths` do plugin fs, que vale `true` por padrão; ela se aplica a todo webview que tenha alguma permissão do fs. Se você definir `plugins.fs.scopeDroppedPaths` como `false` no `tauri.conf.json`, os arquivos soltos deixam de poder ser lidos e você precisa conceder um `fs:scope` por conta própria. Os caminhos escolhidos no seletor de arquivos e no diálogo "Salvar como" do plugin dialog também são acrescentados ao escopo, pelo plugin dialog.

## Funções auxiliares

| Export                                                    | Finalidade                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `fileMatchesTypes(file, accept)`                          | Se um `PickedFile` corresponde aos tipos aceitos (inclusive padrões `image/*`) |
| `acceptAttribute(groups)`                                 | O atributo `accept` do HTML para os grupos                                     |
| `dialogFilters(groups)`                                   | Os filtros do plugin dialog para os grupos                                     |
| `mimeTypeOf(name)`, `extensionOf(name)`, `baseName(path)` | Funções de nome e caminho                                                      |
| `isPreviewableImage(file)`                                | Se `FileUpload` mostra uma prévia (imagens, exceto SVG)                        |
| `webFile(file)`, `pathFile(path)`                         | Envolvem um `File` do navegador ou um caminho do Tauri como `PickedFile`       |

## Veja também

- [README de `@oito2/ui-files`](../../../packages/ui-files/README.md)
- Páginas do showcase: [File upload](https://oito2.github.io/oito2_uikit/file-upload) e [Download trigger](https://oito2.github.io/oito2_uikit/download-trigger).
- [Integração com o desktop](./desktop-integration.md#capabilities) — as demais permissões do showcase.
