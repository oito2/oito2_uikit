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

/** The options of a `Controllable`. */
export interface ControllableOptions<T> {
	/** Reads the controlled value: the component's prop, `undefined` when uncontrolled. */
	value: () => T | undefined;
	/** Returns the value of an uncontrolled component before the first change; read once. */
	defaultValue: () => T;
	/** Called with each new value: assigns the bindable prop and calls `on<Name>Change`. */
	onChange?: (value: T) => void;
}

/**
 * A component value that can be controlled (the parent passes `value`, binds it or
 * listens to `on<Name>Change`) or uncontrolled (the component keeps it, starting from
 * `default<Name>`). `current` reads the controlled value when there is one and the
 * component's own otherwise; setting it keeps the own value and reports the change.
 */
export class Controllable<T> {
	readonly #value: () => T | undefined;
	readonly #onChange: ((value: T) => void) | undefined;
	#own: T = $state.raw() as T;

	constructor(options: ControllableOptions<T>) {
		this.#value = options.value;
		this.#onChange = options.onChange;
		this.#own = options.defaultValue();
	}

	/** The current value. */
	get current(): T {
		const value = this.#value();
		return value === undefined ? this.#own : value;
	}

	set current(next: T) {
		if (Object.is(next, this.current)) return;
		this.#own = next;
		this.#onChange?.(next);
	}
}
