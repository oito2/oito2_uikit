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

import type { TreeCollection } from '../../collections/tree-collection.js';

/** The check state of a tree node: checked, unchecked, or `mixed` when only some of a branch's leaves are checked. */
export type TreeCheckState = boolean | 'mixed';

/**
 * Returns the check state of every node of `collection` in one pass: a leaf is checked when
 * `checked` has it, a branch is checked when all of its leaves are, unchecked when none are
 * or it has no leaves, and `mixed` otherwise.
 */
export function treeCheckStates(
	collection: TreeCollection<unknown>,
	checked: ReadonlySet<string>
): Map<string, TreeCheckState> {
	const states = new Map<string, TreeCheckState>();
	const visit = (node: (typeof collection.roots)[number]): [number, number] => {
		const children = node.children;
		if (!children) {
			const on = checked.has(node.value);
			states.set(node.value, on);
			return [on ? 1 : 0, 1];
		}
		let on = 0;
		let leaves = 0;
		for (const child of children) {
			const [c, l] = visit(child);
			on += c;
			leaves += l;
		}
		states.set(node.value, leaves === 0 || on === 0 ? false : on === leaves ? true : 'mixed');
		return [on, leaves];
	};
	collection.roots.forEach(visit);
	return states;
}
