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
  A circular progress indicator: a ring that fills clockwise from the top with `value`
  (0 to 1), or, without one, an arc that turns and grows while the work has no known end.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The progress from 0 to 1; leave it out for an indeterminate indicator. */
		value?: number | null;
		/** The diameter in pixels. Defaults to 32. */
		size?: number;
		/** The stroke width in pixels. Defaults to 4. */
		strokeWidth?: number;
		/** The accessible name. */
		label?: string;
	}

	let {
		value = null,
		size = 32,
		strokeWidth = 4,
		label,
		class: className,
		...rest
	}: Props = $props();

	let radius = $derived((size - strokeWidth) / 2);
	let clamped = $derived(value === null ? null : Math.min(1, Math.max(0, value)));
</script>

<span
	role="progressbar"
	aria-label={label}
	aria-valuemin={clamped === null ? undefined : 0}
	aria-valuemax={clamped === null ? undefined : 100}
	aria-valuenow={clamped === null ? undefined : Math.round(clamped * 100)}
	class={['oito2-circular-progress', className]}
	data-state={clamped === null ? 'indeterminate' : 'determinate'}
	style:width="{size}px"
	style:height="{size}px"
	{...rest}
>
	<svg viewBox="0 0 {size} {size}" aria-hidden="true">
		{#if clamped !== null}
			<circle
				class="track"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke-width={strokeWidth}
			/>
			{#if clamped > 0}
				<circle
					class="arc"
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke-width={strokeWidth}
					pathLength="1"
					stroke-dasharray="{clamped} 1"
				/>
			{/if}
		{:else}
			<circle
				class="arc spinning"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke-width={strokeWidth}
				pathLength="1"
			/>
		{/if}
	</svg>
</span>

<style>
	@layer oito2 {
		.oito2-circular-progress {
			display: inline-block;
			flex: none;
			vertical-align: middle;
		}

		svg {
			display: block;
			width: 100%;
			height: 100%;
			overflow: visible;
		}

		circle {
			fill: none;
		}

		.track {
			stroke: var(--oito2-color-surface-container-highest);
		}

		/* The arc starts at the top and runs clockwise. */
		.arc {
			stroke: var(--oito2-color-selected-fill);
			stroke-linecap: round;
			transform: rotate(-90deg);
			transform-origin: center;
		}

		/* One turn per cycle while the arc grows from a quarter to three quarters of a turn
		   and back. */
		.spinning {
			animation:
				oito2-progress-turn 1.5s linear infinite,
				oito2-progress-sweep 1.5s ease-in-out infinite;
		}

		@keyframes oito2-progress-turn {
			from {
				transform: rotate(-90deg);
			}
			to {
				transform: rotate(270deg);
			}
		}

		@keyframes oito2-progress-sweep {
			0%,
			100% {
				stroke-dasharray: 0.25 1;
			}
			50% {
				stroke-dasharray: 0.75 1;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.spinning {
				animation: none;
				stroke-dasharray: 0.25 1;
			}
		}
	}
</style>
