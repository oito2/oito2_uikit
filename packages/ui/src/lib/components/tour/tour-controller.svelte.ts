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

import type { PopoverPlacement } from '../popover/popover-state.svelte.js';

/** A step of a `Tour`. */
export interface TourStep {
	/** The step title. */
	readonly title: string;
	/** The element the step points at: a CSS selector or a function that returns it; the card shows centered without one. */
	readonly target?: string | (() => Element | null | undefined);
	/** More detail below the title. */
	readonly description?: string;
	/** The side of the target the card goes on. Defaults to `bottom`. */
	readonly placement?: PopoverPlacement;
	/** Whether the tour waits for a click on the target instead of offering Next. */
	readonly waitForTap?: boolean;
	/** The space around the target inside the spotlight, in pixels. Defaults to 6. */
	readonly spotlightPadding?: number;
}

/** Runs a `Tour`: the steps, the current one and how it ended. */
export class TourController {
	readonly steps: readonly TourStep[];
	#index = $state<number | null>(null);
	#completed = $state(false);

	/** Creates a controller for `steps`; throws a `RangeError` when there are none. */
	constructor(steps: readonly TourStep[]) {
		if (steps.length === 0) throw new RangeError('A tour needs at least one step');
		this.steps = steps;
	}

	/** The index of the current step, or `null` while the tour isn't running. */
	get index(): number | null {
		return this.#index;
	}

	/** The current step, or `null`. */
	get step(): TourStep | null {
		return this.#index === null ? null : (this.steps[this.#index] ?? null);
	}

	/** Whether the tour is running. */
	get isActive(): boolean {
		return this.#index !== null;
	}

	/** Whether the last run went through every step, instead of being skipped. */
	get completed(): boolean {
		return this.#completed;
	}

	/** Starts the tour at step `index`. */
	start(index = 0): void {
		this.goTo(index);
	}

	/** Shows step `index`; throws a `RangeError` outside the steps. */
	goTo(index: number): void {
		if (index < 0 || index >= this.steps.length)
			throw new RangeError(`step ${index} out of range`);
		this.#index = index;
		this.#completed = false;
	}

	/** Shows the next step, or completes the tour after the last one. */
	next(): void {
		if (this.#index === null) return;
		if (this.#index + 1 < this.steps.length) this.goTo(this.#index + 1);
		else this.#finish(true);
	}

	/** Shows the previous step. */
	previous(): void {
		if (this.#index !== null && this.#index > 0) this.goTo(this.#index - 1);
	}

	/** Ends the tour without completing it. */
	skip(): void {
		this.#finish(false);
	}

	#finish(completed: boolean): void {
		if (this.#index === null) return;
		this.#index = null;
		this.#completed = completed;
	}
}
