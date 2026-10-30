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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ListCollection } from '../collections/list-collection.js';
import { partId, uniqueId } from './ids.js';
import { navigationIntent } from './keyboard.js';
import { Typeahead } from './typeahead.js';

describe('ids', () => {
	it('creates unique and part ids', () => {
		expect(uniqueId('x')).not.toBe(uniqueId('x'));
		expect(partId('menu-1', 'label')).toBe('menu-1-label');
	});
});

describe('navigationIntent', () => {
	it('maps arrows by orientation and direction', () => {
		expect(navigationIntent('ArrowDown', { orientation: 'vertical' })).toBe('next');
		expect(navigationIntent('ArrowRight', { orientation: 'vertical' })).toBeNull();
		expect(navigationIntent('ArrowRight', { orientation: 'horizontal' })).toBe('next');
		expect(navigationIntent('ArrowRight', { orientation: 'horizontal', dir: 'rtl' })).toBe(
			'previous'
		);
		expect(navigationIntent('ArrowLeft', { orientation: 'horizontal', dir: 'rtl' })).toBe(
			'next'
		);
		expect(navigationIntent('ArrowUp')).toBe('previous');
		expect(navigationIntent('Home')).toBe('first');
		expect(navigationIntent('End')).toBe('last');
		expect(navigationIntent('a')).toBeNull();
	});
});

describe('Typeahead', () => {
	const names = new ListCollection(['Ana', 'Bruno', 'Beatriz', 'Bia', 'Carla']);
	const search = (query: string, from: string | null) => names.search(query, { from });

	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('builds a query from quick keystrokes', () => {
		const typeahead = new Typeahead();
		expect(typeahead.type('b', null, search)).toBe('Bruno');
		expect(typeahead.type('i', 'Bruno', search)).toBe('Bia');
		expect(typeahead.query).toBe('bi');
	});

	it('cycles through items when the same letter repeats', () => {
		const typeahead = new Typeahead();
		expect(typeahead.type('b', 'Ana', search)).toBe('Bruno');
		expect(typeahead.type('b', 'Bruno', search)).toBe('Beatriz');
		expect(typeahead.type('b', 'Beatriz', search)).toBe('Bia');
		expect(typeahead.type('b', 'Bia', search)).toBe('Bruno');
	});

	it('starts a new query after a pause', () => {
		const typeahead = new Typeahead();
		typeahead.type('b', null, search);
		vi.advanceTimersByTime(700);
		expect(typeahead.query).toBe('');
		expect(typeahead.type('c', 'Bruno', search)).toBe('Carla');
	});
});
