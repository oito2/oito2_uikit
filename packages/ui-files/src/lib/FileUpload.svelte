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
	import X from '@lucide/svelte/icons/x';
	import { IconButton, InfoBox, useFormat, useLocale, type IconComponent } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FilesAdapter } from './adapters/adapter.js';
	import FileDropZone from './FileDropZone.svelte';
	import FileRow from './FileRow.svelte';
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
			case 'unreadable':
				return locale.strings.fileUnreadable(name);
		}
	}
</script>

<div bind:this={ref} class={['oito2-file-upload', className]} {...rest}>
	<FileDropZone
		onFiles={(files) =>
			controller
				.add(files)
				.catch((error) => console.error('oito2: could not add the files', error))}
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
				<FileRow {file} {showPreviews} {enabled} onRemove={() => controller.remove(file)} />
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
	}
</style>
