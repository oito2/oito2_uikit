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
  The scrolling row of `Carousel.Item`s, one page at a time, `height` pixels tall. It
  snaps to a page after a swipe; with a mouse the pages can be dragged too. Place
  `Carousel.Prev` and `Carousel.Next` inside it to show them over the pages.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The height of the pages, in pixels. Defaults to 240. */
		height?: number;
		/** The scrolling element. */
		ref?: HTMLDivElement | null;
		/** The items, and the buttons shown over them. */
		children?: Snippet;
	}

	let {
		height = 240,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const carousel = useCarousel();
	let dragging = $state(false);

	/** Returns the index of the slide closest to the start of `track`. */
	function nearest(track: HTMLElement): number {
		const start = track.getBoundingClientRect().left;
		let best = 0;
		let distance = Number.POSITIVE_INFINITY;
		track.querySelectorAll<HTMLElement>('[data-oito2-carousel-slide]').forEach((slide, i) => {
			const d = Math.abs(slide.getBoundingClientRect().left - start);
			if (d < distance) {
				distance = d;
				best = i;
			}
		});
		return best;
	}

	/** Records the page once scrolling settles, and drags the pages with a mouse. */
	const track: Attachment<HTMLDivElement> = (element) => {
		carousel.viewport = element;
		let timer = 0;
		const settle = () => {
			clearTimeout(timer);
			timer = window.setTimeout(() => {
				if (!dragging) carousel.settle(nearest(element));
			}, 120);
		};
		let last = 0;
		const onDown = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse' || event.button !== 0) return;
			if (
				(event.target as Element | null)?.closest(
					'button, a, input, [tabindex]:not(.oito2-carousel-viewport)'
				)
			)
				return;
			dragging = true;
			last = event.clientX;
			element.setPointerCapture(event.pointerId);
		};
		const onMove = (event: PointerEvent) => {
			if (!dragging) return;
			element.scrollLeft -= event.clientX - last;
			last = event.clientX;
		};
		const onUp = (event: PointerEvent) => {
			if (!dragging) return;
			dragging = false;
			if (element.hasPointerCapture(event.pointerId))
				element.releasePointerCapture(event.pointerId);
			carousel.goTo(nearest(element));
		};
		element.addEventListener('scroll', settle, { passive: true });
		element.addEventListener('pointerdown', onDown);
		element.addEventListener('pointermove', onMove);
		element.addEventListener('pointerup', onUp);
		element.addEventListener('pointercancel', onUp);
		// Shows the initial page without sliding.
		requestAnimationFrame(() => carousel.goTo(carousel.page, false));
		// A page set from outside, such as a bound `page`, scrolls there.
		const follow = $effect.root(() => {
			$effect(() => {
				const page = carousel.page;
				if (!dragging && nearest(element) !== page) carousel.goTo(page);
			});
		});
		return () => {
			clearTimeout(timer);
			follow();
			if (carousel.viewport === element) carousel.viewport = null;
			element.removeEventListener('scroll', settle);
			element.removeEventListener('pointerdown', onDown);
			element.removeEventListener('pointermove', onMove);
			element.removeEventListener('pointerup', onUp);
			element.removeEventListener('pointercancel', onUp);
		};
	};
</script>

<div class={['oito2-carousel-frame', className]} style:height="{height}px" {...rest}>
	<div
		bind:this={ref}
		class="oito2-carousel-viewport"
		aria-live={carousel.count > 0 ? 'polite' : undefined}
		data-dragging={dragging ? '' : undefined}
		{@attach track}
	>
		{@render children?.()}
	</div>
</div>

<style>
	@layer oito2 {
		.oito2-carousel-frame {
			position: relative;
			min-width: 0;
		}

		.oito2-carousel-viewport {
			display: flex;
			height: 100%;
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}

		.oito2-carousel-viewport::-webkit-scrollbar {
			display: none;
		}

		[data-dragging] {
			scroll-snap-type: none;
			cursor: grabbing;
			user-select: none;
		}
	}
</style>
