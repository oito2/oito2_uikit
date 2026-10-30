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
import { SvelteMap } from 'svelte/reactivity';
import type { ListCollection } from '../../collections/list-collection.js';
import { Controllable } from '../../internal/controllable.svelte.js';
import type { InitialFocus } from '../menu/menu-state.svelte.js';

const key = Symbol('oito2.select');

/** The options of a `SelectState`. */
export interface SelectOptions {
	value: () => string | null | undefined;
	defaultValue: () => string | null;
	onValueChange: (value: string | null) => void;
	disabled: () => boolean;
	collection: () => ListCollection<unknown> | undefined;
	id: string;
}

/** The state a `Select.Root` shares with its parts. */
export class SelectState {
	readonly id: string;
	readonly #value: Controllable<string | null>;
	readonly #options: SelectOptions;
	open = $state(false);
	initialFocus: InitialFocus = 'first';
	trigger: HTMLElement | null = $state(null);
	/** The id of the trigger, which names the list of options. */
	triggerId = $state('');
	content: HTMLElement | null = $state(null);
	/** The labels of the options rendered so far, by value. */
	readonly labels = new SvelteMap<string, string>();

	constructor(options: SelectOptions) {
		this.id = options.id;
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onValueChange
		});
	}

	/** The selected value, or `null`. */
	get value(): string | null {
		return this.#value.current;
	}

	/** Whether the select can't be used. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** The collection the options come from, when the select was given one. */
	get collection(): ListCollection<unknown> | undefined {
		return this.#options.collection();
	}

	/** The label of the selected option, or `null`. */
	get selectedLabel(): string | null {
		const value = this.value;
		if (value === null) return null;
		const collection = this.collection;
		const item = collection?.find(value);
		if (collection && item !== undefined) return collection.getLabel(item);
		return this.labels.get(value) ?? null;
	}

	/** Selects `value`. */
	select(value: string): void {
		this.#value.current = value;
	}

	/** Opens the list, focusing the selected option or `focus`. */
	show(focus: InitialFocus = 'first'): void {
		if (this.disabled) return;
		this.initialFocus = focus;
		this.open = true;
	}
}

/** Publishes a select state to its parts. */
export function setSelect(state: SelectState): void {
	setContext(key, state);
}

/** Returns the state of the enclosing `Select.Root`; throws outside one. */
export function useSelect(): SelectState {
	if (!hasContext(key)) throw new Error('Select parts must be inside a Select.Root');
	return getContext<SelectState>(key);
}
