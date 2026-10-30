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

import { snapshotSet } from '../internal/sets.js';
import type { ListCollection } from './list-collection.js';

/** How many items a `SelectionController` can select: none, one at most, or any number. */
export type SelectionMode = 'none' | 'single' | 'multiple';

/** The options of a `SelectionController`. */
export interface SelectionControllerOptions {
	/** How many items can be selected. Defaults to `single`. */
	mode?: SelectionMode;
	/**
	 * Whether a selected item can be deselected by clicking it again in single mode, or by
	 * toggling it. Defaults to true.
	 */
	deselectable?: boolean;
	/**
	 * Whether replacing the collection clears the selection; otherwise only the values
	 * that left it are dropped. Defaults to false.
	 */
	resetOnCollectionChange?: boolean;
	/**
	 * The values selected at first. Values that `canSelect` rejects are dropped, and in
	 * single mode only the first remaining value in collection order is kept.
	 */
	initialValues?: Iterable<string>;
}

/**
 * The selected values of a `ListCollection`, with the desktop selection gestures: plain
 * click, Control/Command click to toggle and Shift click to extend a range from the
 * anchor.
 *
 * Its state is reactive: reading it in a template or `$derived` tracks it, and it only
 * changes when the selection really changes. Disabled items and values outside the
 * collection are never selected; `selectedValues` keeps the collection order.
 */
export class SelectionController<T = unknown> {
	/** How many items can be selected. */
	readonly mode: SelectionMode;

	/** Whether a selected item can be deselected. */
	readonly deselectable: boolean;

	/** Whether replacing the collection clears the selection. */
	readonly resetOnCollectionChange: boolean;

	#collection: ListCollection<T> = $state.raw() as ListCollection<T>;
	#selected: ReadonlySet<string> = $state.raw(snapshotSet());
	#anchor: string | null = $state(null);

	/** The selected values, in collection order. */
	readonly selectedValues: readonly string[] = $derived.by(() => {
		const collection = this.#collection;
		return Object.freeze(
			[...this.#selected].sort((a, b) => collection.indexOf(a) - collection.indexOf(b))
		);
	});

	constructor(collection: ListCollection<T>, options: SelectionControllerOptions = {}) {
		this.mode = options.mode ?? 'single';
		this.deselectable = options.deselectable ?? true;
		this.resetOnCollectionChange = options.resetOnCollectionChange ?? false;
		this.#collection = collection;
		const initial = [...(options.initialValues ?? [])].filter((value) => this.canSelect(value));
		if (this.mode === 'single' && initial.length > 1) {
			initial.sort((a, b) => collection.indexOf(a) - collection.indexOf(b));
			initial.length = 1;
		}
		this.#selected = snapshotSet(initial);
	}

	/**
	 * The collection the values belong to. Setting it clears the selection when
	 * `resetOnCollectionChange`, otherwise drops the values that are no longer enabled
	 * items, and forgets the anchor when its item is gone.
	 */
	get collection(): ListCollection<T> {
		return this.#collection;
	}

	set collection(value: ListCollection<T>) {
		this.#collection = value;
		if (this.resetOnCollectionChange) this.#set([]);
		else this.#set([...this.#selected].filter((v) => value.isEnabled(v)));
		if (!value.has(this.#anchor)) this.#anchor = null;
	}

	/** Whether nothing is selected. */
	get isEmpty(): boolean {
		return this.#selected.size === 0;
	}

	/** The first selected value in collection order, or `null`. */
	get firstSelectedValue(): string | null {
		return this.selectedValues[0] ?? null;
	}

	/** The last selected value in collection order, or `null`. */
	get lastSelectedValue(): string | null {
		return this.selectedValues.at(-1) ?? null;
	}

	/** The value range selections extend from: the last value selected by `select`, `toggle` or `replace`. */
	get anchorValue(): string | null {
		return this.#anchor;
	}

	/** Whether `value` is selected. */
	isSelected(value: string | null | undefined): boolean {
		return value != null && this.#selected.has(value);
	}

	/** Whether `value` can be selected: it is an enabled item and the mode allows selection. */
	canSelect(value: string): boolean {
		return this.mode !== 'none' && this.#collection.isEnabled(value);
	}

	/** Whether every enabled item is selected. */
	get isAllSelected(): boolean {
		const enabled = this.#collection.values.filter((v) => this.#collection.isEnabled(v));
		return enabled.length > 0 && enabled.every((v) => this.#selected.has(v));
	}

	/** Whether some, but not all, enabled items are selected; drives a mixed "select all" check box. */
	get isSomeSelected(): boolean {
		return this.#selected.size > 0 && !this.isAllSelected;
	}

	/**
	 * Selects `value` and makes it the anchor; does nothing when `canSelect` rejects it.
	 * In multiple mode it adds `value` to the selection. In single mode it replaces the
	 * selection; selecting the selected value again deselects it when `deselectable` and
	 * `forceToggle` are set.
	 */
	select(value: string, options: { forceToggle?: boolean } = {}): void {
		if (!this.canSelect(value)) return;
		this.#anchor = value;
		if (this.mode === 'single') {
			if (this.#selected.has(value)) {
				if (options.forceToggle && this.deselectable) this.#set([]);
				return;
			}
			this.#set([value]);
		} else {
			this.#set([...this.#selected, value]);
		}
	}

	/** Deselects `value`. */
	deselect(value: string): void {
		this.#set([...this.#selected].filter((v) => v !== value));
	}

	/**
	 * Selects `value` when it isn't selected, otherwise deselects it if `deselectable`.
	 * `value` becomes the anchor when the selection changes.
	 */
	toggle(value: string): void {
		if (this.#selected.has(value)) {
			if (!this.deselectable) return;
			this.#anchor = value;
			this.deselect(value);
		} else {
			this.select(value);
		}
	}

	/**
	 * Makes `value` the only selected value and the anchor; `null` clears the selection.
	 * Does nothing when `canSelect` rejects `value`.
	 */
	replace(value: string | null): void {
		if (value !== null && !this.canSelect(value)) return;
		this.#anchor = value;
		this.#set(value === null ? [] : [value]);
	}

	/** Replaces the selection with `values`, changing the state only when it differs. */
	#set(values: Iterable<string>): void {
		const next = snapshotSet(values);
		const current = this.#selected;
		if (next.size === current.size && [...next].every((v) => current.has(v))) return;
		this.#selected = next;
	}

	/**
	 * Selects the enabled values from `anchorValue` to `targetValue`, both included,
	 * replacing the previous selection and keeping `anchorValue` as the anchor. Does
	 * nothing when either value isn't in the collection. In single and none modes it
	 * behaves as `select` with `targetValue`.
	 */
	extend(anchorValue: string, targetValue: string): void {
		if (this.mode !== 'multiple') {
			this.select(targetValue);
			return;
		}
		let from = this.#collection.indexOf(anchorValue);
		let to = this.#collection.indexOf(targetValue);
		if (from < 0 || to < 0) return;
		if (from > to) [from, to] = [to, from];
		this.#set(this.#collection.values.slice(from, to + 1).filter((v) => this.canSelect(v)));
		this.#anchor = anchorValue;
	}

	/**
	 * Applies a pointer click on `value` with the desktop conventions: `extend` (Shift)
	 * selects the range from the anchor, `toggle` (Control or Command) toggles the value,
	 * and a plain click selects only it. `extend` and `toggle` apply in multiple mode only;
	 * in single mode a click on the selected value deselects it when `deselectable`.
	 */
	click(value: string, options: { extend?: boolean; toggle?: boolean } = {}): void {
		const anchor = this.#anchor;
		if (options.extend && anchor !== null && this.mode === 'multiple') {
			this.extend(anchor, value);
		} else if (options.toggle && this.mode === 'multiple') {
			this.toggle(value);
		} else if (this.mode === 'single') {
			this.select(value, { forceToggle: true });
		} else {
			this.replace(value);
		}
	}

	/** Selects every enabled item; does nothing outside multiple mode. */
	selectAll(): void {
		if (this.mode !== 'multiple') return;
		this.#set([...this.#selected, ...this.#collection.values.filter((v) => this.canSelect(v))]);
	}

	/** Deselects everything. */
	clear(): void {
		this.#set([]);
	}

	/**
	 * Replaces the selection with `values`, keeping only the selectable ones (and the
	 * first of them in single mode). The last of them becomes the anchor of Shift ranges.
	 */
	setSelectedValues(values: Iterable<string>): void {
		const valid = [...values].filter((v) => this.canSelect(v));
		const next = this.mode === 'single' ? valid.slice(0, 1) : valid;
		this.#anchor = next.at(-1) ?? null;
		this.#set(next);
	}
}
