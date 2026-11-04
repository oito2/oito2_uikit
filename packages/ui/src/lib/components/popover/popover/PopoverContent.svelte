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
  The panel of a popover, over the page next to its anchor, in the surface container color
  with an outline and a shadow. It opens on the `placement` side (`start` and `end` follow
  the text direction), moves to the other side when it doesn't fit and lines up by
  `alignment`. With `focusOnOpen` its first focusable element takes focus when it opens;
  when it closes with focus inside, focus returns to where it was. Escape closes it, and
  so does a click outside unless `closeOnOutsideClick` is false.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../../internal/Portal.svelte';
	import { dismissableLayer } from '../../../internal/dismissable-layer.js';
	import { floating } from '../../../internal/floating.js';
	import { focusScope } from '../../../internal/focus-scope.js';
	import { directionOf } from '../../../internal/keyboard.js';
	import { Presence } from '../../../internal/presence.svelte.js';
	import {
		popoverPlacement,
		usePopover,
		type PopoverAlignment,
		type PopoverPlacement
	} from '../popover-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The preferred side of the anchor. Defaults to `bottom`. */
		placement?: PopoverPlacement;
		/** The alignment along the anchor's edge. Defaults to `start`. */
		alignment?: PopoverAlignment;
		/** The gap to the anchor, or to the arrow tip, in pixels. Defaults to 4. */
		offset?: number;
		/** Whether a panel above or below takes the anchor's width. */
		matchAnchorWidth?: boolean;
		/** The largest panel width, in pixels. Defaults to 360. */
		maxWidth?: number;
		/** Whether the panel takes focus when it opens. Defaults to true. */
		focusOnOpen?: boolean;
		/** Whether a click outside the anchor and the panel closes it. Defaults to true. */
		closeOnOutsideClick?: boolean;
		/** Whether the panel has no padding, for content that sets its own. */
		flush?: boolean;
		/** The panel element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		placement = 'bottom',
		alignment = 'start',
		offset = 4,
		matchAnchorWidth = false,
		maxWidth = 360,
		focusOnOpen = true,
		closeOnOutsideClick = true,
		flush = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const popover = usePopover();
	const presence = new Presence(() => popover.open);
	let resolved = $derived(
		popoverPlacement(
			placement,
			alignment,
			popover.reference ? directionOf(popover.reference) : 'ltr'
		)
	);
</script>

{#if presence.present && popover.reference}
	<Portal>
		<div
			bind:this={ref}
			id="{popover.id}-content"
			role="dialog"
			aria-labelledby={popover.hasTitle ? `${popover.id}-title` : undefined}
			class={['oito2-popover', className]}
			data-state={popover.open ? 'open' : 'closed'}
			data-flush={flush ? '' : undefined}
			style:--oito2-popover-max-width="{maxWidth}px"
			{@attach floating(() => popover.reference, {
				placement: resolved,
				offset: offset + (popover.arrow ? 7 : 0),
				sameWidth: matchAnchorWidth,
				arrow: () => popover.arrow
			})}
			{@attach presence.attach}
			{@attach focusScope({ autoFocus: focusOnOpen })}
			{@attach dismissableLayer({
				onDismiss: () => popover.controller.close(),
				closeOnPointerOutside: closeOnOutsideClick,
				inside: () => [popover.trigger, popover.anchor]
			})}
			{...rest}
		>
			{@render children?.()}
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-popover {
			position: relative;
			z-index: 1000;
			box-sizing: border-box;
			max-width: min(var(--oito2-popover-max-width), var(--oito2-available-width, 100vw));
			max-height: var(--oito2-available-height, 100vh);
			overflow: auto;
			padding: var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			outline: none;
			background: var(--oito2-color-surface-container);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			box-shadow:
				0 2px 6px 2px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
			animation: oito2-popover-in 120ms ease-out;
		}

		.oito2-popover:has(> :global(.oito2-popover-arrow)) {
			overflow: visible;
		}

		[data-flush] {
			padding: 0;
		}

		[data-state='closed'] {
			animation: oito2-popover-out 100ms ease-in forwards;
		}

		@keyframes oito2-popover-in {
			from {
				opacity: 0;
				scale: 0.97;
			}
		}

		@keyframes oito2-popover-out {
			to {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-popover,
			[data-state='closed'] {
				animation: none;
			}
		}
	}
</style>
