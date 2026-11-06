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

import { TreeCollection, type TreeNode } from '../../collections/tree-collection.js';

/** A key and value of a node of a `JsonTreeView`. */
export interface JsonEntry {
	/** The object key or list index, or the root label for the top node. */
	readonly key: string;
	/** The decoded value. */
	readonly value: unknown;
	/** Whether `value` is an object or array that contains this node, shown as a leaf. */
	readonly circular?: boolean;
}

const identifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Returns the text of a value that JSON can't encode, such as `NaN`, a date or `undefined`. */
function plainText(value: unknown): string {
	if (value instanceof Date) return value.toISOString();
	return String(value);
}

/** Returns `value` as JSON text, or its plain text when JSON can't encode it. */
export function jsonValueText(value: unknown): string {
	if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
	if (value instanceof Date) return plainText(value);
	try {
		const text = JSON.stringify(value);
		return text === undefined ? plainText(value) : text;
	} catch {
		return plainText(value);
	}
}

/** Whether `value` is a plain object, which a JSON tree opens as a branch. */
function isRecord(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
	);
}

/**
 * Returns the tree of decoded JSON `data`: objects and arrays become branches, other values
 * leaves, and the top node is labeled `rootLabel`. Node values are JSON paths, such as
 * `$.items[0].name`. An object or array inside itself becomes a `[Circular]` leaf.
 */
export function jsonTree(data: unknown, rootLabel = '$'): TreeCollection<JsonEntry> {
	const child = (parent: string, key: string | number) =>
		typeof key === 'number'
			? `${parent}[${key}]`
			: identifier.test(key)
				? `${parent}.${key}`
				: `${parent}[${JSON.stringify(key)}]`;

	// The objects and arrays on the path from the top node to the one being built.
	const ancestors = new Set<object>();

	const build = (path: string, key: string, value: unknown): TreeNode<JsonEntry> => {
		const data: JsonEntry = { key, value };
		if (Array.isArray(value) || isRecord(value)) {
			if (ancestors.has(value))
				return {
					value: path,
					label: `${key}: [Circular]`,
					data: { key, value, circular: true }
				};
			ancestors.add(value);
			const children = Array.isArray(value)
				? value.map((item, i) => build(child(path, i), String(i), item))
				: Object.entries(value).map(([k, v]) => build(child(path, k), k, v));
			ancestors.delete(value);
			return { value: path, label: key, data, children };
		}
		const text = typeof value === 'string' ? JSON.stringify(value) : jsonValueText(value);
		return { value: path, label: `${key}: ${text}`, data };
	};

	return new TreeCollection([build('$', rootLabel, data)]);
}
