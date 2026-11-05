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
  An animated icon, such as `animatedIcons.ok`, drawn in SVG.

  It plays according to `mode`, at `size` (the icon size of the density by default) in
  `color` (the text color by default). When the user prefers reduced motion it shows the
  final frame. Without a `label` it is hidden from assistive technologies, as a decorative
  icon.
-->
<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';
	import type { AnimatedIconData, AnimationMode, IconShape } from './animated-icons.js';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'mode'> {
		/** The drawing and timing of the icon. */
		data: AnimatedIconData;
		/** How the animation plays. Defaults to `once`. */
		mode?: AnimationMode;
		/** The width and height in pixels; defaults to the icon size of the density. */
		size?: number;
		/** The color; defaults to the text color. */
		color?: string;
		/** The length of one play in milliseconds; defaults to the data's duration. */
		duration?: number;
		/** The accessible name; when left out the icon is decorative. */
		label?: string;
		/** The element. */
		ref?: SVGSVGElement | null;
	}

	let {
		data,
		mode = 'once',
		size,
		color,
		duration,
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let progress = $state(0);
	let length = $derived(Math.max(1, duration ?? data.duration));

	// Plays the animation for the current data and mode: the final frame when still or under
	// reduced motion, from the start once, or over and over.
	$effect(() => {
		void data;
		const play = mode;
		const total = length;
		if (play === 'still' || reducedMotion.current) {
			progress = 1;
			return;
		}
		let frame = 0;
		const start = performance.now();
		const step = (now: number) => {
			const elapsed = (now - start) / total;
			if (play === 'repeat') {
				progress = elapsed % 1;
			} else {
				progress = Math.min(1, elapsed);
				if (progress >= 1) return;
			}
			frame = requestAnimationFrame(step);
		};
		progress = 0;
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	});
</script>

<svg
	bind:this={ref}
	viewBox="0 0 24 24"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	class={['oito2-animated-icon', className]}
	style:width={size === undefined ? undefined : `${size}px`}
	style:height={size === undefined ? undefined : `${size}px`}
	style:color
	{...rest}
>
	{@render shapes(data.frame(progress, id))}
</svg>

{#snippet shapes(list: readonly IconShape[])}
	{#each list as shape, index (index)}
		<svelte:element this={shape.tag} xmlns="http://www.w3.org/2000/svg" {...shape.attributes}>
			{#if shape.children}{@render shapes(shape.children)}{/if}
		</svelte:element>
	{/each}
{/snippet}

<style>
	@layer oito2 {
		.oito2-animated-icon {
			display: inline-block;
			flex: none;
			width: var(--oito2-icon-size, 24px);
			height: var(--oito2-icon-size, 24px);
			overflow: visible;
			vertical-align: middle;
		}
	}
</style>
