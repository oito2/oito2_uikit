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
  The items of a submenu, in a panel beside its trigger. The left arrow (right in
  right-to-left layouts) and Escape close it and return to the trigger.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { focusElement } from '../../../internal/focus.js';
	import MenuPanel from '../MenuPanel.svelte';
	import { useMenu } from '../menu-state.svelte.js';

	let {
		children,
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
		children?: Snippet;
	} = $props();

	const sub = useMenu();
	let rtl = $derived(sub.trigger ? getComputedStyle(sub.trigger).direction === 'rtl' : false);

	/** Closes the submenu and focuses its trigger. */
	function back() {
		sub.hide();
		focusElement(sub.trigger);
	}
</script>

<MenuPanel
	id="{sub.id}-content"
	aria-labelledby="{sub.id}-trigger"
	role="menu"
	open={sub.open}
	anchor={sub.trigger}
	placement={rtl ? 'left-start' : 'right-start'}
	offset={0}
	initialFocus={sub.initialFocus}
	inside={() => [sub.trigger]}
	onDismiss={(reason, event) => {
		const target = event.target as Node | null;
		const inParent = target && sub.parent?.content?.contains(target);
		if (reason === 'escape') back();
		else if (inParent) sub.hide();
		else sub.closeAll();
	}}
	onTab={() => sub.closeAll()}
	onkeydown={(event: KeyboardEvent) => {
		if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
			event.preventDefault();
			event.stopPropagation();
			back();
		}
	}}
	bind:ref={sub.content}
	{...rest}
>
	{@render children?.()}
</MenuPanel>
