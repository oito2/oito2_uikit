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
  A text field that suggests items of a `collection` as the user types: the enabled items
  whose label contains the text, ignoring case and accents, with the matches highlighted;
  with `showAllWhenEmpty` every item shows while the field is empty. The Up and Down
  arrows move the highlight, Enter picks it and Escape closes the list; screen readers
  hear how many suggestions there are. Without children it renders a `Combobox.Input`
  with a `Combobox.Trigger` and a `Combobox.Content`. Bind `inputValue` for the text;
  `onSelect` receives each picked item.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { ListCollection } from '../../../collections/list-collection.js';
	import { announce } from '../../../internal/live-region.js';
	import { useLocale } from '../../../l10n/locale.js';
	import { ComboboxState, setCombobox } from '../combobox-state.svelte.js';
	import ComboboxContent from './ComboboxContent.svelte';
	import ComboboxInput from './ComboboxInput.svelte';
	import ComboboxTrigger from './ComboboxTrigger.svelte';

	interface Props {
		/** The items to suggest. */
		collection: ListCollection<T>;
		/** The text in the input. */
		inputValue?: string;
		/** The text of an uncontrolled combobox. Defaults to the label of `defaultValue`. */
		defaultInputValue?: string;
		/** The value of the item whose label fills an uncontrolled field at start. */
		defaultValue?: string;
		/** Called whenever the text changes. */
		onInputValueChange?: (value: string) => void;
		/** Called with each picked item. */
		onSelect?: (item: T) => void;
		/** Whether every item is suggested while the field is empty. */
		showAllWhenEmpty?: boolean;
		/** Values never suggested, such as the tags already added. */
		exclude?: Iterable<string>;
		/** The hint of the default input. */
		placeholder?: string;
		/** The accessible name of the default input, when no `Field.Label` names it. */
		label?: string;
		/** Whether the combobox can't be used. */
		disabled?: boolean;
		/** The parts; defaults to an input with a trigger and the suggestion list. */
		children?: Snippet;
	}

	let {
		collection,
		inputValue = $bindable(),
		defaultInputValue,
		defaultValue,
		onInputValueChange,
		onSelect,
		showAllWhenEmpty = false,
		exclude,
		placeholder,
		label,
		disabled = false,
		children
	}: Props = $props();

	const id = $props.id();
	const locale = useLocale();
	const combobox = setCombobox(
		new ComboboxState<T>({
			id,
			collection: () => collection,
			inputValue: () => inputValue,
			defaultInputValue: () => {
				if (defaultInputValue !== undefined) return defaultInputValue;
				const item = collection.find(defaultValue);
				return item === undefined ? '' : collection.getLabel(item);
			},
			onInputChange: (next) => {
				inputValue = next;
				onInputValueChange?.(next);
			},
			onSelect: () => onSelect,
			showAllWhenEmpty: () => showAllWhenEmpty,
			exclude: () => exclude,
			disabled: () => disabled
		})
	);

	// Tells screen readers how many suggestions the text gives, once it settles.
	$effect(() => {
		if (!combobox.open || (!combobox.text.trim() && !showAllWhenEmpty)) return;
		const count = combobox.options.length;
		const timer = setTimeout(
			() =>
				announce(
					count === 0 ? locale.strings.noResults : locale.strings.resultCount(count)
				),
			300
		);
		return () => clearTimeout(timer);
	});
</script>

{#if children}
	{@render children()}
{:else}
	<ComboboxInput {placeholder} aria-label={label}>
		{#snippet trailing()}<ComboboxTrigger />{/snippet}
	</ComboboxInput>
	<ComboboxContent />
{/if}
