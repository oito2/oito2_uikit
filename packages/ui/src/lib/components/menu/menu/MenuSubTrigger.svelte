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
  The item that opens a submenu, with a chevron at its end.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf } from '../../../internal/keyboard.js';
	import type { IconComponent } from '../../icon.js';
	import MenuItemBase from '../MenuItemBase.svelte';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** Whether the submenu can't open. */
		disabled?: boolean;
		/** An icon before the label. */
		icon?: IconComponent;
		/** Reserves the icon space without an icon. */
		inset?: boolean;
		/** The text typeahead matches. Defaults to the label. */
		textValue?: string;
		/** The label. */
		children?: Snippet;
	}

	let { icon: Icon, children, ...rest }: Props = $props();

	const sub = useMenu();
	let rtl = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function attach(node: HTMLDivElement) {
		sub.trigger = node;
		rtl = directionOf(node) === 'rtl';
		return () => {
			clearTimeout(timer);
			if (sub.trigger === node) sub.trigger = null;
		};
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
			event.preventDefault();
			sub.show('first');
		}
	}
</script>

{#snippet leading()}{#if Icon}<Icon size={20} aria-hidden="true" />{/if}{/snippet}
{#snippet chevron()}
	{#if rtl}<ChevronLeft size={20} aria-hidden="true" />{:else}<ChevronRight
			size={20}
			aria-hidden="true"
		/>{/if}
{/snippet}

<MenuItemBase
	role="menuitem"
	aria-haspopup="menu"
	aria-expanded={sub.open}
	aria-controls={sub.open ? `${sub.id}-content` : undefined}
	id="{sub.id}-trigger"
	data-state={sub.open ? 'open' : 'closed'}
	leading={Icon ? leading : undefined}
	trailing={chevron}
	onHover={() => {
		clearTimeout(timer);
		if (!sub.open) timer = setTimeout(() => sub.show('none'), 100);
	}}
	onActivate={() => sub.show('first')}
	onpointerleave={() => clearTimeout(timer)}
	{onkeydown}
	{@attach attach}
	{...rest}
>
	{@render children?.()}
</MenuItemBase>
