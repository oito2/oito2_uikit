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
  An option of a select: its `label`, or custom `children`, with a check mark when it is
  the chosen one. Choosing it selects its value and closes the list.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { focusElement } from '../../../internal/focus.js';
	import MenuItemBase from '../../menu/MenuItemBase.svelte';
	import { useSelect } from '../select-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** The value the option stands for. */
		value: string;
		/** The text of the option, shown in the trigger when it is chosen. */
		label?: string;
		/** Whether the option can't be chosen. */
		disabled?: boolean;
		/** Custom content instead of `label`. */
		children?: Snippet;
	}

	let { value, label, children, ...rest }: Props = $props();

	const select = useSelect();
	let selected = $derived(select.value === value);

	function register(node: HTMLElement) {
		const text = label ?? node.textContent?.trim() ?? value;
		select.labels.set(value, text);
	}
</script>

{#snippet leading()}{#if selected}<Check size={20} aria-hidden="true" />{/if}{/snippet}

<MenuItemBase
	role="option"
	aria-selected={selected}
	inset
	{leading}
	textValue={label}
	onActivate={() => {
		select.select(value);
		select.open = false;
		focusElement(select.trigger);
	}}
	{@attach register}
	{...rest}
>
	{#if children}{@render children()}{:else}{label ?? value}{/if}
</MenuItemBase>
