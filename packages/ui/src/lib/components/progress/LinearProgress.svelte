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
  A linear progress indicator: a 6-pixel bar that fills from the start with `value` (0 to
  1), or, without one, a segment that slides back and forth while the work has no known
  end. It takes the width of its container.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The progress from 0 to 1; leave it out for an indeterminate indicator. */
		value?: number | null;
		/** The bar height in pixels. Defaults to 6. */
		height?: number;
		/** The accessible name. */
		label?: string;
	}

	let { value = null, height, label, class: className, ...rest }: Props = $props();

	let clamped = $derived(value === null ? null : Math.min(1, Math.max(0, value)));
</script>

<span
	role="progressbar"
	aria-label={label}
	aria-valuemin={clamped === null ? undefined : 0}
	aria-valuemax={clamped === null ? undefined : 100}
	aria-valuenow={clamped === null ? undefined : Math.round(clamped * 100)}
	class={['oito2-linear-progress', className]}
	data-state={clamped === null ? 'indeterminate' : 'determinate'}
	style:--oito2-progress-bar-height={height === undefined ? undefined : `${height}px`}
	{...rest}
>
	{#if clamped === null || clamped > 0}
		<span
			class="bar"
			style:width={clamped === null ? undefined : `max(var(--h), ${clamped * 100}%)`}
		></span>
	{/if}
</span>

<style>
	@layer oito2 {
		.oito2-linear-progress {
			--h: var(--oito2-progress-bar-height, var(--oito2-size-progress-height));
			position: relative;
			display: block;
			overflow: hidden;
			width: 100%;
			height: var(--h);
			border-radius: calc(var(--h) / 2);
			background: var(--oito2-color-surface-container-highest);
		}

		.bar {
			position: absolute;
			top: 0;
			bottom: 0;
			inset-inline-start: 0;
			border-radius: inherit;
			background: var(--oito2-color-selected-fill);
		}

		[data-state='indeterminate'] .bar {
			width: 25%;
			animation: oito2-progress-slide 1.1s ease-in-out infinite alternate;
		}

		@keyframes oito2-progress-slide {
			from {
				inset-inline-start: 0;
			}
			to {
				inset-inline-start: 75%;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			[data-state='indeterminate'] .bar {
				animation: none;
			}
		}
	}
</style>
