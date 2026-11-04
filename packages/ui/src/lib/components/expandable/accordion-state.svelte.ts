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

const key = Symbol('oito2.accordion');

/** The options of an `AccordionState`. */
export interface AccordionOptions {
	value: () => readonly string[] | undefined;
	defaultValue: () => readonly string[];
	onChange: (value: readonly string[]) => void;
	multiple: () => boolean;
	disabled: () => boolean;
	onItemOpenChange: () => ((value: string, open: boolean) => void) | undefined;
}

/** The state an `Accordion.Root` shares with its items: the values of the open items. */
export class AccordionState {
	readonly #options: AccordionOptions;
	readonly #value: Controllable<readonly string[]>;

	constructor(options: AccordionOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: () => {
				const initial = options.defaultValue();
				return options.multiple() ? initial : initial.slice(0, 1);
			},
			onChange: options.onChange
		});
	}

	/** The values of the open items. */
	get value(): readonly string[] {
		return this.#value.current;
	}

	/** Whether every item is disabled. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** Whether the item with `value` is open. */
	isOpen(value: string): boolean {
		return this.value.includes(value);
	}

	/**
	 * Opens or closes the item with `value`. Unless `multiple`, opening it closes the
	 * others; every item that changes is reported to `onItemOpenChange`, the ones closed
	 * before the one opened.
	 */
	setOpen(value: string, open: boolean): void {
		const current = this.value;
		if (open === current.includes(value)) return;
		const closed = open && !this.#options.multiple() ? current.filter((v) => v !== value) : [];
		this.#value.current = open
			? [...current.filter((v) => !closed.includes(v)), value]
			: current.filter((v) => v !== value);
		const report = this.#options.onItemOpenChange();
		if (!report) return;
		for (const each of closed) report(each, false);
		report(value, open);
	}
}

/** Publishes the accordion state to its items. */
export function setAccordion(state: AccordionState): AccordionState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Accordion.Root`; throws outside one. */
export function useAccordion(): AccordionState {
	if (!hasContext(key)) throw new Error('Accordion items must be inside an Accordion.Root');
	return getContext<AccordionState>(key);
}
