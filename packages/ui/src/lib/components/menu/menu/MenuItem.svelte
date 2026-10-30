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
  An action of a menu, with an optional leading `icon` and a trailing `shortcut`.
  Choosing it calls `onSelect` and closes the menu, unless `onSelect` calls
  `preventDefault()` on its event.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { IconComponent } from '../../icon.js';
	import MenuItemBase from '../MenuItemBase.svelte';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** Called when the item is chosen; \`event.preventDefault()\` keeps the menu open. */
		onSelect?: (event: Event) => void;
		/** Whether the item can't be chosen. */
		disabled?: boolean;
		/** An icon before the label. */
		icon?: IconComponent;
		/** Reserves the icon space without an icon, to align with items that have one. */
		inset?: boolean;
		/** Content after the label, usually a `Menu.Shortcut`. */
		shortcut?: Snippet;
		/** The text typeahead matches. Defaults to the label. */
		textValue?: string;
		/** The label. */
		children?: Snippet;
	}

	let { onSelect, icon: Icon, shortcut, children, ...rest }: Props = $props();

	const menu = useMenu();
</script>

{#snippet leading()}{#if Icon}<Icon size={20} aria-hidden="true" />{/if}{/snippet}

<MenuItemBase
	role="menuitem"
	leading={Icon ? leading : undefined}
	trailing={shortcut}
	onHover={() => menu.openSub?.hide()}
	onActivate={() => {
		const event = new Event('select', { cancelable: true });
		onSelect?.(event);
		if (!event.defaultPrevented) menu.closeAll();
	}}
	{...rest}
>
	{@render children?.()}
</MenuItemBase>
