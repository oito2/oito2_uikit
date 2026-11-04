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
  Internal: a text field whose text is parsed into a value, shared by the date and time
  entries. The parse error shows only after the field loses focus or Enter is pressed, so
  partial input isn't flagged while typing; valid text hides it at once. A value set from
  outside replaces the text while the field doesn't have focus.
-->
<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import TextField from '../field/TextField.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value'> {
		/** The parsed value, or `null` for an empty field. */
		value: T | null;
		/** Formats a value for the field. */
		format: (value: T) => string;
		/** Parses text into a value (`null` for empty), or returns an error message. */
		parse: (text: string) => { value: T | null } | { error: string };
		/** Compares two values. */
		same: (a: T | null, b: T | null) => boolean;
		/** Called with each new valid value. */
		onValueChange: (value: T | null) => void;
		/** Called with the error when the text stops parsing, and `null` when it parses again. */
		onErrorChange?: (error: string | null) => void;
		/** Content after the text, such as a picker button. */
		trailing?: Snippet;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value,
		format,
		parse,
		same,
		onValueChange,
		onErrorChange,
		trailing,
		ref = $bindable(null),
		class: className,
		onblur,
		onkeydown,
		'aria-describedby': describedBy,
		...rest
	}: Props = $props();

	const id = $props.id();
	let text = $state('');
	let error = $state<string | null>(null);
	let showError = $state(false);
	// The value the text stands for; undefined until the first value arrives.
	let shown: T | null | undefined = undefined;

	// A value set from outside replaces the text; the values the field reports itself
	// already match it and leave the text as typed.
	$effect.pre(() => {
		const next = value;
		untrack(() => {
			if (shown !== undefined && same(next, shown)) return;
			shown = next;
			text = next === null ? '' : format(next);
		});
	});

	function onInput() {
		const result = parse(text);
		const nextError = 'error' in result ? result.error : null;
		if (nextError !== error) onErrorChange?.(nextError);
		error = nextError;
		if (nextError === null) {
			showError = false;
			const next = 'value' in result ? result.value : null;
			shown = next;
			if (!same(next, value)) onValueChange(next);
		}
	}

	/** Shows `next` in the field and reports it. */
	export function setValue(next: T) {
		text = format(next);
		onInput();
	}
</script>

<div class={['oito2-parsed-entry', className]}>
	<TextField
		bind:ref
		bind:value={text}
		invalid={showError && error !== null}
		{trailing}
		aria-describedby={[describedBy, showError && error ? `${id}-error` : undefined]
			.filter(Boolean)
			.join(' ') || undefined}
		oninput={onInput}
		onblur={(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			showError = true;
			onblur?.(event);
		}}
		onkeydown={(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			if (event.key === 'Enter') showError = true;
			onkeydown?.(event);
		}}
		{...rest}
	/>
	{#if showError && error}
		<span class="error" id="{id}-error">{error}</span>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-parsed-entry {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-xxs);
			min-width: 0;
		}

		.error {
			color: var(--oito2-color-error-text);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}
	}
</style>
