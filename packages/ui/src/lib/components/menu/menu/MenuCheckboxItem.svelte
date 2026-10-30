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
  A menu item with a check box that toggles a setting; the menu stays open so several can
  be toggled. Bind `checked`, or listen to `onCheckedChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import CheckboxMark from '../../toggles/CheckboxMark.svelte';
	import MenuItemBase from '../MenuItemBase.svelte';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** Whether the item is checked. */
		checked?: boolean;
		/** Called with each new state. */
		onCheckedChange?: (checked: boolean) => void;
		/** Whether the menu closes when the item is toggled. Defaults to false. */
		closeOnSelect?: boolean;
		/** Whether the item can't be toggled. */
		disabled?: boolean;
		/** Content after the label, usually a `Menu.Shortcut`. */
		shortcut?: Snippet;
		/** The text typeahead matches. Defaults to the label. */
		textValue?: string;
		/** The label. */
		children?: Snippet;
	}

	let {
		checked = $bindable(false),
		onCheckedChange,
		closeOnSelect = false,
		shortcut,
		children,
		...rest
	}: Props = $props();

	const menu = useMenu();
</script>

{#snippet leading()}<CheckboxMark {checked} />{/snippet}

<MenuItemBase
	role="menuitemcheckbox"
	aria-checked={checked}
	class="oito2-toggle-host"
	{leading}
	trailing={shortcut}
	onHover={() => menu.openSub?.hide()}
	onActivate={() => {
		checked = !checked;
		onCheckedChange?.(checked);
		if (closeOnSelect) menu.closeAll();
	}}
	{...rest}
>
	{@render children?.()}
</MenuItemBase>
