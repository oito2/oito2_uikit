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

<!-- Test helper: the file components with an injected adapter, for the interaction tests, axe and goldens. -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';
	import DownloadTrigger from '../lib/DownloadTrigger.svelte';
	import FileDropZone from '../lib/FileDropZone.svelte';
	import FileUpload from '../lib/FileUpload.svelte';
	import type { FilesAdapter } from '../lib/adapters/adapter.js';
	import type { PickedFile } from '../lib/files.js';
	import { FileUploadController } from '../lib/upload-controller.svelte.js';

	interface Props {
		show: string;
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		adapter?: FilesAdapter;
		controller?: FileUploadController;
		dropped?: PickedFile[];
		log?: string[];
	}

	let {
		show,
		mode = 'light',
		highContrast = false,
		adapter,
		controller = new FileUploadController(),
		dropped = $bindable(),
		log = []
	}: Props = $props();
</script>

<ThemeProvider {mode} {highContrast} accent="blue" data-testid="gallery">
	<main class="stage" class:still={show === 'gallery'} data-dropped={dropped?.length}>
		{#if show === 'zone'}
			<FileDropZone
				{adapter}
				hint="PNG or PDF"
				onFiles={(files) => (dropped = files)}
				data-testid="zone"
			/>
		{:else if show === 'upload' || show === 'gallery'}
			<FileUpload {controller} {adapter} />
		{/if}
		{#if show === 'download' || show === 'gallery'}
			<div class="row">
				<DownloadTrigger
					{adapter}
					fileName="report.txt"
					mimeType="text/plain"
					data={() => new TextEncoder().encode('hello')}
					onSaved={(saved) => log.push(`saved:${saved}`)}
					onError={(error) => log.push(`error:${String(error)}`)}
				/>
				{#if show === 'gallery'}
					<FileDropZone {adapter} enabled={false} onFiles={() => {}} minHeight={100} />
				{/if}
			</div>
		{/if}
	</main>
</ThemeProvider>

<style>
	.stage {
		display: grid;
		gap: 16px;
		width: 560px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	/* Keeps a pointer left over from earlier tests from hovering the gallery in the golden. */
	.still {
		pointer-events: none;
	}

	.row {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 16px;
	}
</style>
