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
  A scrolling region with the oito2 scroll bars instead of the system ones: thin
  rounded thumbs (6 pixels, 10 while hovered) in the text color at 30% (45% hovered, 60%
  dragged), which show while the content scrolls or the pointer is over the region, or
  always with `thumbVisibility`. The thumbs can be dragged and the tracks clicked to page.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { on } from 'svelte/events';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The axes that scroll. Defaults to `vertical`. */
		direction?: 'vertical' | 'horizontal' | 'both';
		/** Whether the thumbs always show. Defaults to showing them only while needed. */
		thumbVisibility?: boolean;
		/** The scrolling element, for reading or setting its scroll position. */
		viewport?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		direction = 'vertical',
		thumbVisibility = false,
		viewport = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	/** The length and offset of a thumb along its track, in percent, or null without overflow. */
	interface Thumb {
		size: number;
		offset: number;
	}

	let vertical: Thumb | null = $state(null);
	let horizontal: Thumb | null = $state(null);
	let scrolling = $state(false);
	let dragging: 'x' | 'y' | null = $state(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const minThumb = 18;

	/** Measures the thumbs from the viewport's scroll metrics. */
	function measure(node: HTMLDivElement) {
		const axis = (client: number, scroll: number, position: number): Thumb | null => {
			if (scroll <= client + 1) return null;
			const size = Math.max((client / scroll) * 100, (minThumb / client) * 100);
			const offset = (position / (scroll - client)) * (100 - size);
			return { size, offset: Math.min(100 - size, Math.max(0, offset)) };
		};
		vertical =
			direction === 'horizontal'
				? null
				: axis(node.clientHeight, node.scrollHeight, node.scrollTop);
		horizontal =
			direction === 'vertical'
				? null
				: axis(node.clientWidth, node.scrollWidth, Math.abs(node.scrollLeft));
	}

	function track(node: HTMLDivElement) {
		viewport = node;
		measure(node);
		const onScroll = () => {
			measure(node);
			scrolling = true;
			clearTimeout(timer);
			timer = setTimeout(() => (scrolling = false), 800);
		};
		node.addEventListener('scroll', onScroll, { passive: true });
		const observer = new ResizeObserver(() => measure(node));
		observer.observe(node);
		if (node.firstElementChild) observer.observe(node.firstElementChild);
		return () => {
			clearTimeout(timer);
			observer.disconnect();
			node.removeEventListener('scroll', onScroll);
			if (viewport === node) viewport = null;
		};
	}

	/** Drags a thumb: moves the scroll position with the pointer, keeping the grab offset. */
	function drag(axis: 'x' | 'y', event: PointerEvent) {
		const node = viewport;
		if (!node || event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const thumb = event.currentTarget as HTMLElement;
		thumb.setPointerCapture(event.pointerId);
		dragging = axis;
		const start = axis === 'y' ? event.clientY : event.clientX;
		const startScroll = axis === 'y' ? node.scrollTop : node.scrollLeft;
		const trackLength = (thumb.parentElement as HTMLElement)[
			axis === 'y' ? 'clientHeight' : 'clientWidth'
		];
		const thumbLength = thumb[axis === 'y' ? 'offsetHeight' : 'offsetWidth'];
		const range =
			axis === 'y'
				? node.scrollHeight - node.clientHeight
				: node.scrollWidth - node.clientWidth;
		const rtl = axis === 'x' && getComputedStyle(node).direction === 'rtl';
		const move = (e: PointerEvent) => {
			const delta = ((axis === 'y' ? e.clientY : e.clientX) - start) * (rtl ? -1 : 1);
			const scroll =
				startScroll +
				(delta / Math.max(1, trackLength - thumbLength)) * range * (rtl ? -1 : 1);
			if (axis === 'y') node.scrollTop = scroll;
			else node.scrollLeft = scroll;
		};
		const end = () => {
			dragging = null;
			thumb.removeEventListener('pointermove', move);
			thumb.removeEventListener('pointerup', end);
			thumb.removeEventListener('pointercancel', end);
		};
		thumb.addEventListener('pointermove', move);
		thumb.addEventListener('pointerup', end);
		thumb.addEventListener('pointercancel', end);
	}

	/** Pages the viewport toward a click on the track. */
	function page(axis: 'x' | 'y', event: PointerEvent) {
		const node = viewport;
		if (!node || event.button !== 0) return;
		const thumb = (event.currentTarget as HTMLElement).firstElementChild as HTMLElement;
		const rect = thumb.getBoundingClientRect();
		if (axis === 'y') {
			const sign = event.clientY < rect.top ? -1 : 1;
			node.scrollBy({ top: sign * node.clientHeight * 0.9 });
		} else {
			const sign = event.clientX < rect.left ? -1 : 1;
			node.scrollBy({ left: sign * node.clientWidth * 0.9 });
		}
	}
</script>

<div
	class={['oito2-scroll-area', className]}
	data-direction={direction}
	data-visible={thumbVisibility || scrolling || dragging ? '' : undefined}
	{...rest}
>
	<div class="viewport" {@attach track}>
		<div class="content">{@render children?.()}</div>
	</div>
	{#if vertical}
		<div
			class="track"
			data-axis="y"
			aria-hidden="true"
			{@attach (node) => on(node, 'pointerdown', (e) => page('y', e))}
		>
			<div
				class="thumb"
				data-dragging={dragging === 'y' ? '' : undefined}
				style:height="{vertical.size}%"
				style:top="{vertical.offset}%"
				{@attach (node) => on(node, 'pointerdown', (e) => drag('y', e))}
			></div>
		</div>
	{/if}
	{#if horizontal}
		<div
			class="track"
			data-axis="x"
			aria-hidden="true"
			{@attach (node) => on(node, 'pointerdown', (e) => page('x', e))}
		>
			<div
				class="thumb"
				data-dragging={dragging === 'x' ? '' : undefined}
				style:width="{horizontal.size}%"
				style:inset-inline-start="{horizontal.offset}%"
				{@attach (node) => on(node, 'pointerdown', (e) => drag('x', e))}
			></div>
		</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-scroll-area {
			position: relative;
			display: flex;
			overflow: hidden;
			min-width: 0;
			min-height: 0;
		}

		.viewport {
			flex: 1;
			min-width: 0;
			min-height: 0;
			overflow: auto;
			scrollbar-width: none;
		}

		.viewport::-webkit-scrollbar {
			display: none;
		}

		[data-direction='vertical'] .viewport {
			overflow-x: hidden;
		}

		[data-direction='horizontal'] .viewport {
			overflow-y: hidden;
		}

		[data-direction='horizontal'] .content,
		[data-direction='both'] .content {
			width: max-content;
			min-width: 100%;
		}

		.track {
			position: absolute;
			z-index: 1;
			opacity: 0;
			transition: opacity 300ms ease-out;
		}

		.track[data-axis='y'] {
			top: 2px;
			bottom: 2px;
			inset-inline-end: 2px;
			width: 10px;
		}

		.track[data-axis='x'] {
			right: 2px;
			bottom: 2px;
			left: 2px;
			height: 10px;
		}

		[data-direction='both'] .track[data-axis='y'] {
			bottom: 14px;
		}

		.oito2-scroll-area:hover .track,
		[data-visible] .track {
			opacity: 1;
			transition-duration: 100ms;
		}

		.thumb {
			position: absolute;
			border-radius: var(--oito2-radius-check);
			background: color-mix(in srgb, var(--oito2-color-on-surface) 30%, transparent);
			transition:
				width 100ms ease-out,
				height 100ms ease-out,
				background-color 100ms ease-out;
		}

		[data-axis='y'] .thumb {
			inset-inline-end: 0;
			width: 6px;
		}

		[data-axis='x'] .thumb {
			bottom: 0;
			height: 6px;
		}

		.track:hover .thumb {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 45%, transparent);
		}

		[data-axis='y']:hover .thumb,
		[data-axis='y'] .thumb[data-dragging] {
			width: 10px;
		}

		[data-axis='x']:hover .thumb,
		[data-axis='x'] .thumb[data-dragging] {
			height: 10px;
		}

		.thumb[data-dragging] {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 60%, transparent);
		}

		@media (pointer: coarse) {
			.track {
				pointer-events: none;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.track,
			.thumb {
				transition: none;
			}
		}
	}
</style>
