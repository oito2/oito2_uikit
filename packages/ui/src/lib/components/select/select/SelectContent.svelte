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
  The list of options of a select, in a panel under its trigger, as wide as it. The chosen
  option takes focus when it opens. Without `children` it renders the options of the
  root's `collection`, grouped.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { focusElement } from '../../../internal/focus.js';
	import type { Placement } from '../../../internal/floating.js';
	import MenuPanel from '../../menu/MenuPanel.svelte';
	import { useSelect } from '../select-state.svelte.js';
	import SelectGroup from './SelectGroup.svelte';
	import SelectItem from './SelectItem.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** Where the list goes. Defaults to `bottom-start`. */
		placement?: Placement;
		/** The options. */
		children?: Snippet;
	}

	let { placement = 'bottom-start', children, ...rest }: Props = $props();

	const select = useSelect();

	/** Closes the list and returns focus to the trigger. */
	function close() {
		select.open = false;
		focusElement(select.trigger);
	}
</script>

<MenuPanel
	id="{select.id}-content"
	aria-labelledby={select.triggerId || undefined}
	role="listbox"
	open={select.open}
	anchor={select.trigger}
	{placement}
	sameWidth
	initialFocus={select.initialFocus}
	preferred={() => select.content?.querySelector<HTMLElement>('[aria-selected="true"]')}
	inside={() => [select.trigger]}
	onDismiss={(reason) => (reason === 'escape' ? close() : (select.open = false))}
	onTab={() => (select.open = false)}
	bind:ref={select.content}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else if select.collection}
		{@const collection = select.collection}
		{#each collection.groups as group, index (group.group ?? index)}
			{#snippet items()}
				{#each group.items as item (collection.getValue(item))}
					<SelectItem
						value={collection.getValue(item)}
						label={collection.getLabel(item)}
						disabled={collection.isDisabled(item)}
					/>
				{/each}
			{/snippet}
			{#if group.group}
				<SelectGroup label={group.group}>{@render items()}</SelectGroup>
			{:else}
				{@render items()}
			{/if}
		{/each}
	{/if}
</MenuPanel>
