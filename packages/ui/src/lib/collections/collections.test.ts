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

import { describe, expect, it } from 'vitest';
import { ListCollection } from './list-collection.js';
import { foldText, foldTextWithOffsets } from './text-folding.js';
import { TreeCollection, treeNodeLabel } from './tree-collection.js';

interface Fruit {
	id: string;
	name: string;
	group: string;
	disabled: boolean;
}

const fruits = new ListCollection<Fruit>(
	[
		{ id: 'apple', name: 'Apple', group: 'Pome', disabled: false },
		{ id: 'banana', name: 'Banana', group: 'Berry', disabled: true },
		{ id: 'cherry', name: 'Cherry', group: 'Drupe', disabled: false },
		{ id: 'pear', name: 'Pêra', group: 'Pome', disabled: false },
		{ id: 'plum', name: 'Plum', group: 'Drupe', disabled: false }
	],
	{
		getValue: (f) => f.id,
		getLabel: (f) => f.name,
		isDisabled: (f) => f.disabled,
		getGroup: (f) => f.group
	}
);

describe('foldText', () => {
	it('lower-cases and strips accents', () => {
		expect(foldText('Pêra Ação')).toBe('pera acao');
		expect(foldText('Straße')).toBe('strasse');
		// A decomposed accent is dropped as a combining mark.
		expect(foldText('Pêra')).toBe('pera');
	});

	it('maps folded units back to the original text', () => {
		expect(foldTextWithOffsets('ßa')).toEqual({ folded: 'ssa', starts: [0, 0, 1, 2] });
	});
});

describe('ListCollection', () => {
	it('looks items up by value', () => {
		expect(fruits.length).toBe(5);
		expect(fruits.values).toEqual(['apple', 'banana', 'cherry', 'pear', 'plum']);
		expect(fruits.find('cherry')?.name).toBe('Cherry');
		expect(fruits.indexOf('pear')).toBe(3);
		expect(fruits.has('kiwi')).toBe(false);
		expect(fruits.getLabel(fruits.items[0] as Fruit)).toBe('Apple');
		expect(fruits.isEnabled('banana')).toBe(false);
	});

	it('uses strings as their own value and label', () => {
		const list = new ListCollection(['a', 'b']);
		expect(list.getValue('a')).toBe('a');
		expect(list.getLabel('b')).toBe('b');
	});

	it('skips disabled items when navigating', () => {
		expect(fruits.firstValue).toBe('apple');
		expect(fruits.lastValue).toBe('plum');
		expect(fruits.nextValue('apple')).toBe('cherry');
		expect(fruits.previousValue('cherry')).toBe('apple');
		expect(fruits.nextValue('plum')).toBeNull();
		expect(fruits.nextValue('plum', { loop: true })).toBe('apple');
		expect(fruits.previousValue('apple', { loop: true })).toBe('plum');
	});

	it('searches ignoring case and accents, wrapping around', () => {
		expect(fruits.search('p')).toBe('pear');
		expect(fruits.search('p', { from: 'pear' })).toBe('plum');
		expect(fruits.search('p', { from: 'plum' })).toBe('pear');
		expect(fruits.search('PERA')).toBe('pear');
		expect(fruits.search('b')).toBeNull();
	});

	it('keeps groups in the order they first appear', () => {
		expect(fruits.groups.map((g) => g.group)).toEqual(['Pome', 'Berry', 'Drupe']);
		expect(fruits.groups[0]?.items.map((f) => f.id)).toEqual(['apple', 'pear']);
	});

	it('filters and reorders into new collections', () => {
		expect(fruits.filter('er').values).toEqual(['cherry', 'pear']);
		expect(fruits.reorder(0, 4).values).toEqual(['banana', 'cherry', 'pear', 'plum', 'apple']);
		expect(fruits.values[0]).toBe('apple');
	});

	it('rejects duplicate values and reorders within range', () => {
		expect(() => new ListCollection(['a', 'a'])).toThrow(TypeError);
		expect(() => new ListCollection(['a', 'b']).reorder(0, 5)).toThrow(RangeError);
	});

	it('suggests enabled matches, leaving out excluded labels', () => {
		expect(fruits.suggestions('p').map((f) => f.id)).toEqual(['apple', 'pear', 'plum']);
		expect(fruits.suggestions('pe', { exclude: ['Pêra'] })).toEqual([]);
		expect(fruits.suggestions('BAN')).toEqual([]);
	});

	it('reads options without own accessors as defaults', () => {
		const list = new ListCollection([1, 2], {});
		expect(list.values).toEqual(['1', '2']);
	});
});

describe('TreeCollection', () => {
	const tree = TreeCollection.fromPaths([
		'src/app.dart',
		'src/widgets/button.dart',
		'src/widgets/field.dart',
		'test/app_test.dart',
		'README.md'
	]);

	it('builds branches and leaves from paths', () => {
		expect(tree.roots.map((n) => n.value)).toEqual(['src', 'test', 'README.md']);
		expect(tree.find('src/widgets')?.children).toBeDefined();
		expect(tree.find('src/app.dart')?.children).toBeUndefined();
		expect(tree.find('src/widgets/field.dart')?.label).toBe('field.dart');
	});

	it('rejects duplicate values and lists leaves', () => {
		expect(() => new TreeCollection([{ value: 'a' }, { value: 'a' }])).toThrow(TypeError);
		expect(tree.leavesOf('src')).toEqual([
			'src/app.dart',
			'src/widgets/button.dart',
			'src/widgets/field.dart'
		]);
		expect(tree.leavesOf('README.md')).toEqual(['README.md']);
		expect(tree.leavesOf('missing')).toEqual([]);
	});

	it('answers parents, siblings, ancestors and depth', () => {
		expect(tree.parentOf('src/widgets/button.dart')).toBe('src/widgets');
		expect(tree.parentOf('src')).toBeNull();
		expect(tree.ancestorsOf('src/widgets/field.dart')).toEqual(['src', 'src/widgets']);
		expect(tree.depthOf('src/widgets/field.dart')).toBe(2);
		expect(tree.indexPathOf('src/widgets/field.dart')).toEqual([0, 1, 1]);
		expect(tree.nodeAt([0, 1, 1])?.value).toBe('src/widgets/field.dart');
		expect(tree.siblingsOf('test').map((n) => n.value)).toEqual(['src', 'test', 'README.md']);
		expect(tree.descendantsOf('src')).toEqual([
			'src/app.dart',
			'src/widgets',
			'src/widgets/button.dart',
			'src/widgets/field.dart'
		]);
		expect(tree.branchValues).toEqual(['src', 'src/widgets', 'test']);
	});

	it('lists and walks the visible nodes of expanded branches', () => {
		const expanded = new Set(['src']);
		expect(tree.visible(expanded).map((e) => e.node.value)).toEqual([
			'src',
			'src/app.dart',
			'src/widgets',
			'test',
			'README.md'
		]);
		expect(tree.nextVisible('src/widgets', expanded)).toBe('test');
		expect(tree.previousVisible('test', expanded)).toBe('src/widgets');
		expect(tree.nextVisible('README.md', expanded)).toBeNull();
	});

	it('skips disabled nodes when walking', () => {
		const small = new TreeCollection([
			{ value: 'a' },
			{ value: 'b', disabled: true },
			{ value: 'c' }
		]);
		expect(small.nextVisible('a', new Set())).toBe('c');
	});

	it('keeps the ancestors of matches when filtering', () => {
		expect(tree.search('FIELD').values).toEqual([
			'src',
			'src/widgets',
			'src/widgets/field.dart'
		]);
	});

	it('inserts, removes, moves and replaces into new trees', () => {
		const inserted = tree.insert('test', [{ value: 'test/widget_test.dart' }], { index: 0 });
		expect(inserted.childrenOf('test').map((n) => n.value)).toEqual([
			'test/widget_test.dart',
			'test/app_test.dart'
		]);

		const removed = tree.remove(['src/widgets']);
		expect(removed.has('src/widgets/button.dart')).toBe(false);
		expect(removed.has('src/app.dart')).toBe(true);

		const moved = tree.move(['README.md', 'src/app.dart'], 'test');
		expect(moved.childrenOf('test').map((n) => n.value)).toEqual([
			'test/app_test.dart',
			'src/app.dart',
			'README.md'
		]);
		expect(moved.parentOf('README.md')).toBe('test');

		// Moving into a moved node or a descendant, or into an unknown node, is refused
		// instead of dropping the nodes.
		expect(() => tree.move(['src'], 'src/widgets')).toThrow(TypeError);
		expect(() => tree.move(['src'], 'src')).toThrow(TypeError);
		expect(() => tree.move(['README.md'], 'nope')).toThrow(TypeError);
		expect(() => tree.insert('nope', [{ value: 'x' }])).toThrow(TypeError);
		expect(() => tree.insert(null, [{ value: 'x' }], { index: 9 })).toThrow(RangeError);

		const replaced = tree.replace('README.md', { value: 'README.md', label: 'Read me' });
		expect(treeNodeLabel(replaced.find('README.md')!)).toBe('Read me');
		expect(treeNodeLabel(tree.find('README.md')!)).toBe('README.md');
	});
});
