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
  A website-style header menu: links and triggers in a row (`NavigationMenu.List` of
  `NavigationMenu.Item`s), a line that slides under the `current` item
  (`NavigationMenu.Indicator`) and flyout panels below the triggers
  (`NavigationMenu.Content`).

  A panel opens on hover after `hoverDelay`, or when its trigger is clicked or gets the Down
  arrow, which also move the focus into it; moving the pointer to another trigger switches
  panels at once. Tab moves between the items and Escape closes a panel. Bind `value` for
  the open item.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { NavigationMenuState, setNavigationMenu } from '../navigation-menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The value of the item whose panel is open, or `null`. */
		value?: string | null;
		/** The open item of an uncontrolled menu at first. Defaults to none. */
		defaultValue?: string | null;
		/** Called when the open item changes. */
		onValueChange?: (value: string | null) => void;
		/** The value of the item that marks the current page. */
		current?: string | null;
		/** The wait in milliseconds before a hovered trigger opens its panel. Defaults to 150. */
		hoverDelay?: number;
		/** The largest panel width in pixels. Defaults to 560. */
		panelMaxWidth?: number;
		/** The list and the indicator. */
		children: Snippet;
		/** The element. */
		ref?: HTMLElement | null;
	}

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		current = null,
		hoverDelay = 150,
		panelMaxWidth = 560,
		children,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const menu = setNavigationMenu(
		new NavigationMenuState({
			value: () => value,
			defaultValue: untrack(() => defaultValue),
			onValueChange: (next) => {
				if (value !== undefined) value = next;
				onValueChange?.(next);
			},
			current: () => current,
			hoverDelay: () => hoverDelay,
			panelMaxWidth: () => panelMaxWidth
		})
	);

	$effect(() => () => menu.cancel());
</script>

<nav bind:this={ref} class={['oito2-navigation-menu', className]} {...rest}>
	{@render children()}
</nav>

<style>
	@layer oito2 {
		.oito2-navigation-menu {
			position: relative;
			display: inline-flex;
			max-width: 100%;
		}
	}
</style>
