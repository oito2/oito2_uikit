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

const key = Symbol('oito2.steps');

/** The display state of a step. */
export type StepState = 'upcoming' | 'current' | 'completed' | 'error';

/**
 * Returns the state of the step at `index` when `current` is the current step: an error
 * first, then completed, current or upcoming by position.
 */
export function stepState(index: number, current: number, hasError: boolean): StepState {
	if (hasError) return 'error';
	if (index < current) return 'completed';
	if (index === current) return 'current';
	return 'upcoming';
}

/** The options of a `StepsState`. */
export interface StepsOptions {
	current: () => number | undefined;
	defaultCurrent: () => number;
	onChange: (current: number) => void;
	orientation: () => 'horizontal' | 'vertical';
	linear: () => boolean;
	interactive: () => boolean;
}

/** The state a `Steps.Root` shares with its parts: the current step and the step order. */
export class StepsState {
	readonly #options: StepsOptions;
	readonly #current: Controllable<number>;
	#items = $state<symbol[]>([]);

	constructor(options: StepsOptions) {
		this.#options = options;
		this.#current = new Controllable({
			value: options.current,
			defaultValue: options.defaultCurrent,
			onChange: options.onChange
		});
	}

	/** The index of the current step; the step count when all are done. */
	get current(): number {
		return this.#current.current;
	}

	/** The number of steps. */
	get count(): number {
		return this.#items.length;
	}

	/** Whether the steps run in a row or a column. */
	get orientation(): 'horizontal' | 'vertical' {
		return this.#options.orientation();
	}

	/** Whether the step headers move to their step. */
	get interactive(): boolean {
		return this.#options.interactive();
	}

	/** Whether the step at `index` can be moved to. */
	reachable(index: number): boolean {
		return this.interactive && (!this.#options.linear() || index <= this.current);
	}

	/** Moves to the step at `index`, from 0 to the step count (all done). */
	goTo(index: number): void {
		this.#current.current = Math.min(Math.max(0, index), this.count);
	}

	/** Adds a step at the end of the order and returns its key. */
	register(): symbol {
		const item = Symbol('step');
		this.#items = [...untrack(() => this.#items), item];
		return item;
	}

	/** Removes a step from the order. */
	unregister(item: symbol): void {
		this.#items = this.#items.filter((each) => each !== item);
	}

	/** Returns the index of the step with `item`. */
	indexOf(item: symbol): number {
		return this.#items.indexOf(item);
	}
}

/** Publishes the steps state to its parts. */
export function setSteps(state: StepsState): StepsState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Steps.Root`; throws outside one. */
export function useSteps(): StepsState {
	if (!hasContext(key)) throw new Error('Steps parts must be inside a Steps.Root');
	return getContext<StepsState>(key);
}
