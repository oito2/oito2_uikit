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
  An icon button that copies `text` to the clipboard. After a copy the icon turns into a
  check mark and the label into "Copied" for `feedbackDuration`, and screen readers hear
  it. When the platform refuses the copy, such as a browser without clipboard permission,
  it shows a cross and "Couldn't copy" instead, and `onError` receives the error.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { announce } from '../../internal/live-region.js';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import Swap from '../controls/Swap.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The text copied. */
		text: string;
		/** The label before copying. Defaults to "Copy". */
		label?: string;
		/** Called after each copy. */
		onCopied?: () => void;
		/** Called with the error when the platform refuses a copy. */
		onError?: (error: unknown) => void;
		/** How long the feedback shows, in milliseconds. Defaults to 1500. */
		feedbackDuration?: number;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		text,
		label,
		onCopied,
		onError,
		feedbackDuration = 1500,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	/** Whether the last copy worked, while its feedback shows; `null` when idle. */
	let copied = $state<boolean | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	let name = $derived(
		copied === true
			? locale.strings.copied
			: copied === false
				? locale.strings.copyFailed
				: (label ?? locale.strings.copy)
	);

	/** Copies the text, shows and announces the outcome, then goes back to idle. */
	async function copy() {
		let error: unknown = null;
		try {
			await navigator.clipboard.writeText(text);
		} catch (caught) {
			error = caught ?? new Error('copy failed');
		}
		copied = error === null;
		announce(copied ? locale.strings.copied : locale.strings.copyFailed);
		if (copied) onCopied?.();
		else onError?.(error);
		clearTimeout(timer);
		timer = setTimeout(() => (copied = null), feedbackDuration);
	}
</script>

<IconButton
	bind:ref
	label={name}
	class={['oito2-copy-button', className]}
	data-state={copied === null ? 'idle' : copied ? 'copied' : 'failed'}
	onclick={copy}
	{...rest}
>
	<Swap swapped={copied !== null} effect="scale">
		{#snippet off()}<Copy size={20} aria-hidden="true" class="oito2-copy-icon" />{/snippet}
		{#snippet on()}
			{#if copied === false}
				<X size={20} aria-hidden="true" class="oito2-copy-icon oito2-copy-failed" />
			{:else}
				<Check size={20} aria-hidden="true" class="oito2-copy-icon oito2-copy-done" />
			{/if}
		{/snippet}
	</Swap>
</IconButton>

<style>
	@layer oito2 {
		:global(.oito2-copy-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		:global(.oito2-copy-done) {
			color: var(--oito2-color-success);
		}

		:global(.oito2-copy-failed) {
			color: var(--oito2-color-error-text);
		}
	}
</style>
