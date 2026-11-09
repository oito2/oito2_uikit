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

<!--
  @component
  One row of a `FileUpload`: the file name, its size once read, a thumbnail of an image
  file while `showPreviews` is on, and a remove button while `enabled`.
-->
<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import X from '@lucide/svelte/icons/x';
	import { IconButton, useFormat, useLocale, type IconComponent } from '@oito2/ui';
	import { isPreviewableImage, type PickedFile } from './files.js';

	interface Props {
		/** The file shown. */
		file: PickedFile;
		/** Whether an image file shows a thumbnail. */
		showPreviews: boolean;
		/** Whether the row has a remove button. */
		enabled: boolean;
		/** Called when the remove button is activated. */
		onRemove: () => void;
	}

	let { file, showPreviews, enabled, onRemove }: Props = $props();

	const locale = useLocale();
	const format = useFormat();

	let size = $state<number | null>(null);
	let previewUrl = $state<string | null>(null);
	let previewable = $derived(showPreviews && isPreviewableImage(file));

	// Reads the size of the file; a read that fails leaves the size blank.
	$effect(() => {
		const current = file;
		let cancelled = false;
		size = null;
		current.size().then(
			(bytes) => {
				if (!cancelled) size = bytes;
			},
			() => {}
		);
		return () => {
			cancelled = true;
		};
	});

	// Builds the thumbnail URL while the preview is shown, and revokes it once it isn't.
	$effect(() => {
		if (!previewable) return;
		const current = file;
		let cancelled = false;
		let url: string | null = null;
		const source = current.file
			? Promise.resolve(current.file)
			: current.bytes().then((bytes) => new Blob([bytes as Uint8Array<ArrayBuffer>]));
		source.then(
			(blob) => {
				if (cancelled) return;
				url = URL.createObjectURL(blob);
				previewUrl = url;
			},
			() => {}
		);
		return () => {
			cancelled = true;
			if (url) URL.revokeObjectURL(url);
			previewUrl = null;
		};
	});
</script>

<li class="oito2-file-upload-row">
	<span class="oito2-file-upload-thumbnail">
		{#if previewable}
			<img alt="" src={previewUrl ?? undefined} />
		{:else}
			<FileIcon aria-hidden="true" />
		{/if}
	</span>
	<span class="oito2-file-upload-text">
		<span class="oito2-file-upload-name">{file.name}</span>
		<span class="oito2-file-upload-size" data-size
			>{size === null ? '' : format.current.bytes(size)}</span
		>
	</span>
	{#if enabled}
		<IconButton
			icon={X as IconComponent}
			label={locale.strings.removeItem(file.name)}
			onclick={onRemove}
		/>
	{/if}
</li>

<style>
	@layer oito2 {
		.oito2-file-upload-row {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			padding: var(--oito2-space-sm);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
		}

		.oito2-file-upload-thumbnail {
			display: flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			overflow: hidden;
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-surface-container-highest);
			color: var(--oito2-color-on-surface-variant);
		}

		.oito2-file-upload-thumbnail img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.oito2-file-upload-thumbnail :global(svg) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.oito2-file-upload-text {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
		}

		.oito2-file-upload-name {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			font: var(--oito2-type-body-medium);
			font-weight: 500;
		}

		.oito2-file-upload-size {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}
	}
</style>
