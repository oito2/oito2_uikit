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

import type { SelectionMode } from '../../collections/selection-controller.svelte.js';
import { isTreeBranch, type TreeCollection } from '../../collections/tree-collection.js';
import { snapshotSet } from '../../internal/sets.js';

import type { TreeCheckState } from './tree-check.js';

/** The options of a `TreeController`. */
export interface TreeControllerOptions {
	/** How many nodes can be selected. Defaults to `single`. */
	selectionMode?: SelectionMode;
	/** The values of the branches open at first. */
	expanded?: Iterable<string>;
	/** The values of the nodes selected at first; ignored in `none` mode. */
	selected?: Iterable<string>;
	/** The values of the leaves checked at first. */
	checked?: Iterable<string>;
}

/**
 * The open, selected and checked nodes of a `TreeView`, by node value.
 *
 * Its state is reactive: reading it in a template or `$derived` tracks it. Each set is an
 * immutable snapshot that the controller replaces when it changes.
 */
export class TreeController {
	/** How many nodes can be selected. */
	readonly selectionMode: SelectionMode;

	#expanded: ReadonlySet<string> = $state.raw(snapshotSet());
	#selected: ReadonlySet<string> = $state.raw(snapshotSet());
	#checked: ReadonlySet<string> = $state.raw(snapshotSet());

	constructor(options: TreeControllerOptions = {}) {
		this.selectionMode = options.selectionMode ?? 'single';
		this.#expanded = snapshotSet(options.expanded);
		this.#checked = snapshotSet(options.checked);
		if (this.selectionMode !== 'none') {
			const selected = [...(options.selected ?? [])];
			this.#selected = snapshotSet(
				this.selectionMode === 'single' ? selected.slice(0, 1) : selected
			);
		}
	}

	/** The values of the open branches. */
	get expanded(): ReadonlySet<string> {
		return this.#expanded;
	}

	/** The values of the selected nodes. */
	get selected(): ReadonlySet<string> {
		return this.#selected;
	}

	/** The values of the checked leaves. */
	get checked(): ReadonlySet<string> {
		return this.#checked;
	}

	/** Whether the branch `value` is open. */
	isExpanded(value: string): boolean {
		return this.#expanded.has(value);
	}

	/** Whether `value` is selected. */
	isSelected(value: string): boolean {
		return this.#selected.has(value);
	}

	/** Opens the branch `value` when `expanded` is true, or closes it. */
	setExpanded(value: string, expanded: boolean): void {
		if (this.#expanded.has(value) === expanded) return;
		const others = [...this.#expanded].filter((v) => v !== value);
		this.#expanded = snapshotSet(expanded ? [...others, value] : others);
	}

	/** Opens exactly the branches in `values` and closes the others. */
	setExpandedValues(values: Iterable<string>): void {
		this.#expanded = replaced(this.#expanded, values);
	}

	/** Opens every branch of `collection`, keeping the branches already open. */
	expandAll(collection: TreeCollection<unknown>): void {
		this.#expanded = replaced(this.#expanded, [...this.#expanded, ...collection.branchValues]);
	}

	/** Closes every branch. */
	collapseAll(): void {
		this.#expanded = replaced(this.#expanded, []);
	}

	/** Makes `values` the selection: only the first one in single mode, and none in `none` mode. */
	setSelected(values: Iterable<string>): void {
		const list = this.selectionMode === 'none' ? [] : [...values];
		this.#selected = replaced(
			this.#selected,
			this.selectionMode === 'single' ? list.slice(0, 1) : list
		);
	}

	/**
	 * Adds `value` to the selection or removes it, in multiple mode; in the other modes it
	 * behaves as `setSelected` with `value` alone.
	 */
	toggleSelected(value: string): void {
		if (this.selectionMode !== 'multiple') {
			this.setSelected([value]);
			return;
		}
		const others = [...this.#selected].filter((v) => v !== value);
		this.#selected = snapshotSet(this.#selected.has(value) ? others : [...others, value]);
	}

	/**
	 * Returns the check state of `value` in `collection`: true or false, or `mixed` when
	 * only some of a branch's leaves are checked. A branch without leaves is unchecked.
	 */
	checkStateOf(collection: TreeCollection<unknown>, value: string): TreeCheckState {
		const node = collection.find(value);
		if (!node || !isTreeBranch(node)) return this.#checked.has(value);
		const leaves = collection.leavesOf(value);
		if (leaves.length === 0) return false;
		const count = leaves.filter((leaf) => this.#checked.has(leaf)).length;
		return count === 0 ? false : count === leaves.length ? true : 'mixed';
	}

	/**
	 * Checks `value`, or every leaf of a branch, unless already fully checked, in which case
	 * it unchecks them. Does nothing when `collection` has no node `value`.
	 */
	toggleChecked(collection: TreeCollection<unknown>, value: string): void {
		if (!collection.has(value)) return;
		const leaves = collection.leavesOf(value);
		const check = this.checkStateOf(collection, value) !== true;
		const affected = snapshotSet(leaves);
		const others = [...this.#checked].filter((v) => !affected.has(v));
		this.#checked = replaced(this.#checked, check ? [...others, ...leaves] : others);
	}

	/** Replaces the checked leaves with `values`. */
	setChecked(values: Iterable<string>): void {
		this.#checked = replaced(this.#checked, values);
	}
}

/** Returns `current` when it holds exactly `values`, otherwise a new snapshot of them. */
function replaced(current: ReadonlySet<string>, values: Iterable<string>): ReadonlySet<string> {
	const next = snapshotSet(values);
	if (next.size === current.size && [...next].every((v) => current.has(v))) return current;
	return next;
}
