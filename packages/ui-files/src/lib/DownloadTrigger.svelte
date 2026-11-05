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
  A button that saves a file built on demand with `Downloads`. A click awaits `data`, with a
  spinner, and saves the bytes as `fileName`. `onSaved` reports whether the file was saved,
  and `onError` receives a failure of `data` or of saving. Where files can't be saved, the
  button is disabled and its tooltip says why.
-->
<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { Button, CircularProgress, Tooltip, useLocale, type IconComponent } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { defaultFilesAdapter, type FilesAdapter } from './adapters/adapter.js';
	import { Downloads } from './downloads.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The suggested file name. */
		fileName: string;
		/** Builds the file content when the button is activated. */
		data: () => Promise<Uint8Array> | Uint8Array;
		/** The MIME type of the file; a generic binary file when left out. */
		mimeType?: string | null;
		/** The button label; defaults to the localized "Download". */
		children?: Snippet;
		/** Called after a save with whether the file was saved. */
		onSaved?: (saved: boolean) => void;
		/** Called when building or saving the file fails; the error is logged when it isn't set. */
		onError?: (error: unknown) => void;
		/** Whether the button can be activated. Defaults to true. */
		enabled?: boolean;
		/** How the button reaches the platform; defaults to `defaultFilesAdapter()`. */
		adapter?: FilesAdapter;
	}

	let {
		fileName,
		data,
		mimeType = null,
		children,
		onSaved,
		onError,
		enabled = true,
		adapter: adapterProp,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let adapter = $derived(adapterProp ?? defaultFilesAdapter());
	let supported = $derived(Downloads.isSupported(adapter));
	let busy = $state(false);

	/** Builds and saves the file, with the spinner meanwhile. */
	async function download(): Promise<void> {
		busy = true;
		try {
			const bytes = await data();
			const saved = await Downloads.save({ fileName, bytes, mimeType }, adapter);
			onSaved?.(saved);
		} catch (error) {
			if (onError) onError(error);
			else console.error('oito2: failed to save the file', error);
		} finally {
			busy = false;
		}
	}
</script>

{#snippet button()}
	<Button
		variant="outlined"
		icon={busy ? undefined : (Download as IconComponent)}
		disabled={!supported || !enabled || busy}
		aria-busy={busy || undefined}
		onclick={download}
		{...rest}
	>
		{#if busy}<CircularProgress size={16} strokeWidth={2} label={locale.strings.loading} />{/if}
		{#if children}{@render children()}{:else}{locale.strings.download}{/if}
	</Button>
{/snippet}

{#if supported}
	{@render button()}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}<span {...props} class="oito2-download-unavailable"
					>{@render button()}</span
				>{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>{locale.strings.downloadUnavailable}</Tooltip.Content>
	</Tooltip.Root>
{/if}
