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

/** A node of a `TreeCollection`: a branch when it has `children` (possibly empty), a leaf otherwise. */
export interface TreeNode<T = unknown> {
	/** The unique value of the node in its tree. */
	readonly value: string;
	/** The display label. Defaults to `value`. */
	readonly label?: string;
	/** The payload, such as the file or record the node shows. */
	readonly data?: T;
	/** The child nodes of a branch; absent for a leaf. */
	readonly children?: readonly TreeNode<T>[];
	/** Whether the node can't be selected or focused. */
	readonly disabled?: boolean;
}

/** A node with its depth (0 at the top level) and the index path that leads to it. */
export interface TreeEntry<T = unknown> {
	readonly node: TreeNode<T>;
	readonly depth: number;
	readonly indexPath: readonly number[];
}

/** Returns the display label of `node`: its `label`, or its value. */
export function treeNodeLabel(node: TreeNode<unknown>): string {
	return node.label ?? node.value;
}

/** Whether `node` is a branch, which can have children. */
export function isTreeBranch(node: TreeNode<unknown>): boolean {
	return node.children !== undefined;
}

/**
 * An immutable tree of uniquely valued nodes, with the lookups and edits a tree view, a
 * file explorer or a nested menu needs. Methods that change the tree return a new
 * collection.
 */
export class TreeCollection<T = unknown> {
	/** The top-level nodes. */
	readonly roots: readonly TreeNode<T>[];

	readonly #paths = new Map<string, readonly number[]>();
	readonly #parents = new Map<string, string | null>();

	/** Creates a tree with the top-level `roots`. Throws a `TypeError` when two nodes share a value. */
	constructor(roots: Iterable<TreeNode<T>>) {
		this.roots = Object.freeze([...roots]);
		const index = (
			nodes: readonly TreeNode<T>[],
			path: readonly number[],
			parent: string | null
		) => {
			nodes.forEach((node, i) => {
				const nodePath = Object.freeze([...path, i]);
				if (this.#paths.has(node.value))
					throw new TypeError(`Duplicate value: ${node.value}`);
				this.#paths.set(node.value, nodePath);
				this.#parents.set(node.value, parent);
				index(node.children ?? [], nodePath, node.value);
			});
		};
		index(this.roots, [], null);
	}

	/**
	 * Builds a tree from `paths` split by `separator`, such as file paths: each segment
	 * becomes a branch and the last one a leaf, unless another path continues below it.
	 * Empty segments are skipped. Node values are the paths up to each node, joined by
	 * `separator`, and labels are the segment names.
	 */
	static fromPaths<T = unknown>(paths: Iterable<string>, separator = '/'): TreeCollection<T> {
		const children = new Map<string, string[]>([['', []]]);
		const leaves = new Set<string>();
		for (const path of paths) {
			const parts = path.split(separator).filter((part) => part !== '');
			let parent = '';
			parts.forEach((part, i) => {
				const value = parent === '' ? part : `${parent}${separator}${part}`;
				let siblings = children.get(parent);
				if (!siblings) children.set(parent, (siblings = []));
				if (!siblings.includes(value)) siblings.push(value);
				if (i === parts.length - 1) leaves.add(value);
				if (!children.has(value)) children.set(value, []);
				parent = value;
			});
		}
		const build = (value: string): TreeNode<T> => {
			const kids = children.get(value) ?? [];
			const label = value.split(separator).at(-1) ?? value;
			return kids.length === 0 && leaves.has(value)
				? { value, label }
				: { value, label, children: kids.map(build) };
		};
		return new TreeCollection((children.get('') ?? []).map(build));
	}

	/** Whether a node has `value`. */
	has(value: string | null | undefined): boolean {
		return value != null && this.#paths.has(value);
	}

	/** Returns the index path of the node with `value`, or `undefined` when there is none. */
	indexPathOf(value: string): readonly number[] | undefined {
		return this.#paths.get(value);
	}

	/** Returns the node at `indexPath`, or `undefined` when the path is empty or doesn't exist. */
	nodeAt(indexPath: readonly number[]): TreeNode<T> | undefined {
		let level: readonly TreeNode<T>[] | undefined = this.roots;
		let node: TreeNode<T> | undefined;
		for (const index of indexPath) {
			if (!level || index < 0 || index >= level.length) return undefined;
			node = level[index];
			level = node?.children;
		}
		return node;
	}

	/** Returns the node with `value`, or `undefined` when there is none. */
	find(value: string | null | undefined): TreeNode<T> | undefined {
		const path = value == null ? undefined : this.#paths.get(value);
		return path ? this.nodeAt(path) : undefined;
	}

	/** Returns the value of the parent of `value`, or `null` for a top-level or unknown node. */
	parentOf(value: string): string | null {
		return this.#parents.get(value) ?? null;
	}

	/** Returns the children of `value`; empty for a leaf or a missing node. */
	childrenOf(value: string): readonly TreeNode<T>[] {
		return this.find(value)?.children ?? [];
	}

	/** Returns the nodes that share a parent with `value`, including it; the top-level nodes for an unknown value. */
	siblingsOf(value: string): readonly TreeNode<T>[] {
		const parent = this.parentOf(value);
		return parent === null ? this.roots : this.childrenOf(parent);
	}

	/** Returns the values of the ancestors of `value`, from the top level down. */
	ancestorsOf(value: string): string[] {
		const result: string[] = [];
		for (let p = this.parentOf(value); p !== null; p = this.parentOf(p)) result.unshift(p);
		return result;
	}

	/** Returns the depth of `value`: 0 at the top level, and also 0 for an unknown value. */
	depthOf(value: string): number {
		return (this.#paths.get(value)?.length ?? 1) - 1;
	}

	/** Returns every node in depth-first order with its depth and index path. */
	flatten(): TreeEntry<T>[] {
		return this.#flatten(null);
	}

	/** Returns the nodes a tree view shows when the branches in `expanded` are open, in display order. */
	visible(expanded: ReadonlySet<string>): TreeEntry<T>[] {
		return this.#flatten(expanded);
	}

	/** Returns the nodes in depth-first order, descending only into the branches in `expanded`, or into every branch when it is `null`. */
	#flatten(expanded: ReadonlySet<string> | null): TreeEntry<T>[] {
		const result: TreeEntry<T>[] = [];
		const walk = (nodes: readonly TreeNode<T>[], path: readonly number[]) => {
			nodes.forEach((node, i) => {
				const indexPath = [...path, i];
				result.push({ node, depth: path.length, indexPath });
				if (expanded === null || expanded.has(node.value))
					walk(node.children ?? [], indexPath);
			});
		};
		walk(this.roots, []);
		return result;
	}

	/** The values of every node, in depth-first order. */
	get values(): string[] {
		return this.flatten().map((entry) => entry.node.value);
	}

	/** The values of every branch. */
	get branchValues(): string[] {
		return this.flatten()
			.filter((entry) => isTreeBranch(entry.node))
			.map((entry) => entry.node.value);
	}

	/** Returns the values of every node below `value`, in depth-first order. */
	descendantsOf(value: string): string[] {
		const result: string[] = [];
		const walk = (nodes: readonly TreeNode<T>[]) => {
			for (const node of nodes) {
				result.push(node.value);
				walk(node.children ?? []);
			}
		};
		walk(this.childrenOf(value));
		return result;
	}

	/**
	 * Returns the values of the leaves below `value`, or `value` itself when it is a leaf;
	 * empty for an unknown value. Empty branches don't count as leaves.
	 */
	leavesOf(value: string): string[] {
		const node = this.find(value);
		if (!node) return [];
		if (!isTreeBranch(node)) return [value];
		return this.descendantsOf(value).filter((v) => {
			const found = this.find(v);
			return found !== undefined && !isTreeBranch(found);
		});
	}

	/**
	 * Returns the value of the enabled visible node after `value` for the `expanded`
	 * branches, or `null` at the end or when `value` isn't visible.
	 */
	nextVisible(value: string, expanded: ReadonlySet<string>): string | null {
		return this.#step(value, expanded, 1);
	}

	/**
	 * Returns the value of the enabled visible node before `value` for the `expanded`
	 * branches, or `null` at the start or when `value` isn't visible.
	 */
	previousVisible(value: string, expanded: ReadonlySet<string>): string | null {
		return this.#step(value, expanded, -1);
	}

	#step(value: string, expanded: ReadonlySet<string>, step: number): string | null {
		const list = this.visible(expanded);
		let index = list.findIndex((entry) => entry.node.value === value);
		if (index < 0) return null;
		for (index += step; index >= 0 && index < list.length; index += step) {
			const node = (list[index] as TreeEntry<T>).node;
			if (!node.disabled) return node.value;
		}
		return null;
	}

	/**
	 * Returns a tree with the nodes for which `test` returns true and their ancestors. A
	 * matching node keeps all its descendants; a branch that doesn't match is kept, with
	 * only its matching descendants, when any of them matches.
	 */
	filter(test: (node: TreeNode<T>) => boolean): TreeCollection<T> {
		const keep = (nodes: readonly TreeNode<T>[]): TreeNode<T>[] =>
			nodes.flatMap((node) => {
				if (test(node)) return [node];
				const kids = keep(node.children ?? []);
				return kids.length > 0 ? [{ ...node, children: kids }] : [];
			});
		return new TreeCollection(keep(this.roots));
	}

	/**
	 * Returns a tree with the nodes whose label contains `query`, ignoring case and
	 * accents, and their ancestors, as `filter` keeps them.
	 */
	search(query: string): TreeCollection<T> {
		const needle = foldText(query);
		return this.filter((node) => foldText(treeNodeLabel(node)).includes(needle));
	}

	/**
	 * Returns a tree with `nodes` inserted among the children of `parentValue` (the top
	 * level when `null`) at `index`, or at the end when `index` is omitted. Inserting into
	 * a leaf turns it into a branch.
	 *
	 * Throws a `TypeError` when `parentValue` isn't in the tree or a value of `nodes` is
	 * already used, and a `RangeError` when `index` is outside 0 to the number of children.
	 */
	insert(
		parentValue: string | null,
		nodes: readonly TreeNode<T>[],
		options: { index?: number } = {}
	): TreeCollection<T> {
		if (parentValue !== null && !this.has(parentValue)) {
			throw new TypeError(`Unknown node: ${parentValue}`);
		}
		const into = (list: readonly TreeNode<T>[]) => {
			const index = options.index ?? list.length;
			if (!Number.isInteger(index) || index < 0 || index > list.length) {
				throw new RangeError(`index out of range: ${index}`);
			}
			return [...list.slice(0, index), ...nodes, ...list.slice(index)];
		};
		if (parentValue === null) return new TreeCollection(into(this.roots));
		return this.#mapNode(parentValue, (node) => ({
			...node,
			children: into(node.children ?? [])
		}));
	}

	/** Returns a tree without the nodes in `values` and their descendants; unknown values are ignored. */
	remove(values: Iterable<string>): TreeCollection<T> {
		const set = new Set(values);
		const prune = (nodes: readonly TreeNode<T>[]): TreeNode<T>[] =>
			nodes
				.filter((node) => !set.has(node.value))
				.map((node) =>
					node.children ? { ...node, children: prune(node.children) } : node
				);
		return new TreeCollection(prune(this.roots));
	}

	/**
	 * Returns a tree with the nodes in `values` moved, in tree order, among the children of
	 * `parentValue` (the top level when `null`) at `index`, or at the end when `index` is
	 * omitted. `index` counts the children left after the moved nodes are taken out. A
	 * moved node brings its descendants along, and unknown values are ignored.
	 *
	 * Throws a `TypeError` when `parentValue` isn't in the tree, or is one of the moved
	 * nodes or a descendant of one, and a `RangeError` when `index` is out of range.
	 */
	move(
		values: Iterable<string>,
		parentValue: string | null,
		options: { index?: number } = {}
	): TreeCollection<T> {
		const set = new Set(values);
		if (parentValue !== null) {
			if (!this.has(parentValue)) throw new TypeError(`Unknown node: ${parentValue}`);
			if (set.has(parentValue) || this.ancestorsOf(parentValue).some((v) => set.has(v))) {
				throw new TypeError('A node cannot move into itself or its descendants');
			}
		}
		const moved = this.flatten()
			.filter(
				(entry) =>
					set.has(entry.node.value) &&
					!this.ancestorsOf(entry.node.value).some((v) => set.has(v))
			)
			.map((entry) => entry.node);
		return this.remove(set).insert(parentValue, moved, options);
	}

	/**
	 * Returns a tree with the node `value` replaced by `replacement`, or an equal tree when
	 * `value` is unknown. Throws a `TypeError` when `replacement` brings a value already
	 * used elsewhere in the tree.
	 */
	replace(value: string, replacement: TreeNode<T>): TreeCollection<T> {
		return this.#mapNode(value, () => replacement);
	}

	#mapNode(value: string, change: (node: TreeNode<T>) => TreeNode<T>): TreeCollection<T> {
		const map = (nodes: readonly TreeNode<T>[]): TreeNode<T>[] =>
			nodes.map((node) => {
				if (node.value === value) return change(node);
				return node.children ? { ...node, children: map(node.children) } : node;
			});
		return new TreeCollection(map(this.roots));
	}
}
