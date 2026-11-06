// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { getContext, hasContext, setContext, untrack } from 'svelte';
import { Controllable } from '../../internal/controllable.svelte.js';

const key = Symbol('oito2.carousel');

/** The options of a `CarouselController`. */
export interface CarouselOptions {
	page: () => number | undefined;
	defaultPage: () => number;
	onChange: (page: number) => void;
	loop: () => boolean;
	/** Reads whether the carousel advances by itself; `false` when left out. */
	autoScroll?: () => boolean;
	/** Reads the controlled rotation state, `undefined` when uncontrolled. */
	playing?: () => boolean | undefined;
	/** Returns the rotation state before the first change; `true` when left out. */
	defaultPlaying?: () => boolean;
	/** Called with each new rotation state. */
	onPlayingChange?: (playing: boolean) => void;
	/** Reads whether the pages are advancing by themselves at the moment; `false` when left out. */
	rotating?: () => boolean;
}

/**
 * Controls a carousel: the slides, the current page and page changes. `Carousel.Root`
 * creates one, shares it with its parts and exposes it through its bindable `controller`.
 */
export class CarouselController {
	readonly #options: CarouselOptions;
	readonly #page: Controllable<number>;
	readonly #playing: Controllable<boolean>;
	#slides = $state<symbol[]>([]);
	/** The scrolling element of the slides. */
	viewport = $state<HTMLElement | null>(null);

	constructor(options: CarouselOptions) {
		this.#options = options;
		this.#page = new Controllable({
			value: options.page,
			defaultValue: options.defaultPage,
			onChange: options.onChange
		});
		this.#playing = new Controllable({
			value: options.playing ?? (() => undefined),
			defaultValue: options.defaultPlaying ?? (() => true),
			onChange: options.onPlayingChange
		});
	}

	/** Whether the carousel advances by itself. */
	get autoScroll(): boolean {
		return this.#options.autoScroll?.() ?? false;
	}

	/**
	 * Whether the automatic rotation is on; setting it to false stops it until it is set
	 * back to true.
	 */
	get playing(): boolean {
		return this.#playing.current;
	}

	set playing(playing: boolean) {
		this.#playing.current = playing;
	}

	/**
	 * Whether the pages are advancing by themselves at the moment: the rotation is on and
	 * not held by a hovering pointer, the focus inside, reduced motion or a hidden document.
	 */
	get rotating(): boolean {
		return this.#options.rotating?.() ?? false;
	}

	/** The current page, from 0. */
	get page(): number {
		return Math.min(Math.max(0, this.#page.current), Math.max(0, this.count - 1));
	}

	/** The number of slides. */
	get count(): number {
		return this.#slides.length;
	}

	/** Whether going past either end wraps around. */
	get loop(): boolean {
		return this.#options.loop();
	}

	/** Whether there is a page before the current one, or the carousel loops. */
	get canGoBack(): boolean {
		return this.count > 1 && (this.loop || this.page > 0);
	}

	/** Whether there is a page after the current one, or the carousel loops. */
	get canGoForward(): boolean {
		return this.count > 1 && (this.loop || this.page < this.count - 1);
	}

	/** Scrolls to page `index`, sliding unless `animate` is false or motion is reduced. */
	goTo(index: number, animate = true): void {
		const target = Math.min(Math.max(0, index), Math.max(0, this.count - 1));
		this.#scrollTo(target, animate);
		if (target !== this.#page.current) this.#page.current = target;
	}

	/**
	 * Moves `step` pages from the current one, wrapping around (with a jump instead of a
	 * slide through every page) when `loop` is on, or the carousel loops, and clamping
	 * otherwise.
	 */
	step(step: number, loop = this.loop): void {
		const count = this.count;
		if (count === 0) return;
		let target = this.page + step;
		let wraps = false;
		if (loop) {
			wraps = target < 0 || target >= count;
			target = ((target % count) + count) % count;
		} else target = Math.min(Math.max(0, target), count - 1);
		if (target !== this.page) this.goTo(target, !wraps);
	}

	/** Moves to the next page. */
	next(): void {
		this.step(1);
	}

	/** Moves to the previous page. */
	previous(): void {
		this.step(-1);
	}

	/** Records the page the viewport scrolled to, without scrolling. */
	settle(index: number): void {
		if (index !== this.#page.current) this.#page.current = index;
	}

	/** Adds a slide and returns its key. */
	register(): symbol {
		const slide = Symbol('slide');
		this.#slides = [...untrack(() => this.#slides), slide];
		return slide;
	}

	/** Removes a slide. */
	unregister(slide: symbol): void {
		this.#slides = this.#slides.filter((each) => each !== slide);
	}

	/** Returns the index of a slide. */
	indexOf(slide: symbol): number {
		return this.#slides.indexOf(slide);
	}

	#scrollTo(index: number, animate: boolean): void {
		const viewport = this.viewport;
		const slide = viewport?.querySelectorAll<HTMLElement>('[data-oito2-carousel-slide]')[index];
		if (!viewport || !slide) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const delta = slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
		viewport.scrollBy({ left: delta, behavior: animate && !reduced ? 'smooth' : 'instant' });
	}
}

/** Publishes the carousel controller to its parts. */
export function setCarousel(controller: CarouselController): CarouselController {
	return setContext(key, controller);
}

/** Returns the controller of the enclosing `Carousel.Root`; throws outside one. */
export function useCarousel(): CarouselController {
	if (!hasContext(key)) throw new Error('Carousel parts must be inside a Carousel.Root');
	return getContext<CarouselController>(key);
}
