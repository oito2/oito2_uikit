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
  The label of a tooltip, rendered over the page next to the trigger (below it by
  default), with a short fade.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../internal/Portal.svelte';
	import { floating, type Placement } from '../../internal/floating.js';
	import { Presence } from '../../internal/presence.svelte.js';
	import { useTooltip } from './tooltip-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Where the tooltip goes. Defaults to `bottom`. */
		placement?: Placement;
		/** The gap to the trigger in pixels. Defaults to 4. */
		offset?: number;
		/** The text. */
		children: Snippet;
	}

	let { placement = 'bottom', offset = 4, class: className, children, ...rest }: Props = $props();

	const tooltip = useTooltip();
	const presence = new Presence(() => tooltip.open);
</script>

{#if presence.present && tooltip.trigger}
	<Portal>
		<div
			id={tooltip.id}
			role="tooltip"
			class={['oito2-tooltip', className]}
			data-state={tooltip.open ? 'open' : 'closed'}
			{@attach floating(() => tooltip.trigger, { placement, offset })}
			{@attach presence.attach}
			{...rest}
		>
			{@render children()}
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-tooltip {
			z-index: 1000;
			box-sizing: border-box;
			max-width: min(320px, var(--oito2-available-width, 320px));
			padding: var(--oito2-space-xs) var(--oito2-space-sm);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-inverse-surface);
			color: var(--oito2-color-on-inverse-surface);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
			pointer-events: none;
			animation: oito2-tooltip-in 150ms ease-out;
		}

		[data-state='closed'] {
			animation: oito2-tooltip-out 100ms ease-in forwards;
		}

		@keyframes oito2-tooltip-in {
			from {
				opacity: 0;
			}
		}

		@keyframes oito2-tooltip-out {
			to {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-tooltip,
			[data-state='closed'] {
				animation: none;
			}
		}
	}
</style>
