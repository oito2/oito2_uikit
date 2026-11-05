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
  A list of the items of `collection` that the user selects from, with the selection kept
  in `controller` (or in a controller of its own, made from `mode` and `defaultValues`).

  The list takes the focus as a whole and marks its active row. The arrow keys, Home and
  End move the active row, which a single-selection list also selects. In a
  multiple-selection list Space toggles the active row, Shift with the arrows extends the
  selection and Control (Command on Apple platforms) with A selects all; clicks follow the
  desktop conventions of `SelectionController.click`. Typing letters jumps to the next
  matching label. Enter or a double click calls `onActivate`. Disabled items can't be
  selected or activated.

  Without children it renders every item, under its group heading when grouped, with
  `item` as the content of each row, and `empty` when there are no items. Every row is
  rendered, so it suits lists of up to a few hundred items; use `TreeView` for more.
-->
<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ListCollection } from '../../../collections/list-collection.js';
	import {
		SelectionController,
		type SelectionMode
	} from '../../../collections/selection-controller.svelte.js';
	import { ListBoxState, setListBox } from '../list-box-state.svelte.js';
	import ListBoxEmpty from './ListBoxEmpty.svelte';
	import ListBoxGroup from './ListBoxGroup.svelte';
	import ListBoxItem from './ListBoxItem.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The items. */
		collection: ListCollection<T>;
		/** The selection over `collection`; the list keeps its own when left out. */
		controller?: SelectionController<T>;
		/** How many items the list's own controller selects. Defaults to `single`. */
		mode?: SelectionMode;
		/** The values the list's own controller selects at first. */
		defaultValues?: Iterable<string>;
		/** Called with the selected values, in collection order, whenever they change. */
		onValuesChange?: (values: readonly string[]) => void;
		/** Called on Enter or a double click on an enabled item. */
		onActivate?: (item: T) => void;
		/** The content of a row of the default rendering, given the item and whether it is selected. */
		item?: Snippet<[T, boolean]>;
		/** What the default rendering shows when there are no items. */
		empty?: Snippet;
		/** The parts: `ListBox.Item`, `ListBox.Group`, `ListBox.Empty`. */
		children?: Snippet;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		collection,
		controller: controllerProp,
		mode = 'single',
		defaultValues,
		onValuesChange,
		onActivate,
		item,
		empty,
		children,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	// The list's own controller starts from the first collection and follows it below.
	const ownController = untrack(
		() => new SelectionController<T>(collection, { mode, initialValues: defaultValues })
	);
	let controller = $derived(controllerProp ?? ownController);

	// Keeps the list's own controller on the current collection.
	$effect(() => {
		if (!controllerProp && ownController.collection !== collection)
			ownController.collection = collection;
	});

	// Reports selection changes after the first render.
	let reported: readonly string[] | null = null;
	$effect(() => {
		const values = controller.selectedValues;
		if (reported !== null && reported !== values) onValuesChange?.(values);
		reported = values;
	});

	const list = setListBox(
		new ListBoxState<T>({
			id,
			collection: () => collection,
			controller: () => controller,
			onActivate: () => onActivate
		})
	);
</script>

<div
	bind:this={ref}
	role="listbox"
	tabindex="0"
	aria-multiselectable={list.multiple || undefined}
	aria-activedescendant={list.focused && list.active !== null && collection.has(list.active)
		? list.optionId(list.active)
		: undefined}
	class={['oito2-list-box', className]}
	data-keyboard={list.keyboard ? '' : undefined}
	onkeydown={(event) => {
		if (list.keydown(event)) event.preventDefault();
	}}
	onfocus={() => list.focus()}
	onblur={() => (list.focused = false)}
	onpointerdown={() => (list.keyboard = false)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else if collection.isEmpty}
		{#if empty}<ListBoxEmpty>{@render empty()}</ListBoxEmpty>{/if}
	{:else}
		{#each collection.groups as group, index (group.group ?? `#${index}`)}
			{#if group.group !== null}
				<ListBoxGroup label={group.group}>
					{#each group.items as entry (collection.getValue(entry))}
						{@render row(entry)}
					{/each}
				</ListBoxGroup>
			{:else}
				{#each group.items as entry (collection.getValue(entry))}
					{@render row(entry)}
				{/each}
			{/if}
		{/each}
	{/if}
</div>

{#snippet row(entry: T)}
	{@const value = collection.getValue(entry)}
	{#if item}
		<ListBoxItem {value} label={collection.getLabel(entry)}>
			{@render item(entry, controller.isSelected(value))}
		</ListBoxItem>
	{:else}
		<ListBoxItem {value} label={collection.getLabel(entry)} />
	{/if}
{/snippet}

<style>
	@layer oito2 {
		.oito2-list-box {
			display: flex;
			flex-direction: column;
			gap: 2px;
			box-sizing: border-box;
			overflow: auto;
			padding: var(--oito2-space-xs);
			outline: none;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}
	}
</style>
