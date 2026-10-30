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
  An item of a `Menu.RadioGroup`: a check mark shows on the checked one. Choosing it
  checks it and closes the menu.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuItemBase from '../MenuItemBase.svelte';
	import { useMenuRadio } from '../menu-radio.svelte.js';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** The value the item stands for. */
		value: string;
		/** Whether the menu closes when the item is chosen. Defaults to true. */
		closeOnSelect?: boolean;
		/** Whether the item can't be chosen. */
		disabled?: boolean;
		/** The text typeahead matches. Defaults to the label. */
		textValue?: string;
		/** The label. */
		children?: Snippet;
	}

	let { value, closeOnSelect = true, children, ...rest }: Props = $props();

	const menu = useMenu();
	const group = useMenuRadio();
	let checked = $derived(group.value === value);
</script>

{#snippet leading()}{#if checked}<Check size={20} aria-hidden="true" />{/if}{/snippet}

<MenuItemBase
	role="menuitemradio"
	aria-checked={checked}
	inset
	{leading}
	onHover={() => menu.openSub?.hide()}
	onActivate={() => {
		group.select(value);
		if (closeOnSelect) menu.closeAll();
	}}
	{...rest}
>
	{@render children?.()}
</MenuItemBase>
