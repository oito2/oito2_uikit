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
  the clear button label follow the active locale. Bind `value`, or set `defaultValue`
  and listen to `onValueChange`.
-->
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import TextField from '../field/TextField.svelte';
	import type { IconComponent } from '../icon.js';

	interface Props extends Omit<
		HTMLInputAttributes,
		'children' | 'value' | 'defaultValue' | 'type'
	> {
		/** The text. */
		value?: string;
		/** The text of an uncontrolled field at first. Defaults to empty. */
		defaultValue?: string;
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
		value = $bindable(),
		defaultValue = '',
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

	const model = new Controllable<string>({
		value: () => value,
		defaultValue: () => defaultValue,
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		}
	});

	const locale = useLocale();
	let strings = $derived(locale.strings);

	/** Empties the field, reports it and keeps the focus in the field. */
	function clear() {
		model.current = '';
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
	bind:value={() => model.current, (next) => (model.current = String(next ?? ''))}
	type="search"
	enterkeyhint="search"
	placeholder={placeholder ?? strings.searchField}
	{oninput}
	onkeydown={(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			if (model.current) clear();
			else onEscape?.();
		} else if (event.key === 'Enter') onSubmit?.(model.current);
	}}
	class="oito2-search-field"
	leading={searchIcon}
	trailing={model.current ? clearButton : undefined}
	{...rest}
/>

<style>
	@layer oito2 {
		:global(.oito2-search-field input::-webkit-search-cancel-button) {
			appearance: none;
		}
	}
</style>
