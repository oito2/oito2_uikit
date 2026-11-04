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
  A menu that opens over a `ContextMenu.Trigger` on a secondary click, a long press,
  Shift+F10 or the menu key. Its `ContextMenu.Content` holds the items of `Menu`
  (`Menu.Item`, `Menu.CheckboxItem`, `Menu.Sub`…). It opens where the pointer is, or over
  the middle of the trigger from the keyboard, with the first item focused.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MenuState, setMenu } from '../../menu/menu-state.svelte.js';

	interface Props {
		/** Whether the menu is open. */
		open?: boolean;
		/** Called when the menu opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The trigger and the content. */
		children: Snippet;
	}

	let { open = $bindable(), onOpenChange, children }: Props = $props();

	const id = $props.id();
	setMenu(
		new MenuState({
			open: () => open,
			onOpenChange: (next) => {
				open = next;
				onOpenChange?.(next);
			},
			id
		})
	);
</script>

{@render children()}
