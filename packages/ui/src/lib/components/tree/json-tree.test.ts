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
import { jsonTree } from './json-tree.js';

describe('jsonTree cycles', () => {
	it('shows an object inside itself as a circular leaf', () => {
		const data: Record<string, unknown> = { name: 'a' };
		data.self = data;
		const list: unknown[] = [1];
		list.push(list);
		data.list = list;
		const tree = jsonTree(data);
		expect(tree.values).toEqual(['$', '$.name', '$.self', '$.list', '$.list[0]', '$.list[1]']);
		expect(tree.find('$.self')?.label).toBe('self: [Circular]');
		expect(tree.find('$.self')?.children).toBeUndefined();
		expect(tree.find('$.self')?.data?.circular).toBe(true);
		expect(tree.find('$.list[1]')?.data?.circular).toBe(true);
	});

	it('opens an object shared by siblings in each place', () => {
		const shared = { x: 1 };
		const tree = jsonTree({ a: shared, b: shared });
		expect(tree.find('$.a')?.children).toHaveLength(1);
		expect(tree.find('$.b')?.children).toHaveLength(1);
		expect(tree.find('$.b')?.data?.circular).toBeUndefined();
	});
});
