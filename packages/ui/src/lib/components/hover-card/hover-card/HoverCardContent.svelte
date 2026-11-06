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
  The card of a hover card, next to the trigger (below it, centered, by default) with an
  arrow. Moving the pointer onto it keeps it open.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PopoverAlignment, PopoverPlacement } from '../../popover/popover-state.svelte.js';
	import { mergeProps } from '../../../internal/merge-props.js';
	import * as Popover from '../../popover/popover/index.js';
	import { useHoverCard } from '../hover-card-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The preferred side of the trigger. Defaults to `bottom`. */
		placement?: PopoverPlacement;
		/** The alignment along the trigger's edge. Defaults to `center`. */
		alignment?: PopoverAlignment;
		/** Whether the card points at the trigger with an arrow. Defaults to true. */
		arrow?: boolean;
		/** The largest card width, in pixels. Defaults to 320. */
		maxWidth?: number;
		/** The content. */
		children: Snippet;
	}

	let {
		placement = 'bottom',
		alignment = 'center',
		arrow = true,
		maxWidth = 320,
		children,
		...rest
	}: Props = $props();

	const card = useHoverCard();
</script>

<Popover.Content
	{placement}
	{alignment}
	{maxWidth}
	focusOnOpen={false}
	role="tooltip"
	{...mergeProps(rest, {
		onpointerenter: () => card.cancel(),
		onpointerleave: () => card.schedule(false)
	})}
>
	{#if arrow}<Popover.Arrow />{/if}
	{@render children()}
</Popover.Content>
