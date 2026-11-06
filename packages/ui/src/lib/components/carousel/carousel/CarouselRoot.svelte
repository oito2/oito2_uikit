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
  A row of pages shown one at a time. Pages change by `Carousel.Prev` and `Carousel.Next`,
  the dots of `Carousel.Indicators`, the Left and Right arrow keys (swapped in
  right-to-left text) while the carousel has focus, or a swipe, also with a mouse. With
  `loop` the buttons and arrows wrap around, jumping straight to the other end. With
  `autoScroll` it moves to the next page every `interval` milliseconds while `playing`,
  no pointer hovers it, nothing inside it has focus, the document is visible and motion
  isn't reduced; `Carousel.PlayPause` turns `playing` off and on. Bind `page`, or set
  `defaultPage` and listen to `onPageChange`; setting `page` scrolls to it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';
	import { directionOf, navigationIntent } from '../../../internal/keyboard.js';
	import { CarouselController, setCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The current page, from 0. */
		page?: number;
		/** The first page of an uncontrolled carousel. Defaults to 0. */
		defaultPage?: number;
		/** Called with each new page. */
		onPageChange?: (page: number) => void;
		/** Whether going past the last page returns to the first, and back. Defaults to true. */
		loop?: boolean;
		/** Whether the carousel advances by itself. Defaults to false. */
		autoScroll?: boolean;
		/** The time each page stays when `autoScroll`, in milliseconds. Defaults to 4000. */
		interval?: number;
		/** Whether the automatic rotation of `autoScroll` is on. */
		playing?: boolean;
		/** The rotation state of an uncontrolled carousel before the first change. Defaults to `true`. */
		defaultPlaying?: boolean;
		/** Called with each new rotation state. */
		onPlayingChange?: (playing: boolean) => void;
		/** The controller of this carousel, for changing its page from outside; bind it to read it. */
		controller?: CarouselController | null;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The viewport, the buttons and the indicators. */
		children?: Snippet;
	}

	let {
		page = $bindable(),
		defaultPage = 0,
		onPageChange,
		loop = true,
		autoScroll = false,
		interval = 4000,
		playing = $bindable(),
		defaultPlaying = true,
		onPlayingChange,
		controller = $bindable(),
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const carousel = setCarousel(
		new CarouselController({
			page: () => page,
			defaultPage: () => defaultPage,
			onChange: (next) => {
				page = next;
				onPageChange?.(next);
			},
			loop: () => loop,
			autoScroll: () => autoScroll,
			playing: () => playing,
			defaultPlaying: () => defaultPlaying,
			onPlayingChange: (next) => {
				playing = next;
				onPlayingChange?.(next);
			},
			rotating: () => rotating
		})
	);

	// Hands the controller to a bound `controller` prop.
	$effect.pre(() => {
		if (controller !== carousel) controller = carousel;
	});

	const reduced = new MediaQuery('(prefers-reduced-motion: reduce)');
	let hovered = $state(false);
	let focused = $state(false);
	let hidden = $state(false);
	let rotating = $derived(
		autoScroll &&
			carousel.playing &&
			!reduced.current &&
			!hovered &&
			!focused &&
			!hidden &&
			carousel.count > 1
	);

	// Tracks whether the document is hidden, such as in a background tab.
	$effect(() => {
		const sync = () => (hidden = document.hidden);
		sync();
		document.addEventListener('visibilitychange', sync);
		return () => document.removeEventListener('visibilitychange', sync);
	});

	// Restarts the timer whenever what it depends on changes, including the page, so a
	// page changed by hand stays for a full interval.
	$effect(() => {
		void carousel.page;
		if (!rotating) return;
		const timer = setInterval(() => carousel.step(1, true), interval);
		return () => clearInterval(timer);
	});

	/** Changes the page with the arrow keys and tracks focus and hover. */
	const behavior: Attachment<HTMLDivElement> = (root) => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
			if ((event.target as Element | null)?.closest('[data-oito2-roving-group]')) return;
			const intent = navigationIntent(event.key, {
				orientation: 'horizontal',
				dir: directionOf(root)
			});
			if (intent !== 'next' && intent !== 'previous') return;
			event.preventDefault();
			carousel.step(intent === 'next' ? 1 : -1);
		};
		const onFocusIn = () => (focused = true);
		const onFocusOut = (event: FocusEvent) => {
			if (!root.contains(event.relatedTarget as Node | null)) focused = false;
		};
		const onEnter = () => (hovered = true);
		const onLeave = () => (hovered = false);
		root.addEventListener('keydown', onKeyDown);
		root.addEventListener('focusin', onFocusIn);
		root.addEventListener('focusout', onFocusOut);
		root.addEventListener('pointerenter', onEnter);
		root.addEventListener('pointerleave', onLeave);
		return () => {
			root.removeEventListener('keydown', onKeyDown);
			root.removeEventListener('focusin', onFocusIn);
			root.removeEventListener('focusout', onFocusOut);
			root.removeEventListener('pointerenter', onEnter);
			root.removeEventListener('pointerleave', onLeave);
		};
	};
</script>

<!-- The arrow keys pressed anywhere inside, such as on the focused slides, change the page. -->
<div
	bind:this={ref}
	role="region"
	aria-roledescription="carousel"
	class={['oito2-carousel', className]}
	{@attach behavior}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-carousel {
			position: relative;
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-sm);
			min-width: 0;
			border-radius: var(--oito2-radius-large);
		}

		.oito2-carousel:global(:has(> * > .oito2-carousel-viewport:focus-visible)) {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}
	}
</style>
