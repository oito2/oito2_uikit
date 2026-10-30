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
import { Controllable } from '../../internal/controllable.svelte.js';

const key = Symbol('oito2.radio-group');

/** The options of a `RadioGroupState`. */
export interface RadioGroupOptions {
	value: () => string | null | undefined;
	defaultValue: () => string | null;
	onChange: (value: string | null) => void;
	disabled: () => boolean;
	toggleable: () => boolean;
	name: () => string | undefined;
}

/** The state a `RadioGroup.Root` shares with its items. */
export class RadioGroupState {
	readonly #value: Controllable<string | null>;
	readonly #options: RadioGroupOptions;

	constructor(options: RadioGroupOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
	}

	/** The selected value, or `null` when nothing is selected. */
	get value(): string | null {
		return this.#value.current;
	}

	/** Whether the whole group is disabled. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** The form field name. */
	get name(): string | undefined {
		return this.#options.name();
	}

	/**
	 * Selects `value`; activating the selected item clears the group when it is
	 * `toggleable` and does nothing otherwise. Moving focus with the arrows selects without
	 * clearing (`fromKeyboard`).
	 */
	activate(value: string, fromKeyboard = false): void {
		if (value !== this.#value.current) this.#value.current = value;
		else if (!fromKeyboard && this.#options.toggleable()) this.#value.current = null;
	}
}

/** Publishes the radio group state to its items. */
export function setRadioGroup(state: RadioGroupState): void {
	setContext(key, state);
}

/** Returns the state of the enclosing `RadioGroup.Root`; throws outside one. */
export function useRadioGroup(): RadioGroupState {
	if (!hasContext(key)) throw new Error('Radio items must be inside a RadioGroup.Root');
	return getContext<RadioGroupState>(key);
}
