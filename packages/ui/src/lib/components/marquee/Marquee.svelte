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
  Scrolls its content continuously when it is longer than the space it has, such as a news
  ticker or a long song title.

  The content moves toward the reading start (up when vertical), or the other way with
  `reverse`, at `speed` pixels per second, followed by a copy after `gap`. It stops while
  the pointer or the focus is on it, and stays still at its start when the user prefers
  reduced motion. `fadeEdges` fades the content at both ends. Content that fits doesn't
  move. Assistive technologies read the content once; the copy is hidden and inert, so
  plain content, such as text or icons, fits best. A vertical marquee needs a height.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';
	import { directionOf, type Direction, type Orientation } from '../../internal/keyboard.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The scrolling content. */
		children: Snippet;
		/** The direction of the scroll. Defaults to `horizontal`. */
		orientation?: Orientation;
		/** Whether the content moves toward the reading end (down when vertical). */
		reverse?: boolean;
		/** The speed in pixels per second. Defaults to 40. */
		speed?: number;
		/** The space between the content and its copy, in pixels. Defaults to 32. */
		gap?: number;
		/** Whether the pointer or the focus stops the scroll. Defaults to true. */
		pauseOnHover?: boolean;
		/** Whether the content fades at both ends while it scrolls. Defaults to true. */
		fadeEdges?: boolean;
		/** The length of the fades in pixels. Defaults to 24. */
		fadeExtent?: number;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		children,
		orientation = 'horizontal',
		reverse = false,
		speed = 40,
		gap = 32,
		pauseOnHover = true,
		fadeEdges = true,
		fadeExtent = 24,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let track: HTMLDivElement | null = $state(null);
	let content: HTMLSpanElement | null = $state(null);
	let extent = $state(0);
	let viewport = $state(0);
	let dir: Direction = $state('ltr');
	let hovered = $state(false);
	let focused = $state(false);

	let horizontal = $derived(orientation === 'horizontal');
	let overflows = $derived(viewport > 0 && extent > viewport);
	let paused = $derived(pauseOnHover && (hovered || focused));
	let fade = $derived(
		fadeEdges && overflows
			? `linear-gradient(${horizontal ? 'to right' : 'to bottom'}, transparent, #000 ${fadeExtent}px, #000 calc(100% - ${fadeExtent}px), transparent)`
			: undefined
	);

	// Measures the view and the content along the axis, and reads the reading direction.
	$effect(() => {
		const root = ref;
		const inner = content;
		if (!root || !inner) return;
		const measure = () => {
			viewport = horizontal ? root.clientWidth : root.clientHeight;
			extent = horizontal ? inner.offsetWidth : inner.offsetHeight;
			dir = directionOf(root);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		observer.observe(inner);
		return () => observer.disconnect();
	});

	// Runs the scroll while the content overflows and motion is allowed.
	let animation: Animation | null = null;
	$effect(() => {
		const element = track;
		if (!element || !overflows || reducedMotion.current || !(speed > 0)) return;
		const period = extent + gap;
		const towardNegative = horizontal ? (dir === 'rtl') === reverse : !reverse;
		const [from, to] = towardNegative ? [0, -period] : [-period, 0];
		const axis = horizontal ? 'X' : 'Y';
		animation = element.animate(
			[
				{ transform: `translate${axis}(${from}px)` },
				{ transform: `translate${axis}(${to}px)` }
			],
			{ duration: (period / speed) * 1000, iterations: Infinity, easing: 'linear' }
		);
		if (untrack(() => paused)) animation.pause();
		return () => {
			animation?.cancel();
			animation = null;
		};
	});

	// Stops the scroll under the pointer or the focus.
	$effect(() => {
		const stop = paused;
		if (!animation) return;
		if (stop) animation.pause();
		else animation.play();
	});
</script>

<div
	bind:this={ref}
	class={['oito2-marquee', className]}
	data-orientation={orientation}
	data-overflows={overflows ? '' : undefined}
	data-dir={dir}
	style:mask-image={fade}
	style:--oito2-marquee-gap="{gap}px"
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={(event) => {
		if (!ref?.contains(event.relatedTarget as Node | null)) focused = false;
	}}
	{...rest}
>
	<div bind:this={track} class="oito2-marquee-track">
		<span bind:this={content} class="oito2-marquee-content" {dir}>{@render children()}</span>
		{#if overflows}
			<span class="oito2-marquee-content" {dir} aria-hidden="true" inert
				>{@render children()}</span
			>
		{/if}
	</div>
</div>

<style>
	@layer oito2 {
		/* The content never widens the marquee: it takes the width its container gives it. */
		.oito2-marquee {
			display: flex;
			overflow: hidden;
			min-width: 0;
			direction: ltr;
			contain: inline-size;
		}

		.oito2-marquee[data-orientation='vertical'] {
			flex-direction: column;
			contain: none;
		}

		.oito2-marquee[data-dir='rtl']:not([data-overflows]):not([data-orientation='vertical']) {
			justify-content: flex-end;
		}

		.oito2-marquee-track {
			display: flex;
			flex: none;
			gap: var(--oito2-marquee-gap, 32px);
		}

		.oito2-marquee[data-orientation='vertical'] .oito2-marquee-track {
			flex-direction: column;
		}

		.oito2-marquee-content {
			display: block;
			flex: none;
			white-space: nowrap;
		}

		.oito2-marquee[data-orientation='vertical'] .oito2-marquee-content {
			white-space: normal;
		}
	}
</style>
