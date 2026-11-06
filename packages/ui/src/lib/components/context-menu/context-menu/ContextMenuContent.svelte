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
  The items of a context menu, in a panel at the point where it opened. Choosing an item,
  Escape, Tab or a click outside closes it, and focus goes back where it was.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuPanel from '../../menu/MenuPanel.svelte';
	import { useMenu } from '../../menu/menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** The items. */
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const menu = useMenu();
</script>

<MenuPanel
	id="{menu.id}-content"
	role="menu"
	open={menu.open}
	anchor={menu.trigger}
	placement="bottom-start"
	offset={2}
	initialFocus={menu.initialFocus}
	onDismiss={() => menu.hide()}
	onTab={() => menu.closeAll()}
	returnFocus={() => menu.focusReturn}
	bind:ref={menu.content}
	{...rest}
>
	{@render children?.()}
</MenuPanel>
