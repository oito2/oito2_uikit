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
  Animates between two visual states, such as a copy icon that turns into a check mark or
  a play button that becomes pause. It shows `on` while `swapped` and `off` otherwise,
  changing with `effect`; with reduced motion the change is instant. The hidden state
  stays mounted but out of reach of the pointer, the keyboard and assistive technologies.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** How a `Swap` changes between its two states. */
	type SwapEffect = 'fade' | 'scale' | 'rotate' | 'flip';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** Whether `on` is shown. */
		swapped: boolean;
		/** The content shown while not swapped. */
		off: Snippet;
		/** The content shown while swapped. */
		on: Snippet;
		/** The transition. Defaults to `fade`. */
		effect?: SwapEffect;
		/** The transition duration, in milliseconds. Defaults to 200. */
		duration?: number;
		/** The element. */
		ref?: HTMLSpanElement | null;
	}

	let {
		swapped,
		off,
		on,
		effect = 'fade',
		duration = 200,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();
</script>

<span
	bind:this={ref}
	class={['oito2-swap', className]}
	data-effect={effect}
	style:--oito2-swap-duration="{duration}ms"
	{...rest}
>
	<span class="face" data-state={swapped ? 'hidden' : 'shown'} inert={swapped}>
		{@render off()}
	</span>
	<span class="face" data-state={swapped ? 'shown' : 'hidden'} inert={!swapped}>
		{@render on()}
	</span>
</span>

<style>
	@layer oito2 {
		.oito2-swap {
			display: inline-grid;
			place-items: center;
		}

		.face {
			display: inline-flex;
			grid-area: 1 / 1;
			transition:
				opacity var(--oito2-swap-duration) ease-out,
				scale var(--oito2-swap-duration) ease-out,
				rotate var(--oito2-swap-duration) ease-out,
				transform var(--oito2-swap-duration) ease-out,
				visibility var(--oito2-swap-duration);
		}

		[data-state='hidden'] {
			opacity: 0;
			visibility: hidden;
		}

		[data-effect='scale'] > [data-state='hidden'] {
			scale: 0;
		}

		[data-effect='rotate'] > [data-state='hidden'] {
			rotate: -90deg;
		}

		[data-effect='flip'] > .face {
			backface-visibility: hidden;
		}

		/* The faces turn the same way: the one leaving to the back, the one arriving from it. */
		[data-effect='flip'] > [data-state='hidden'] {
			opacity: 1;
			transform: rotateY(180deg);
		}

		[data-effect='flip'] > [data-state='hidden']:first-child {
			transform: rotateY(-180deg);
		}

		@media (prefers-reduced-motion: reduce) {
			.face {
				transition: none;
			}
		}
	}
</style>
