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
  An entry of a navigation menu, identified by `value`: a `NavigationMenu.Link`, or a
  `NavigationMenu.Trigger` with its `NavigationMenu.Content`.
-->
<script lang="ts">
	import { Popover } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { setNavigationMenuItem, useNavigationMenu } from '../navigation-menu-state.svelte.js';

	interface Props extends Omit<HTMLLiAttributes, 'children' | 'value'> {
		/** The value of the item, unique in the menu. */
		value: string;
		/** A link, or a trigger and its content. */
		children: Snippet;
	}

	let { value, children, class: className, ...rest }: Props = $props();

	const menu = useNavigationMenu();
	setNavigationMenuItem(() => value);
</script>

<li
	class={['oito2-navigation-menu-item', className]}
	{@attach (node) => {
		const key = value;
		menu.items.set(key, node);
		return () => {
			if (menu.items.get(key) === node) menu.items.delete(key);
		};
	}}
	{...rest}
>
	<Popover.Root
		open={menu.open === value}
		onOpenChange={(open) => {
			if (open) menu.show(value, menu.keyboard);
			else if (menu.open === value) menu.show(null);
		}}
	>
		{@render children()}
	</Popover.Root>
</li>

<style>
	@layer oito2 {
		.oito2-navigation-menu-item {
			display: flex;
		}
	}
</style>
