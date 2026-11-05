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
  A row of a list box, identified by `value` in the list's collection. A click selects it
  with the desktop conventions and a double click calls the list's `onActivate`. The
  children replace `label`; a multiple-selection list adds a check mark to selected rows.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useListBox } from '../list-box-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the item in the collection. */
		value: string;
		/** The text shown when there are no children. */
		label?: string;
		/** Custom content. */
		children?: Snippet;
	}

	let { value, label, children, class: className, ...rest }: Props = $props();

	const list = useListBox();
	let disabled = $derived(!list.collection.isEnabled(value));
	let selected = $derived(list.controller.isSelected(value));
	let text = $derived.by(() => {
		if (label !== undefined) return label;
		const item = list.collection.find(value);
		return item === undefined ? value : list.collection.getLabel(item);
	});
</script>

<div
	id={list.optionId(value)}
	role="option"
	aria-selected={selected}
	aria-disabled={disabled || undefined}
	class={['oito2-list-box-item', className]}
	data-selected={selected ? '' : undefined}
	data-active={list.focused && list.active === value ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	onclick={(event) => list.click(value, event)}
	ondblclick={() => list.activateItem(value)}
	{...rest}
>
	<span class="oito2-list-box-item-content">
		{#if children}{@render children()}{:else}{text}{/if}
	</span>
	{#if list.multiple}
		<span class="oito2-list-box-item-check" aria-hidden="true"><Check /></span>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-list-box-item {
			display: flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			min-height: 32px;
			padding: var(--oito2-space-xs) var(--oito2-space-sm);
			border-radius: var(--oito2-radius-small);
			cursor: pointer;
			user-select: none;
			--oito2-icon-size: 16px;
		}

		.oito2-list-box-item:hover:not([data-selected], [data-disabled]) {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 6%, transparent);
		}

		.oito2-list-box-item[data-selected] {
			background: var(--oito2-color-selected-fill);
			color: var(--oito2-color-on-selected-fill);
		}

		.oito2-list-box-item[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		:global(.oito2-list-box[data-keyboard]) .oito2-list-box-item[data-active] {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
		}

		.oito2-list-box-item-content {
			flex: 1;
			min-width: 0;
		}

		.oito2-list-box-item-check {
			display: inline-flex;
			flex: none;
			opacity: 0;
		}

		.oito2-list-box-item-check :global(svg) {
			width: 16px;
			height: 16px;
		}

		[data-selected] > .oito2-list-box-item-check {
			opacity: 1;
		}
	}
</style>
