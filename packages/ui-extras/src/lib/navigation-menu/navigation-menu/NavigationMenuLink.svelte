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
  A navigation menu item that goes somewhere: a link to `href`, marked as the current page
  when its item is the menu's `current` one.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { useNavigationMenu, useNavigationMenuItem } from '../navigation-menu-state.svelte.js';

	interface Props extends Omit<HTMLAnchorAttributes, 'children'> {
		/** The label. */
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const menu = useNavigationMenu();
	const value = useNavigationMenuItem();
	let current = $derived(menu.current === value());
</script>

<a
	class={['oito2-navigation-menu-link', className]}
	aria-current={current ? 'page' : undefined}
	onpointerenter={(event) => {
		if (event.pointerType === 'mouse' && menu.open !== null) menu.leave();
	}}
	{...rest}
>
	{@render children()}
</a>

<style>
	@layer oito2 {
		.oito2-navigation-menu-link {
			display: inline-flex;
			align-items: center;
			height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-md);
			border-radius: var(--oito2-radius-medium);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			text-decoration: none;
		}

		.oito2-navigation-menu-link:hover {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 8%, transparent);
		}

		.oito2-navigation-menu-link:focus-visible {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
		}

		[aria-current='page'] {
			color: var(--oito2-color-primary-text);
		}
	}
</style>
