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

import { getContext, hasContext, setContext, tick } from 'svelte';
import type { ListCollection } from '../../collections/list-collection.js';
import type { SelectionController } from '../../collections/selection-controller.svelte.js';
import { Typeahead } from '../../internal/typeahead.js';

const key = Symbol('oito2.list-box');

/** The options of a `ListBoxState`. */
export interface ListBoxOptions<T> {
	id: string;
	collection: () => ListCollection<T>;
	controller: () => SelectionController<T>;
	onActivate: () => ((item: T) => void) | undefined;
}

/**
 * The state a `ListBox.Root` shares with its parts: the active row, which the arrow keys
 * move, and the selection gestures of the keyboard and the pointer.
 */
export class ListBoxState<T = unknown> {
	readonly id: string;
	readonly #options: ListBoxOptions<T>;
	readonly #typeahead = new Typeahead();
	/** The value of the active row, or `null` before the list is used. */
	active: string | null = $state(null);
	/** Whether the list has the focus. */
	focused = $state(false);
	/** Whether the last interaction came from the keyboard, which shows the active row. */
	keyboard = $state(false);

	constructor(options: ListBoxOptions<T>) {
		this.id = options.id;
		this.#options = options;
	}

	/** The items. */
	get collection(): ListCollection<T> {
		return this.#options.collection();
	}

	/** The selection over the items. */
	get controller(): SelectionController<T> {
		return this.#options.controller();
	}

	/** Whether several items can be selected. */
	get multiple(): boolean {
		return this.controller.mode === 'multiple';
	}

	/** Returns the id of the row of `value`. */
	optionId(value: string): string {
		return `${this.id}-option-${this.collection.indexOf(value)}`;
	}

	/** Makes the first selected or enabled row active when the list gains focus without one. */
	focus(): void {
		this.focused = true;
		if (this.active === null || !this.collection.has(this.active)) {
			this.active = this.controller.firstSelectedValue ?? this.collection.firstValue;
		}
	}

	/**
	 * Makes `value` the active row and scrolls it into view; a single-selection list also
	 * selects it, and a multiple one with `extend` extends the selection from the anchor.
	 */
	activate(value: string | null, extend = false): void {
		if (value === null) return;
		const anchor = this.controller.anchorValue ?? this.active;
		this.active = value;
		if (!this.multiple) this.controller.replace(value);
		else if (extend && anchor !== null) this.controller.extend(anchor, value);
		const id = this.optionId(value);
		void tick().then(() =>
			document.getElementById(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		);
	}

	/** Handles navigation, selection, activation and type-ahead keys; returns whether it used the key. */
	keydown(event: KeyboardEvent): boolean {
		this.keyboard = true;
		if (event.altKey) return false;
		const collection = this.collection;
		const command = event.ctrlKey || event.metaKey;
		const active = this.active;
		switch (event.key) {
			case 'ArrowDown':
				this.activate(
					active === null
						? collection.firstValue
						: (collection.nextValue(active) ?? active),
					event.shiftKey
				);
				return true;
			case 'ArrowUp':
				this.activate(
					active === null
						? collection.lastValue
						: (collection.previousValue(active) ?? active),
					event.shiftKey
				);
				return true;
			case 'Home':
				this.activate(collection.firstValue, event.shiftKey);
				return true;
			case 'End':
				this.activate(collection.lastValue, event.shiftKey);
				return true;
			case ' ':
				if (!this.multiple || active === null) return false;
				this.controller.toggle(active);
				return true;
			case 'Enter': {
				const item = collection.find(active);
				if (item === undefined || collection.isDisabled(item)) return false;
				this.#options.onActivate()?.(item);
				return true;
			}
		}
		if ((event.key === 'a' || event.key === 'A') && command && this.multiple) {
			this.controller.selectAll();
			return true;
		}
		if (event.key.length !== 1 || event.key.trim() === '' || command) return false;
		const match = this.#typeahead.type(event.key, active, (query, from) =>
			collection.search(query, { from })
		);
		if (match !== null) this.activate(match);
		return true;
	}

	/** Activates the row of `value` and applies a click with the pressed Shift, Control or Command keys. */
	click(value: string, event: MouseEvent): void {
		if (!this.collection.isEnabled(value)) return;
		this.keyboard = false;
		this.active = value;
		this.controller.click(value, {
			extend: event.shiftKey,
			toggle: event.ctrlKey || event.metaKey
		});
	}

	/** Calls `onActivate` with the item of `value` when it is enabled. */
	activateItem(value: string): void {
		const item = this.collection.find(value);
		if (item !== undefined && !this.collection.isDisabled(item))
			this.#options.onActivate()?.(item);
	}
}

/** Publishes a list box state to its parts. */
export function setListBox<T>(state: ListBoxState<T>): ListBoxState<T> {
	setContext(key, state);
	return state;
}

/** Returns the state of the enclosing `ListBox.Root`; throws outside one. */
export function useListBox(): ListBoxState {
	if (!hasContext(key)) throw new Error('ListBox parts must be inside a ListBox.Root');
	return getContext<ListBoxState>(key);
}

const groupKey = Symbol('oito2.list-box-group');

/** Publishes the id of a group's label to its `ListBox.GroupLabel`. */
export function setListBoxGroup(labelId: string): void {
	setContext(groupKey, labelId);
}

/** Returns the label id of the enclosing `ListBox.Group`, or `undefined` outside one. */
export function useListBoxGroup(): string | undefined {
	return hasContext(groupKey) ? getContext<string>(groupKey) : undefined;
}
