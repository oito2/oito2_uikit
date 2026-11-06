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
  The element a hover card describes, such as a link or a user name; its children are
  wrapped in an inline element that watches the pointer, focus and long presses. While
  the card is open, it describes the first focusable element inside.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { addDescribedBy } from '../../../internal/described-by.js';
	import { longPress } from '../../../internal/long-press.js';
	import { mergeProps } from '../../../internal/merge-props.js';
	import { usePopover } from '../../popover/popover-state.svelte.js';
	import { useHoverCard } from '../hover-card-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The content. */
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const popover = usePopover();
	const card = useHoverCard();
</script>

<span
	class={['oito2-hover-card-trigger', className]}
	{@attach (node) => {
		popover.trigger = node;
		return () => {
			if (popover.trigger === node) popover.trigger = null;
		};
	}}
	{@attach (node) => {
		// The focusable element inside, such as a link, is described by the open card.
		const target =
			node.querySelector<HTMLElement>('a[href], button, input, [tabindex]') ?? node;
		if (!popover.open) return;
		return addDescribedBy(target, `${popover.id}-content`);
	}}
	{@attach longPress(() => card.openNow())}
	{...mergeProps(rest, {
		onpointerenter: (event: PointerEvent) => {
			if (event.pointerType === 'mouse') card.schedule(true);
		},
		onpointerleave: (event: PointerEvent) => {
			if (event.pointerType === 'mouse') card.schedule(false);
		},
		onfocusin: () => card.schedule(true),
		onfocusout: () => card.schedule(false)
	})}
>
	{@render children()}
</span>

<style>
	@layer oito2 {
		.oito2-hover-card-trigger {
			display: inline-flex;
		}
	}
</style>
