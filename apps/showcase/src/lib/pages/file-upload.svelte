<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	import { isTauri } from '@tauri-apps/api/core';
	import { Button, Switch } from '@oito2/ui';
	import {
		FileDropZone,
		FileUpload,
		FileUploadController,
		type FileRejection,
		type PickedFile
	} from '@oito2/ui-files';
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
	const single = new FileUploadController({ maxFiles: 1 });
	const documents = new FileUploadController({
		accept: [{ label: 'Documents', extensions: ['pdf', 'txt', 'md'] }]
	});
	let enabled = $state(true);

	let dropped: PickedFile[] = $state([]);

	const reasons: Record<FileRejection, string> = {
		type: 'not an accepted type',
		size: 'larger than 5 MB',
		count: 'over the limit of five files',
		directory: 'a folder'
	};

	onDestroy(() => {
		images.dispose();
		single.dispose();
		documents.dispose();
	});
</script>

<main class="showcase-page">
	<p>
		<code>FileUpload</code> is a drop zone plus the list of accepted files, with their size, a
		preview of images and a remove button. A <code>FileUploadController</code> holds the files
		and checks the accepted types, the size limit and the number of files as they are added.
		Here it runs on the
		{isTauri() ? 'Tauri adapter (dialog and fs plugins)' : 'browser adapter'}.
	</p>

	<section aria-labelledby="file-upload-images">
		<h2 id="file-upload-images">Images with limits</h2>
		<p>
			Up to five images of 5 MB. Other types, larger files and folders are refused, and the
			upload lists why.
		</p>
		<div class="file-upload-box">
			<FileUpload controller={images} />
		</div>
	</section>

	<section aria-labelledby="file-upload-state">
		<h2 id="file-upload-state">Reading the controller</h2>
		<p>The controller is reactive: the app reads its files and refusals and can clear them.</p>
		<div class="row">
			<Button
				variant="outlined"
				disabled={images.files.length === 0 && images.rejected.length === 0}
				onclick={() => images.clear()}>Clear the images</Button
			>
			<span class="note" role="status">
				{images.files.length} of 5 images{images.canAddMore
					? ''
					: ', the limit is reached'}.
			</span>
		</div>
		{#if images.rejected.length > 0}
			<ul>
				{#each images.rejected as rejection, index (index)}
					<li>{rejection.file.name}: {reasons[rejection.reason]}</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="file-upload-single">
		<h2 id="file-upload-single">A single file, without previews</h2>
		<div class="file-upload-box">
			<FileUpload controller={single} showPreviews={false} zoneMinHeight={120} />
		</div>
	</section>

	<section aria-labelledby="file-upload-custom">
		<h2 id="file-upload-custom">Custom hint and disabled</h2>
		<p>
			The <code>hint</code> replaces the default line of accepted types; with
			<code>enabled</code> off nothing can be added or removed.
		</p>
		<label class="row">Enabled <Switch bind:checked={enabled} /></label>
		<div class="file-upload-box">
			<FileUpload controller={documents} {enabled} zoneMinHeight={120}>
				{#snippet hint()}PDF, plain text or Markdown, any size{/snippet}
			</FileUpload>
		</div>
	</section>

	<section aria-labelledby="file-upload-zone">
		<h2 id="file-upload-zone">Drop zone</h2>
		<p>
			<code>FileDropZone</code> alone passes everything chosen or dropped, unchecked, folders included.
		</p>
		<div class="file-upload-box">
			<FileDropZone
				onFiles={(files) => (dropped = files)}
				minHeight={120}
				hint="Anything goes"
			/>
		</div>
		{#if dropped.length > 0}
			<ul>
				{#each dropped as file, index (index)}
					<li>
						{file.name}{file.isDirectory ? ' (folder)' : ''}{file.mimeType
							? ` — ${file.mimeType}`
							: ''}{file.path ? ` — ${file.path}` : ''}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.file-upload-box {
		max-width: 640px;
	}
</style>
