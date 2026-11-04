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
  A code entry drawn as `length` one-character cells, such as a PIN or a one-time code.
  One input sits under the cells, so typing, deleting, pasting a whole code and one-time
  code autofill work as in any field; a pasted code fills the cells in order. When the
  last cell is filled it calls `onComplete` and gives up the focus. With `numeric` only
  digits are kept; otherwise spaces are dropped.
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value' | 'type'> {
		/** The code. */
		value?: string;
		/** The number of characters. Defaults to 6. */
		length?: number;
		/** Called whenever the code changes. */
		onValueChange?: (value: string) => void;
		/** Called with the code when every cell is filled. */
		onComplete?: (value: string) => void;
		/** Whether only digits are accepted. Defaults to true. */
		numeric?: boolean;
		/** Whether the characters show as dots. */
		obscure?: boolean;
		/** Whether the cells show the error border. */
		invalid?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(''),
		length = 6,
		onValueChange,
		onComplete,
		numeric = true,
		obscure = false,
		invalid = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		'aria-label': ariaLabel,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const segmenter = new Intl.Segmenter();
	let focused = $state(false);
	let chars = $derived([...segmenter.segment(value)].map((part) => part.segment));
	let active = $derived(Math.min(chars.length, length - 1));

	/** Keeps the allowed characters of `text`, up to `length` of them. */
	function clean(text: string): string {
		const kept = numeric ? text.replace(/\D/g, '') : text.replace(/\s/g, '');
		return [...segmenter.segment(kept)]
			.slice(0, length)
			.map((part) => part.segment)
			.join('');
	}

	function oninput(event: Event & { currentTarget: HTMLInputElement }) {
		const next = clean(event.currentTarget.value);
		event.currentTarget.value = next;
		if (next === value) return;
		value = next;
		onValueChange?.(next);
		if ([...segmenter.segment(next)].length === length) {
			onComplete?.(next);
			event.currentTarget.blur();
		}
	}

	/** Keeps the caret at the end, so the active cell is always the next empty one. */
	function caretAtEnd(event: Event & { currentTarget: HTMLInputElement }) {
		const end = event.currentTarget.value.length;
		event.currentTarget.setSelectionRange(end, end);
	}
</script>

<div
	class={['oito2-pin-entry', className]}
	data-invalid={invalid ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
>
	<div class="cells" aria-hidden="true">
		{#each { length }, index (index)}
			{@const char = chars[index] ?? ''}
			<span class="cell" data-active={focused && index === active ? '' : undefined}>
				{char ? (obscure ? '•' : char) : ''}
			</span>
		{/each}
	</div>
	<input
		bind:this={ref}
		{value}
		type={obscure ? 'password' : 'text'}
		inputmode={numeric ? 'numeric' : 'text'}
		autocomplete="one-time-code"
		autocapitalize="off"
		spellcheck={false}
		maxlength={length * 4}
		{disabled}
		aria-label={ariaLabel ?? locale.strings.codeEntry(length)}
		aria-invalid={invalid || undefined}
		{oninput}
		onfocus={(event) => {
			focused = true;
			caretAtEnd(event);
		}}
		onblur={() => (focused = false)}
		onselect={caretAtEnd}
		onpointerup={caretAtEnd}
		{...rest}
	/>
</div>

<style>
	@layer oito2 {
		.oito2-pin-entry {
			position: relative;
			display: inline-flex;
		}

		.cells {
			display: flex;
			gap: var(--oito2-space-sm);
		}

		.cell {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: calc(var(--oito2-control-height) + 2px);
			height: calc(var(--oito2-control-height) + 6px);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-title-large);
			letter-spacing: var(--oito2-type-title-large-tracking);
		}

		.cell[data-active] {
			border: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
		}

		[data-invalid] .cell {
			border: var(--oito2-size-focus-border-width) solid var(--oito2-color-error-text);
		}

		[data-disabled] .cell {
			border-color: color-mix(in srgb, var(--oito2-color-outline) 38%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}

		input {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
			border: none;
			outline: none;
			background: transparent;
			color: transparent;
			caret-color: transparent;
			font-size: 1px;
			cursor: text;
		}

		input::selection {
			background: transparent;
		}
	}
</style>
