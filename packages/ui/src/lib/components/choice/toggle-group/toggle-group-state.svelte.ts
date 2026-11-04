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

import { getContext, hasContext, setContext } from 'svelte';
import { Controllable } from '../../../internal/controllable.svelte.js';

const key = Symbol('oito2.toggle-group');

/** The options of a `ToggleGroupState`. */
export interface ToggleGroupOptions {
	value: () => readonly string[] | undefined;
	defaultValue: () => readonly string[];
	onChange: (value: readonly string[]) => void;
	multiple: () => boolean;
	deselectable: () => boolean;
	disabled: () => boolean;
}

/**
 * Returns the values that are on after toggling `value`: with `multiple` it turns on or
 * off by itself; otherwise turning it on turns the others off, and turning the only one
 * off is allowed only when `deselectable`. Returns `null` when nothing changes.
 */
export function toggleValues(
	current: readonly string[],
	value: string,
	multiple: boolean,
	deselectable: boolean
): readonly string[] | null {
	const on = current.includes(value);
	if (multiple) return on ? current.filter((v) => v !== value) : [...current, value];
	if (on) return deselectable ? [] : null;
	return [value];
}

/** The state a `ToggleGroup.Root` shares with its items. */
export class ToggleGroupState {
	readonly #options: ToggleGroupOptions;
	readonly #value: Controllable<readonly string[]>;

	constructor(options: ToggleGroupOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
	}

	/** The values of the items that are on. */
	get value(): readonly string[] {
		return this.#value.current;
	}

	/** Whether every item is disabled. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** Turns the item with `value` on or off. */
	toggle(value: string): void {
		const next = toggleValues(
			this.value,
			value,
			this.#options.multiple(),
			this.#options.deselectable()
		);
		if (next) this.#value.current = next;
	}
}

/** Publishes the toggle group state to its items. */
export function setToggleGroup(state: ToggleGroupState): ToggleGroupState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `ToggleGroup.Root`; throws outside one. */
export function useToggleGroup(): ToggleGroupState {
	if (!hasContext(key)) throw new Error('Toggle items must be inside a ToggleGroup.Root');
	return getContext<ToggleGroupState>(key);
}
