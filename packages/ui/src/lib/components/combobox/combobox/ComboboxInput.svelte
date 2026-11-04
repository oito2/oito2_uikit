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
  The text input of a `Combobox.Root`, in a text field box with optional `leading` and
  `trailing` content (usually a `Combobox.Trigger`). With `bare` it is a plain input for
  custom fields, such as the input of a tags field; the list then goes under the closest
  ancestor marked `data-oito2-combobox-anchor`, or under the input. Inside a `Field.Root` it takes the
  field's label and states.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import TextField from '../../field/TextField.svelte';
	import { useCombobox } from '../combobox-state.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value'> {
		/** Content before the text. */
		leading?: Snippet;
		/** Content after the text, usually a `Combobox.Trigger`. */
		trailing?: Snippet;
		/** Whether to render only the input, without the field box. */
		bare?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		leading,
		trailing,
		bare = false,
		disabled,
		ref = $bindable(null),
		onkeydown,
		oninput,
		onblur,
		onfocus,
		...rest
	}: Props = $props();

	const combobox = useCombobox();
	let off = $derived(disabled ?? combobox.disabled);

	$effect(() => {
		combobox.input = ref;
	});

	let inputProps: Record<string, unknown> = $derived({
		role: 'combobox',
		autocomplete: 'off',
		'aria-autocomplete': 'list' as const,
		'aria-expanded': combobox.showsList,
		'aria-controls': combobox.showsList ? combobox.listId : undefined,
		'aria-activedescendant':
			combobox.showsList && combobox.highlighted !== null
				? combobox.optionId(combobox.highlighted)
				: undefined
	});

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		combobox.text = event.currentTarget.value;
		combobox.open = true;
		combobox.highlighted = null;
		oninput?.(event);
	}

	/** Handles the list keys first; the other keys go to `onkeydown`. */
	function handleKey(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (!listKey(event)) onkeydown?.(event);
	}

	/** Moves the highlight, picks it or closes the list; returns whether it handled the key. */
	function listKey(event: KeyboardEvent): boolean {
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return false;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!combobox.open) combobox.open = true;
			combobox.move(event.key === 'ArrowDown' ? 1 : -1);
		} else if (event.key === 'Enter' && combobox.showsList && combobox.highlighted !== null) {
			event.preventDefault();
			combobox.pick(combobox.highlighted);
		} else if (event.key === 'Escape' && combobox.open) {
			event.preventDefault();
			combobox.open = false;
			combobox.highlighted = null;
		} else return false;
		return true;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event);
		const next = event.relatedTarget as Node | null;
		if (!combobox.list?.contains(next)) combobox.open = false;
	}
</script>

{#if bare}
	<input
		bind:this={ref}
		value={combobox.text}
		disabled={off}
		class="oito2-combobox-bare"
		{@attach (node) =>
			void (combobox.anchor =
				node.closest<HTMLElement>('[data-oito2-combobox-anchor]') ?? node)}
		{...inputProps}
		oninput={handleInput}
		onkeydown={handleKey}
		onblur={handleBlur}
		{onfocus}
		{...rest}
	/>
{:else}
	<div class="oito2-combobox-field" {@attach (node) => void (combobox.anchor = node)}>
		<TextField
			bind:ref
			value={combobox.text}
			disabled={off}
			{leading}
			{trailing}
			{...inputProps}
			oninput={handleInput}
			onkeydown={handleKey}
			onblur={handleBlur}
			{onfocus}
			{...rest}
		/>
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-combobox-field {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}
	}
</style>
