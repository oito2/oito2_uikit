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
  A file upload: a `FileDropZone` that adds files to `controller`, the files refused by the
  last addition with the reasons, and the list of accepted files with their size, a
  preview of images and a remove button.

  The zone hint defaults to the accepted types and the size limit of the controller; the
  zone is disabled once the controller holds its largest number of files.
-->
<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import X from '@lucide/svelte/icons/x';
	import { IconButton, InfoBox, useFormat, useLocale, type IconComponent } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FilesAdapter } from './adapters/adapter.js';
	import FileDropZone from './FileDropZone.svelte';
	import { isPreviewableImage, type PickedFile } from './files.js';
	import type { FileUploadController, RejectedFile } from './upload-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The controller that holds the files and checks their limits. */
		controller: FileUploadController;
		/** Replaces the default zone hint, which lists the accepted types and the size limit. */
		hint?: string | Snippet;
		/** Whether image files show a thumbnail. Defaults to true. */
		showPreviews?: boolean;
		/** Whether files can be added and removed. Defaults to true. */
		enabled?: boolean;
		/** How the upload reaches the platform; defaults to `defaultFilesAdapter()`. */
		adapter?: FilesAdapter;
		/** The smallest height of the drop zone in pixels. Defaults to 160. */
		zoneMinHeight?: number;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		controller,
		hint,
		showPreviews = true,
		enabled = true,
		adapter,
		zoneMinHeight = 160,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const format = useFormat();

	let defaultHint = $derived.by(() => {
		const parts: string[] = [];
		if (controller.accept.length > 0) {
			const types = controller.accept
				.map((group) => group.label ?? group.extensions?.join(', '))
				.filter((label): label is string => !!label)
				.join(', ');
			parts.push(locale.strings.acceptedFileTypes(types));
		}
		if (controller.maxFileSize !== null)
			parts.push(
				locale.strings.maxFileSizeHint(format.current.bytes(controller.maxFileSize))
			);
		return parts.length === 0 ? undefined : parts.join(' · ');
	});

	/** Returns the localized message that explains why `rejected` was refused. */
	function reason(rejected: RejectedFile): string {
		const name = rejected.file.name;
		switch (rejected.reason) {
			case 'type':
				return locale.strings.fileTypeNotAccepted(name);
			case 'size':
				return locale.strings.fileTooLarge(
					name,
					format.current.bytes(controller.maxFileSize ?? 0)
				);
			case 'count':
				return locale.strings.tooManyFiles(name, controller.maxFiles ?? 0);
			case 'directory':
				return locale.strings.folderNotAccepted(name);
		}
	}

	/** Shows the size of `file` once it is read, and a thumbnail of an image file. */
	function fileRow(node: HTMLElement, file: PickedFile): () => void {
		let cancelled = false;
		let url: string | null = null;
		const size = node.querySelector<HTMLElement>('[data-size]');
		const image = node.querySelector<HTMLImageElement>('img');
		void file.size().then(
			(bytes) => {
				if (!cancelled && size) size.textContent = format.current.bytes(bytes);
			},
			() => {}
		);
		if (image) {
			const source = file.file
				? Promise.resolve(file.file)
				: file.bytes().then((bytes) => new Blob([bytes as Uint8Array<ArrayBuffer>]));
			void source.then(
				(blob) => {
					if (cancelled) return;
					url = URL.createObjectURL(blob);
					image.src = url;
				},
				() => {}
			);
		}
		return () => {
			cancelled = true;
			if (url) URL.revokeObjectURL(url);
		};
	}
</script>

<div bind:this={ref} class={['oito2-file-upload', className]} {...rest}>
	<FileDropZone
		onFiles={(files) => void controller.add(files)}
		accept={controller.accept}
		multiple={controller.maxFiles !== 1}
		enabled={enabled && controller.canAddMore}
		hint={hint ?? defaultHint}
		{adapter}
		minHeight={zoneMinHeight}
	/>
	{#if controller.rejected.length > 0}
		<InfoBox type="danger">
			{#snippet subtitle()}
				{#each controller.rejected as rejected, index (index)}
					<span class="oito2-file-upload-reason">{reason(rejected)}</span>
				{/each}
			{/snippet}
			{#snippet trailing()}
				<IconButton
					icon={X as IconComponent}
					label={locale.strings.close}
					onclick={() => controller.clearRejected()}
				/>
			{/snippet}
		</InfoBox>
	{/if}
	{#if controller.files.length > 0}
		<ul class="oito2-file-upload-list">
			{#each controller.files as file (file)}
				<li class="oito2-file-upload-row" {@attach (node) => fileRow(node, file)}>
					<span class="oito2-file-upload-thumbnail">
						{#if showPreviews && isPreviewableImage(file)}
							<img alt="" />
						{:else}
							<FileIcon aria-hidden="true" />
						{/if}
					</span>
					<span class="oito2-file-upload-text">
						<span class="oito2-file-upload-name">{file.name}</span>
						<span class="oito2-file-upload-size" data-size></span>
					</span>
					{#if enabled}
						<IconButton
							icon={X as IconComponent}
							label={locale.strings.removeItem(file.name)}
							onclick={() => controller.remove(file)}
						/>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-file-upload {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-sm);
		}

		.oito2-file-upload-reason {
			display: block;
		}

		.oito2-file-upload-list {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-sm);
			margin: 0;
			padding: 0;
			list-style: none;
		}

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
