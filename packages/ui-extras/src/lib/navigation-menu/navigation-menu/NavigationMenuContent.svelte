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
  The flyout panel of a navigation menu item, below its trigger. It stays open while the
  pointer is over it, and takes the focus when it was opened from the keyboard or a click.
  It is a `group`, part of the page's navigation rather than a dialog.
-->
<script lang="ts">
	import { Popover } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useNavigationMenu } from '../navigation-menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The panel content, such as a grid of links. */
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const menu = useNavigationMenu();
</script>

<Popover.Content
	placement="bottom"
	alignment="start"
	maxWidth={menu.panelMaxWidth}
	focusOnOpen={menu.keyboard}
	role="group"
	class={['oito2-navigation-menu-content', className].filter(Boolean).join(' ')}
	onpointerenter={(event: PointerEvent) => {
		if (event.pointerType === 'mouse') menu.cancel();
	}}
	onpointerleave={(event: PointerEvent) => {
		if (event.pointerType === 'mouse') menu.leave();
	}}
	{...rest}
>
	{@render children()}
</Popover.Content>

<style>
	@layer oito2 {
		:global(.oito2-navigation-menu-content) {
			padding: var(--oito2-space-lg);
		}
	}
</style>
