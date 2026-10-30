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

import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Controllable } from '../internal/controllable.svelte.js';
import { AsyncListController, type AsyncListRequest } from './async-list-controller.svelte.js';
import { ListCollection } from './list-collection.js';
import { SelectionController } from './selection-controller.svelte.js';

interface Fruit {
	id: string;
	name: string;
	disabled: boolean;
}

const fruits = new ListCollection<Fruit>(
	[
		{ id: 'apple', name: 'Apple', disabled: false },
		{ id: 'banana', name: 'Banana', disabled: true },
		{ id: 'cherry', name: 'Cherry', disabled: false },
		{ id: 'pear', name: 'Pêra', disabled: false },
		{ id: 'plum', name: 'Plum', disabled: false }
	],
	{ getValue: (f) => f.id, getLabel: (f) => f.name, isDisabled: (f) => f.disabled }
);

/** Counts how many times `read` reports a change while `run` executes. */
function changes(read: () => unknown, run: () => void): number {
	let count = -1;
	const stop = $effect.root(() => {
		$effect(() => {
			read();
			count += 1;
		});
	});
	flushSync();
	run();
	flushSync();
	stop();
	return count;
}

describe('SelectionController', () => {
	it('replaces in single mode and toggles with forceToggle', () => {
		const selection = new SelectionController(fruits);
		selection.select('apple');
		selection.select('cherry');
		expect(selection.selectedValues).toEqual(['cherry']);
		selection.select('cherry', { forceToggle: true });
		expect(selection.isEmpty).toBe(true);
	});

	it('never selects disabled or unknown values', () => {
		const selection = new SelectionController(fruits, {
			mode: 'multiple',
			initialValues: ['banana', 'kiwi', 'apple']
		});
		expect(selection.selectedValues).toEqual(['apple']);
		selection.select('banana');
		expect(selection.isSelected('banana')).toBe(false);
	});

	it('extends ranges from the anchor and keeps the collection order', () => {
		const selection = new SelectionController(fruits, { mode: 'multiple' });
		selection.click('plum');
		selection.click('apple', { extend: true });
		expect(selection.selectedValues).toEqual(['apple', 'cherry', 'pear', 'plum']);
		selection.click('pear', { toggle: true });
		expect(selection.selectedValues).toEqual(['apple', 'cherry', 'plum']);
		selection.click('cherry');
		expect(selection.selectedValues).toEqual(['cherry']);
	});

	it('reports all, some and none for a select-all check box', () => {
		const selection = new SelectionController(fruits, { mode: 'multiple' });
		expect(selection.isSomeSelected).toBe(false);
		selection.select('apple');
		expect(selection.isSomeSelected).toBe(true);
		selection.selectAll();
		expect(selection.isAllSelected).toBe(true);
		expect(selection.isSomeSelected).toBe(false);
		expect(selection.selectedValues).toHaveLength(4);
	});

	it('keeps a non-deselectable selection', () => {
		const selection = new SelectionController(fruits, {
			deselectable: false,
			initialValues: ['apple']
		});
		selection.toggle('apple');
		selection.select('apple', { forceToggle: true });
		expect(selection.selectedValues).toEqual(['apple']);
	});

	it('selects nothing in none mode', () => {
		const selection = new SelectionController(fruits, { mode: 'none' });
		selection.select('apple');
		expect(selection.isEmpty).toBe(true);
	});

	it('drops the values that leave a new collection', () => {
		const selection = new SelectionController(fruits, {
			mode: 'multiple',
			initialValues: ['apple', 'plum']
		});
		const count = changes(
			() => selection.selectedValues,
			() => {
				selection.collection = fruits.filter('p');
				flushSync();
				selection.collection = fruits.filter('plu');
			}
		);
		expect(selection.selectedValues).toEqual(['plum']);
		expect(count).toBeGreaterThanOrEqual(1);
	});

	it('changes its state only when the selection changes', () => {
		const selection = new SelectionController(fruits, { mode: 'multiple' });
		const read = () => selection.isSelected('apple') || selection.isEmpty;
		let count = changes(read, () => {
			selection.replace('apple');
			flushSync();
			selection.replace('apple');
			flushSync();
			selection.selectAll();
			flushSync();
			selection.selectAll();
			flushSync();
			selection.setSelectedValues(['cherry', 'plum']);
			flushSync();
			selection.setSelectedValues(['cherry', 'plum']);
		});
		expect(count).toBe(3);
		selection.click('apple', { extend: true });
		expect(new Set(selection.selectedValues)).toEqual(
			new Set(['apple', 'cherry', 'pear', 'plum'])
		);
		count = changes(read, () => {
			selection.clear();
			flushSync();
			selection.clear();
		});
		expect(count).toBe(1);
	});
});

describe('AsyncListController', () => {
	function numbers(
		options: {
			sort?: (items: number[], sort: { direction: string }) => number[];
			requests?: AsyncListRequest<number>[];
		} = {}
	) {
		return new AsyncListController<number, number>({
			sort: options.sort,
			load: async (request) => {
				options.requests?.push(request);
				const start = request.cursor ?? 0;
				const all = Array.from({ length: 25 }, (_, i) => i).filter((i) =>
					String(i).includes(request.filterText)
				);
				const next = start + 10;
				return { items: all.slice(start, next), cursor: next < all.length ? next : null };
			}
		});
	}

	it('loads pages until the cursor runs out', async () => {
		const list = numbers();
		expect(list.hasMore).toBe(false);
		await list.reload();
		expect(list.items).toHaveLength(10);
		expect(list.hasMore).toBe(true);
		await list.loadMore();
		await list.loadMore();
		expect(list.items).toHaveLength(25);
		expect(list.hasMore).toBe(false);
	});

	it('stops paging with the old cursor after a failed reload', async () => {
		let fail = false;
		const requests: AsyncListRequest<number>[] = [];
		const list = new AsyncListController<number, number>({
			load: async (request) => {
				requests.push(request);
				if (fail) throw new Error('offline');
				return { items: [1, 2], cursor: 2 };
			}
		});
		await list.reload();
		expect(list.hasMore).toBe(true);
		fail = true;
		await list.setFilterText('x');
		expect(list.error).toBeInstanceOf(Error);
		expect(list.hasMore).toBe(false);
		const sent = requests.length;
		await list.loadMore();
		expect(requests).toHaveLength(sent);
	});

	it('reloads from the first page when the filter changes', async () => {
		const requests: AsyncListRequest<number>[] = [];
		const list = numbers({ requests });
		await list.reload();
		await list.setFilterText('2');
		expect(requests.at(-1)?.cursor).toBeNull();
		expect(list.items).toEqual([2, 12, 20, 21, 22, 23, 24]);
	});

	it('sorts locally without loading', async () => {
		const requests: AsyncListRequest<number>[] = [];
		const list = numbers({
			requests,
			sort: (items, sort) =>
				sort.direction === 'descending'
					? items.sort((a, b) => b - a)
					: items.sort((a, b) => a - b)
		});
		await list.reload();
		await list.setSort({ column: 'value', direction: 'descending' });
		expect(requests).toHaveLength(1);
		expect(list.items[0]).toBe(9);
	});

	it('lets a newer load supersede a slower one', async () => {
		let resolveFirst: (page: { items: string[] }) => void = () => {};
		const requests: AsyncListRequest<number>[] = [];
		const list = new AsyncListController<string, number>({
			load: (request) => {
				requests.push(request);
				return requests.length === 1
					? new Promise((resolve) => (resolveFirst = resolve))
					: Promise.resolve({ items: ['new'] });
			}
		});
		const slow = list.reload();
		expect(list.isLoading).toBe(true);
		await list.reload();
		expect(requests[0]?.isCancelled).toBe(true);
		expect(requests[0]?.signal.aborted).toBe(true);
		resolveFirst({ items: ['old'] });
		await slow;
		expect(list.items).toEqual(['new']);
		expect(list.isLoading).toBe(false);
	});

	it('keeps the error of a failed load', async () => {
		const list = new AsyncListController<number, number>({
			load: () => Promise.reject(new Error('offline'))
		});
		await list.reload();
		expect(list.error).toBeInstanceOf(Error);
		expect(list.isLoading).toBe(false);
	});
});

describe('Controllable', () => {
	it('keeps its own value until a controlled one is given', () => {
		const parent: { value?: string } = {};
		const reported: string[] = [];
		const value = new Controllable({
			value: () => parent.value,
			defaultValue: 'a',
			onChange: (next) => reported.push(next)
		});
		expect(value.current).toBe('a');
		value.current = 'b';
		value.current = 'b';
		expect(value.current).toBe('b');
		expect(reported).toEqual(['b']);
		parent.value = 'c';
		expect(value.current).toBe('c');
		value.current = 'd';
		// A controlled value only changes when the parent changes it.
		expect(value.current).toBe('c');
		expect(reported).toEqual(['b', 'd']);
	});
});
