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
  A text label that turns into a field to rename it in place. A double click, Enter or F2
  starts editing with the text selected. Enter or leaving the field keeps the change,
  calling `onSubmit` with the trimmed text when it changed and isn't empty; Escape
  restores the text. Without `onSubmit` the label is read-only.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The label text. */
		text: string;
		/** Called with the new, trimmed text after a change. */
		onSubmit?: (text: string) => void;
		/** Shown in the placeholder color while `text` is empty. */
		placeholder?: string;
		/** Whether the label is being edited. */
		editing?: boolean;
		/** The label element. */
		ref?: HTMLElement | null;
	}

	let {
		text,
		onSubmit,
		placeholder,
		editing = $bindable(false),
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const id = $props.id();
	let draft = $state('');
	let input = $state<HTMLInputElement | null>(null);
	let readOnly = $derived(onSubmit === undefined);

	/** Starts editing with the whole text selected. */
	async function start() {
		if (readOnly || editing) return;
		draft = text;
		editing = true;
		await tick();
		input?.focus();
		input?.select();
	}

	/** Ends editing, submitting a non-empty change when `keep`, and refocuses the label. */
	async function finish(keep: boolean) {
		if (!editing) return;
		const next = draft.trim();
		const refocus = document.activeElement === input;
		editing = false;
		if (keep && next && next !== text) onSubmit?.(next);
		if (refocus) {
			await tick();
			ref?.focus();
		}
	}
</script>

{#if editing}
	<input
		bind:this={input}
		bind:value={draft}
		class={['oito2-editable-label-input', className]}
		aria-label={text || placeholder}
		onkeydown={(event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				void finish(true);
			} else if (event.key === 'Escape') {
				event.preventDefault();
				void finish(false);
			}
		}}
		onblur={() => void finish(true)}
	/>
{:else if readOnly}
	<span
		bind:this={ref}
		class={['oito2-editable-label', className]}
		data-empty={text ? undefined : ''}
		data-read-only=""
		{...rest}
	>
		{text || placeholder || ''}
	</span>
{:else}
	<span
		bind:this={ref}
		role="button"
		tabindex="0"
		aria-describedby="{id}-hint"
		class={['oito2-editable-label', className]}
		data-empty={text ? undefined : ''}
		ondblclick={start}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === 'F2') {
				event.preventDefault();
				void start();
			}
		}}
		{...rest}
	>
		{text || placeholder || ''}
	</span>
	<span id="{id}-hint" hidden>{locale.strings.editText}</span>
{/if}

<style>
	@layer oito2 {
		.oito2-editable-label {
			display: inline-block;
			padding: var(--oito2-space-xs);
			border-radius: var(--oito2-radius-small);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
			cursor: text;
		}

		[data-read-only] {
			cursor: default;
		}

		[data-empty] {
			color: var(--oito2-color-on-surface-variant);
		}

		.oito2-editable-label:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-editable-label-input {
			box-sizing: border-box;
			min-width: 0;
			margin: 0;
			padding: calc(var(--oito2-space-xs) - 1px);
			border: 1px solid var(--oito2-color-primary-text);
			border-radius: var(--oito2-radius-small);
			outline: 1px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
		}
	}
</style>
