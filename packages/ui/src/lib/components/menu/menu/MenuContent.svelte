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
  The items of a menu, in a panel under the trigger (`placement` moves it). Choosing an
  item, Escape, Tab or a click outside closes it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../../../internal/floating.js';
	import MenuPanel from '../MenuPanel.svelte';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** Where the menu goes. Defaults to `bottom-start`. */
		placement?: Placement;
		/** The items. */
		children?: Snippet;
	}

	let { placement = 'bottom-start', children, ...rest }: Props = $props();

	const menu = useMenu();
</script>

<MenuPanel
	id="{menu.id}-content"
	aria-labelledby="{menu.id}-trigger"
	role="menu"
	open={menu.open}
	anchor={menu.trigger}
	{placement}
	initialFocus={menu.initialFocus}
	inside={() => [menu.trigger]}
	onDismiss={() => menu.hide()}
	onTab={() => menu.closeAll()}
	bind:ref={menu.content}
	{...rest}
>
	{@render children?.()}
</MenuPanel>
