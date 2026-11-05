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

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Heart from '@lucide/svelte/icons/heart';
	import HeartOff from '@lucide/svelte/icons/heart-off';
	import Moon from '@lucide/svelte/icons/moon';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Sun from '@lucide/svelte/icons/sun';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { Button, Swap } from '@oito2/ui';

	const effects = [
		{ effect: 'fade', off: Sun, on: Moon, label: 'Dark style' },
		{ effect: 'scale', off: Copy, on: Check, label: 'Copied' },
		{ effect: 'rotate', off: Play, on: Pause, label: 'Playing' },
		{ effect: 'flip', off: Volume2, on: VolumeX, label: 'Muted' }
	] as const;

	let swapped = $state<readonly boolean[]>([false, false, false, false]);
	let liked = $state(false);
	let slow = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>Swap</code> shows one of two snippets, <code>off</code> or <code>on</code>, and
		animates the change with <code>effect</code>, such as an icon that turns into another inside
		a button. With reduced motion the change is instant. The hidden state stays in place, so the
		size doesn't jump.
	</p>

	<section aria-labelledby="swap-effects">
		<h2 id="swap-effects">Effects</h2>
		<p>
			<code>fade</code> (the default), <code>scale</code>, <code>rotate</code> and
			<code>flip</code>. Each button toggles <code>swapped</code>.
		</p>
		<div class="row">
			{#each effects as each, index (each.effect)}
				{@const Off = each.off}
				{@const On = each.on}
				<Button
					variant="tonal"
					aria-pressed={swapped[index]}
					onclick={() =>
						(swapped = swapped.map((value, at) => (at === index ? !value : value)))}
				>
					<Swap swapped={swapped[index] === true} effect={each.effect}>
						{#snippet off()}<Off size={18} aria-hidden="true" />{/snippet}
						{#snippet on()}<On size={18} aria-hidden="true" />{/snippet}
					</Swap>
					{each.effect}
				</Button>
			{/each}
		</div>
		<p class="note">
			{effects
				.map((each, index) => `${each.label}: ${swapped[index] ? 'on' : 'off'}`)
				.join(' · ')}
		</p>
	</section>

	<section aria-labelledby="swap-duration">
		<h2 id="swap-duration">Duration and text</h2>
		<p>
			<code>duration</code> sets the length of the animation in milliseconds; the snippets can hold
			any content, such as text.
		</p>
		<div class="row">
			<Button variant="outlined" onclick={() => (liked = !liked)}>
				<Swap swapped={liked} effect="scale" duration={slow ? 800 : 200}>
					{#snippet off()}<HeartOff size={18} aria-hidden="true" />{/snippet}
					{#snippet on()}<Heart size={18} aria-hidden="true" />{/snippet}
				</Swap>
				<Swap swapped={liked} duration={slow ? 800 : 200}>
					{#snippet off()}Like{/snippet}
					{#snippet on()}Liked{/snippet}
				</Swap>
			</Button>
			<Button variant="text" aria-pressed={slow} onclick={() => (slow = !slow)}>
				Slow animation
			</Button>
		</div>
		<p class="note">Duration: {slow ? 800 : 200} ms</p>
	</section>
</main>
