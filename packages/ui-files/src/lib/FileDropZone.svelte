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
  A dashed box that opens the file chooser when activated and receives files dragged onto
  it from the desktop.

  The chosen or dropped files go to `onFiles` unchecked; a `FileUploadController` checks
  them against its limits. `accept` filters the file chooser. Drops pass every dropped file
  even when `multiple` is off.
-->
<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import { useLocale } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { defaultFilesAdapter, type FilesAdapter } from './adapters/adapter.js';
	import type { FileTypeGroup, PickedFile } from './files.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** Receives the chosen or dropped files. */
		onFiles: (files: PickedFile[]) => void;
		/** The file types the file chooser offers; empty offers every file. */
		accept?: readonly FileTypeGroup[];
		/** Whether several files can be chosen at once. Defaults to true. */
		multiple?: boolean;
		/** Whether the zone opens the chooser and receives drops. Defaults to true. */
		enabled?: boolean;
		/** A line under the title, such as the accepted types and sizes. */
		hint?: string | Snippet;
		/** How the zone reaches the platform; defaults to `defaultFilesAdapter()`. */
		adapter?: FilesAdapter;
		/** The smallest height in pixels. Defaults to 160. */
		minHeight?: number;
		/** The element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		onFiles,
		accept = [],
		multiple = true,
		enabled = true,
		hint,
		adapter: adapterProp,
		minHeight = 160,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	const locale = useLocale();
	let adapter = $derived(adapterProp ?? defaultFilesAdapter());
	let dragging = $state(false);
	let choose = $derived(multiple ? locale.strings.chooseFiles : locale.strings.chooseFile);

	/** Opens the file chooser and hands the chosen files to `onFiles`. */
	async function pick(): Promise<void> {
		const files = await adapter.openFiles({ accept, multiple });
		if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
	}
</script>

<button
	bind:this={ref}
	type="button"
	class={['oito2-file-drop-zone', className]}
	disabled={!enabled}
	aria-describedby={hint ? `${id}-hint` : undefined}
	data-dragging={dragging && enabled ? '' : undefined}
	style:min-height="{minHeight}px"
	onclick={pick}
	{@attach (element) => {
		const target = adapter;
		if (!enabled || !target.canDropFiles) return;
		const stop = target.dropTarget(element, {
			onHover: (next) => (dragging = next),
			onDrop: (files) => onFiles(files)
		});
		return () => {
			stop();
			dragging = false;
		};
	}}
	{...rest}
>
	<span class="oito2-file-drop-zone-icon" aria-hidden="true"><Upload /></span>
	<span class="oito2-file-drop-zone-title">
		{adapter.canDropFiles ? locale.strings.dropFilesHere : choose}
	</span>
	{#if hint}
		<!-- The hint is the button's description, so it stays out of its name. -->
		<span class="oito2-file-drop-zone-hint" id="{id}-hint" aria-hidden="true">
			{#if typeof hint === 'string'}{hint}{:else}{@render hint()}{/if}
		</span>
	{/if}
	{#if adapter.canDropFiles}
		<!-- The whole zone is the button; this only shows where to click. -->
		<span class="oito2-file-drop-zone-choose">{choose}</span>
	{/if}
</button>

<style>
	@layer oito2 {
		.oito2-file-drop-zone {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			width: 100%;
			padding: var(--oito2-space-lg);
			border: 1.5px dashed var(--oito2-color-outline);
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-surface-container-low);
			color: var(--oito2-color-on-surface);
			font: inherit;
			text-align: center;
			cursor: pointer;
			transition:
				background-color 120ms ease,
				border-color 120ms ease;
		}

		.oito2-file-drop-zone:hover:not(:disabled) {
			background: color-mix(
				in srgb,
				var(--oito2-color-on-surface) 4%,
				var(--oito2-color-surface-container-low)
			);
		}

		.oito2-file-drop-zone:focus-visible {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-file-drop-zone[data-dragging] {
			border-color: var(--oito2-color-primary-text);
			background: color-mix(
				in srgb,
				var(--oito2-color-primary-text) 8%,
				var(--oito2-color-surface-container-low)
			);
		}

		.oito2-file-drop-zone:disabled {
			cursor: default;
			opacity: 0.5;
		}

		.oito2-file-drop-zone-icon {
			display: inline-flex;
			padding: var(--oito2-space-sm);
			border-radius: 50%;
			background: var(--oito2-color-surface-container-highest);
			color: var(--oito2-color-on-surface-variant);
		}

		[data-dragging] .oito2-file-drop-zone-icon {
			color: var(--oito2-color-primary-text);
		}

		.oito2-file-drop-zone-icon :global(svg) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.oito2-file-drop-zone-title {
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
		}

		.oito2-file-drop-zone-hint {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}

		.oito2-file-drop-zone-choose {
			display: inline-flex;
			align-items: center;
			height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-lg);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			color: var(--oito2-color-primary-text);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-file-drop-zone {
				transition: none;
			}
		}
	}
</style>
