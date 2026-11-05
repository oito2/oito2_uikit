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
	import {
		DownloadTrigger,
		FileDropZone,
		FileUpload,
		FileUploadController,
		type PickedFile
	} from '@oito2/ui-files';

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
	const anything = new FileUploadController({ maxFiles: 1 });

	let dropped: PickedFile[] = $state([]);
	let saved = $state('');

	/** Builds a small report of the images in the upload. */
	function report(): Uint8Array {
		const lines = images.files.map((file) => `- ${file.name}`);
		return new TextEncoder().encode(
			['# oito2_uikit files', '', ...(lines.length ? lines : ['No images yet.']), ''].join(
				'\n'
			)
		);
	}
</script>

<main>
	<h1>Files</h1>
	<p>
		The file components of <code>@oito2/ui-files</code>, phase F13, here with the
		{isTauri() ? 'Tauri adapter (dialog and fs plugins)' : 'browser adapter'}.
	</p>

	<section aria-labelledby="upload">
		<h2 id="upload">File upload</h2>
		<p>Up to five images of 5 MB; other types, larger files and folders are refused.</p>
		<FileUpload controller={images} />
	</section>

	<section aria-labelledby="single">
		<h2 id="single">A single file, without previews</h2>
		<FileUpload controller={anything} showPreviews={false} zoneMinHeight={120} />
	</section>

	<section aria-labelledby="zone">
		<h2 id="zone">Drop zone</h2>
		<p>Everything chosen or dropped, unchecked, folders included.</p>
		<FileDropZone onFiles={(files) => (dropped = files)} minHeight={120} />
		{#if dropped.length > 0}
			<ul>
				{#each dropped as file, index (index)}
					<li>
						{file.name}{file.isDirectory ? ' (folder)' : ''}{file.path
							? ` — ${file.path}`
							: ''}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="download">
		<h2 id="download">Download</h2>
		<div class="row">
			<DownloadTrigger
				fileName="oito2-files.md"
				mimeType="text/markdown"
				data={report}
				onSaved={(ok) => (saved = ok ? 'Saved.' : 'Canceled.')}
				onError={(error) => (saved = `Failed: ${String(error)}`)}
			/>
			{#if saved}<span role="status">{saved}</span>{/if}
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		max-width: 640px;
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md);
	}
</style>
