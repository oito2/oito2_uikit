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
  The time of a `TimerController` as text: the remaining time of a countdown or the elapsed
  time of a stopwatch, in tabular figures so the digits don't shift.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { formatDuration, type TimerController } from './timer-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The timer shown. */
		controller: TimerController;
		/** Whether tenths of a second show; without them a countdown rounds up to the whole second. */
		tenths?: boolean;
		/** The element. */
		ref?: HTMLSpanElement | null;
	}

	let {
		controller,
		tenths = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let text = $derived.by(() => {
		const remaining = controller.remaining;
		const time = remaining ?? controller.elapsed;
		// Rounds a countdown up, so it shows 0:00 only at the end.
		const shown = remaining !== null && !tenths ? Math.ceil(time / 1000) * 1000 : time;
		return formatDuration(shown, { tenths });
	});
</script>

<span bind:this={ref} role="timer" class={['oito2-timer-text', className]} {...rest}>{text}</span>

<style>
	@layer oito2 {
		.oito2-timer-text {
			font-variant-numeric: tabular-nums;
		}
	}
</style>
