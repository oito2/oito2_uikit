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
  A search text field with a search icon and a clear button that shows while it has text.
  Escape clears the text; Escape again on the empty field calls `onEscape`. The hint and
  the clear button label follow the active locale.
-->
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { materialStrings } from '../../l10n/material.js';
	import IconButton from '../button/IconButton.svelte';
	import TextField from '../field/TextField.svelte';
	import type { IconComponent } from '../icon.js';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value' | 'type'> {
		/** The text. */
		value?: string;
		/** Called whenever the text changes. */
		onValueChange?: (value: string) => void;
		/** Called with the text when the user presses Enter. */
		onSubmit?: (value: string) => void;
		/** Called after the clear button or Escape empties the field. */
		onClear?: () => void;
		/** Called when Escape is pressed on the empty field. */
		onEscape?: () => void;
		/** Replaces the search icon before the text. */
		icon?: Snippet;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(''),
		onValueChange,
		onSubmit,
		onClear,
		onEscape,
		icon,
		placeholder,
		ref = $bindable(null),
		onkeydown,
		oninput,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let strings = $derived(materialStrings(locale.locale));

	/** Empties the field, reports it and keeps the focus in the field. */
	function clear() {
		value = '';
		onValueChange?.('');
		onClear?.();
		ref?.focus();
	}
</script>

{#snippet searchIcon()}
	{#if icon}{@render icon()}{:else}<Search size={18} aria-hidden="true" />{/if}
{/snippet}

{#snippet clearButton()}
	<IconButton
		class="oito2-field-button"
		icon={X as IconComponent}
		label={strings.clearText}
		onclick={clear}
	/>
{/snippet}

<TextField
	bind:ref
	bind:value
	type="search"
	enterkeyhint="search"
	placeholder={placeholder ?? strings.searchField}
	oninput={(event) => {
		oninput?.(event);
		onValueChange?.(value);
	}}
	onkeydown={(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			if (value) clear();
			else onEscape?.();
		} else if (event.key === 'Enter') onSubmit?.(value);
	}}
	class="oito2-search-field"
	leading={searchIcon}
	trailing={value ? clearButton : undefined}
	{...rest}
/>

<style>
	@layer oito2 {
		:global(.oito2-search-field input::-webkit-search-cancel-button) {
			appearance: none;
		}
	}
</style>
