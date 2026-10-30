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

import { foldText } from './text-folding.js';

/** The accessors of a `ListCollection`; every one is optional. */
export interface ListCollectionOptions<T> {
	/**
	 * Returns the unique value of an item. Defaults to the item itself when it is a
	 * string, or its `String()` otherwise.
	 */
	getValue?: (item: T) => string;
	/** Returns the display label of an item. Defaults to its value. */
	getLabel?: (item: T) => string;
	/** Whether an item can't be selected or focused. Defaults to never. */
	isDisabled?: (item: T) => boolean;
	/** Returns the group name of an item, or `null` when it has none. */
	getGroup?: (item: T) => string | null | undefined;
}

/** A group of items of a `ListCollection`; ungrouped items form the group `null`. */
export interface ListGroup<T> {
	readonly group: string | null;
	readonly items: readonly T[];
}

/**
 * An immutable list of items with the accessors a list, select or autocomplete needs: a
 * unique string value, a display label, a disabled flag and an optional group per item.
 *
 * Navigation methods skip disabled items. Methods that change the list return a new
 * collection.
 */
export class ListCollection<T> {
	/** The items, in order. */
	readonly items: readonly T[];

	readonly #options: ListCollectionOptions<T>;
	readonly #getValue: (item: T) => string;
	readonly #indexes = new Map<string, number>();
	#values: readonly string[] | undefined;
	#foldedLabels: readonly string[] | undefined;

	/**
	 * Creates a collection of `items` with the given accessors.
	 *
	 * Throws a `TypeError` when two items share a value.
	 */
	constructor(items: Iterable<T>, options: ListCollectionOptions<T> = {}) {
		this.items = Object.freeze([...items]);
		this.#options = options;
		this.#getValue =
			options.getValue ?? ((item) => (typeof item === 'string' ? item : String(item)));
		this.items.forEach((item, index) => {
			const value = this.#getValue(item);
			if (this.#indexes.has(value)) throw new TypeError(`Duplicate value: ${value}`);
			this.#indexes.set(value, index);
		});
	}

	/** The number of items. */
	get length(): number {
		return this.items.length;
	}

	/** Whether the collection has no items. */
	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	/** The values of every item, in order. */
	get values(): readonly string[] {
		this.#values ??= Object.freeze(this.items.map((item) => this.getValue(item)));
		return this.#values;
	}

	/** The labels folded by `foldText`, in item order. */
	get #folded(): readonly string[] {
		this.#foldedLabels ??= this.items.map((item) => foldText(this.getLabel(item)));
		return this.#foldedLabels;
	}

	/** Returns the unique value of `item`. */
	getValue(item: T): string {
		return this.#getValue(item);
	}

	/** Returns the display label of `item`. */
	getLabel(item: T): string {
		return this.#options.getLabel?.(item) ?? this.#getValue(item);
	}

	/** Whether `item` can't be selected or focused. */
	isDisabled(item: T): boolean {
		return this.#options.isDisabled?.(item) ?? false;
	}

	/** Returns the group of `item`, or `null` when it has none. */
	getGroup(item: T): string | null {
		return this.#options.getGroup?.(item) ?? null;
	}

	/** Whether an item has `value`. */
	has(value: string | null | undefined): boolean {
		return value != null && this.#indexes.has(value);
	}

	/** Returns the index of the item with `value`, or -1 when there is none. */
	indexOf(value: string | null | undefined): number {
		return value == null ? -1 : (this.#indexes.get(value) ?? -1);
	}

	/** Returns the item with `value`, or `undefined` when there is none. */
	find(value: string | null | undefined): T | undefined {
		const index = this.indexOf(value);
		return index < 0 ? undefined : this.items[index];
	}

	/** Whether the item with `value` exists and is enabled. */
	isEnabled(value: string | null | undefined): boolean {
		const index = this.indexOf(value);
		return index >= 0 && !this.isDisabled(this.items[index] as T);
	}

	/** The value of the first enabled item, or `null`. */
	get firstValue(): string | null {
		return this.#scan(-1, 1, false);
	}

	/** The value of the last enabled item, or `null`. */
	get lastValue(): string | null {
		return this.#scan(this.length, -1, false);
	}

	/**
	 * Returns the value of the first enabled item after `value`, or `null` at the end.
	 * With `loop`, the search wraps around to the start. When `value` isn't in the
	 * collection, the search starts before the first item.
	 */
	nextValue(value: string | null | undefined, options: { loop?: boolean } = {}): string | null {
		return this.#scan(this.indexOf(value), 1, options.loop ?? false);
	}

	/**
	 * Returns the value of the first enabled item before `value`, or `null` at the start.
	 * With `loop`, the search wraps around to the end. When `value` isn't in the
	 * collection, the search starts after the last item.
	 */
	previousValue(
		value: string | null | undefined,
		options: { loop?: boolean } = {}
	): string | null {
		const index = this.indexOf(value);
		return this.#scan(index < 0 ? this.length : index, -1, options.loop ?? false);
	}

	/**
	 * Returns the value of the first enabled item found by moving `step` positions at a
	 * time from the index `from`, wrapping around with `loop` and stopping at either end
	 * otherwise.
	 */
	#scan(from: number, step: number, loop: boolean): string | null {
		const length = this.length;
		for (let n = 1; n <= length; n++) {
			let index = from + step * n;
			if (loop) index = ((index % length) + length) % length;
			else if (index < 0 || index >= length) return null;
			const item = this.items[index] as T;
			if (!this.isDisabled(item)) return this.getValue(item);
		}
		return null;
	}

	/**
	 * Returns the value of the first enabled item whose label starts with `query`,
	 * ignoring case and accents, searching after the item with value `from` (from the
	 * first item when `from` is missing or unknown) and wrapping around; `null` when none
	 * matches or `query` is empty. It implements typeahead.
	 */
	search(query: string, options: { from?: string | null } = {}): string | null {
		if (query === '' || this.isEmpty) return null;
		const needle = foldText(query);
		const start = this.indexOf(options.from);
		const length = this.length;
		for (let n = 1; n <= length; n++) {
			const index = (start + n) % length;
			const item = this.items[index] as T;
			if (!this.isDisabled(item) && (this.#folded[index] as string).startsWith(needle)) {
				return this.getValue(item);
			}
		}
		return null;
	}

	/** The items grouped by `getGroup`, in the order each group first appears. */
	get groups(): ListGroup<T>[] {
		const byGroup = new Map<string | null, T[]>();
		for (const item of this.items) {
			const group = this.getGroup(item);
			let list = byGroup.get(group);
			if (!list) byGroup.set(group, (list = []));
			list.push(item);
		}
		return [...byGroup].map(([group, items]) => ({ group, items }));
	}

	/**
	 * Returns a collection of `items` with the same accessors. Throws a `TypeError` when
	 * two of them share a value.
	 */
	copyWith(items: Iterable<T>): ListCollection<T> {
		return new ListCollection(items, this.#options);
	}

	/** Returns a collection of the items for which `test` returns true. */
	where(test: (item: T) => boolean): ListCollection<T> {
		return this.copyWith(this.items.filter(test));
	}

	/** Returns a collection of the items whose label contains `query`, ignoring case and accents. */
	filter(query: string): ListCollection<T> {
		const needle = foldText(query);
		return this.copyWith(
			this.items.filter((_, i) => (this.#folded[i] as string).includes(needle))
		);
	}

	/**
	 * Returns the enabled items whose label contains `query`, ignoring case and accents,
	 * in order, leaving out those whose label is in `exclude`: the suggestions for a text
	 * typed in a field.
	 */
	suggestions(query: string, options: { exclude?: Iterable<string> } = {}): T[] {
		const needle = foldText(query);
		const exclude = new Set(options.exclude);
		return this.items.filter(
			(item, i) =>
				!this.isDisabled(item) &&
				(this.#folded[i] as string).includes(needle) &&
				!exclude.has(this.getLabel(item))
		);
	}

	/**
	 * Returns the collection with the item at `from` moved to `to`. Throws a `RangeError`
	 * when either index is outside the items.
	 */
	reorder(from: number, to: number): ListCollection<T> {
		const check = (index: number, name: string) => {
			if (!Number.isInteger(index) || index < 0 || index >= this.length) {
				throw new RangeError(`${name} out of range: ${index}`);
			}
		};
		check(from, 'from');
		check(to, 'to');
		const list = [...this.items];
		const [moved] = list.splice(from, 1);
		list.splice(to, 0, moved as T);
		return this.copyWith(list);
	}
}
