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
import type { ListCollection } from '../../collections/list-collection.js';
import { Controllable } from '../../internal/controllable.svelte.js';

const key = Symbol('oito2.combobox');

/** The options of a `ComboboxState`. */
export interface ComboboxOptions<T> {
	id: string;
	collection: () => ListCollection<T>;
	inputValue: () => string | undefined;
	defaultInputValue: () => string;
	onInputChange: (value: string) => void;
	onSelect: () => ((item: T) => void) | undefined;
	showAllWhenEmpty: () => boolean;
	exclude: () => Iterable<string> | undefined;
	disabled: () => boolean;
}

/** The state a `Combobox.Root` shares with its parts. */
export class ComboboxState<T = unknown> {
	readonly #options: ComboboxOptions<T>;
	readonly #text: Controllable<string>;
	/** The id of the suggestion list. */
	readonly listId: string;
	/** Whether the suggestion list is open. */
	open = $state(false);
	/** The value of the highlighted suggestion, or `null`. */
	highlighted = $state<string | null>(null);
	/** The text input. */
	input = $state<HTMLInputElement | null>(null);
	/** The element the list is placed under. */
	anchor = $state<HTMLElement | null>(null);
	/** The suggestion list element. */
	list = $state<HTMLElement | null>(null);
	/** The suggestions for the current text, computed once per change of their inputs. */
	readonly #suggestions = $derived.by((): T[] => {
		const text = this.text.trim();
		if (!text && !this.#options.showAllWhenEmpty()) return [];
		return this.collection.suggestions(text, { exclude: this.#options.exclude() });
	});

	constructor(options: ComboboxOptions<T>) {
		this.#options = options;
		this.listId = `${options.id}-list`;
		this.#text = new Controllable({
			value: options.inputValue,
			defaultValue: options.defaultInputValue,
			onChange: options.onInputChange
		});
	}

	/** The collection of suggestable items. */
	get collection(): ListCollection<T> {
		return this.#options.collection();
	}

	/** The text in the input. */
	get text(): string {
		return this.#text.current;
	}

	set text(value: string) {
		this.#text.current = value;
	}

	/** Whether the combobox can't be used. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/**
	 * The suggestions for the current text: the enabled items whose label contains it,
	 * ignoring case and accents, or every enabled item while it is empty with
	 * `showAllWhenEmpty`; never the excluded values.
	 */
	get options(): T[] {
		return this.#suggestions;
	}

	/** Whether the list shows: open, with suggestions or with text to say none matched. */
	get showsList(): boolean {
		return this.open && (this.options.length > 0 || this.text.trim() !== '');
	}

	/** Returns the id of the option element of `value`. */
	optionId(value: string): string {
		return `${this.listId}-${value.replace(/[^\w-]/g, (char) => `_${char.charCodeAt(0).toString(16)}`)}`;
	}

	/** Moves the highlight `step` suggestions down (or up), wrapping at the ends. */
	move(step: number): void {
		const values = this.options.map((item) => this.collection.getValue(item));
		if (values.length === 0) return;
		const index = this.highlighted === null ? -1 : values.indexOf(this.highlighted);
		const next =
			index < 0
				? step > 0
					? 0
					: values.length - 1
				: (index + step + values.length) % values.length;
		this.highlighted = values[next] ?? null;
		const id = this.highlighted === null ? null : this.optionId(this.highlighted);
		if (id)
			this.list?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ block: 'nearest' });
	}

	/** Picks the item with `value`: fills the input with its label and reports it. */
	pick(value: string): void {
		const item = this.collection.find(value);
		if (item === undefined || this.collection.isDisabled(item)) return;
		this.text = this.collection.getLabel(item);
		this.open = false;
		this.highlighted = null;
		this.#options.onSelect()?.(item);
	}
}

/** Publishes the combobox state to its parts. */
export function setCombobox<T>(state: ComboboxState<T>): ComboboxState<T> {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Combobox.Root`; throws outside one. */
export function useCombobox(): ComboboxState {
	if (!hasContext(key)) throw new Error('Combobox parts must be inside a Combobox.Root');
	return getContext<ComboboxState>(key);
}
