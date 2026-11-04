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
import { toggleValues } from './choice/toggle-group/toggle-group-state.svelte.js';
import {
	formatCompactDate,
	formatTime,
	parseCompactDate,
	parseTime,
	uses12HourClock
} from './entries/date-time.js';
import { formatNumber, normalizeNumber, parseNumber } from './entries/number-format.js';
import { alignRating, angleOf, ratingAt, snapAngle } from './rating/rating-math.js';
import { highlightRanges } from './text/highlight-ranges.js';
import { addTags, splitTags } from './text/tags.js';

describe('highlightRanges', () => {
	it('matches every word ignoring case and accents', () => {
		expect(highlightRanges('Configurações de ação', 'acao CONFIG')).toEqual([
			{ start: 0, end: 6 },
			{ start: 17, end: 21 }
		]);
	});

	it('matches decomposed accents, ß and dotted capitals in place', () => {
		expect(highlightRanges('ação', 'acao')).toEqual([{ start: 0, end: 6 }]);
		expect(highlightRanges('Straße', 'strasse')).toEqual([{ start: 0, end: 6 }]);
		expect(highlightRanges('İstanbul', 'stan')).toEqual([{ start: 1, end: 5 }]);
	});

	it('matches several queries, phrases, case and whole words', () => {
		const text = 'Ark UI builds UI kits; the ark sails';
		expect(highlightRanges(text, 'ark', { queries: ['kits'] })).toEqual([
			{ start: 0, end: 3 },
			{ start: 17, end: 21 },
			{ start: 27, end: 30 }
		]);
		expect(highlightRanges(text, 'ark', { ignoreCase: false })).toEqual([
			{ start: 27, end: 30 }
		]);
		expect(highlightRanges(text, 'ark', { matchAll: false })).toEqual([{ start: 0, end: 3 }]);
		expect(highlightRanges(text, 'ui', { wholeWords: true })).toEqual([
			{ start: 4, end: 6 },
			{ start: 14, end: 16 }
		]);
		expect(highlightRanges(text, 'build', { wholeWords: true })).toEqual([]);
		expect(highlightRanges(text, 'ui kits', { splitWords: false })).toEqual([
			{ start: 14, end: 21 }
		]);
	});

	it('merges overlapping matches', () => {
		expect(highlightRanges('banana', 'ana nan')).toEqual([{ start: 1, end: 6 }]);
		expect(highlightRanges('text', '')).toEqual([]);
	});
});

describe('parseTime', () => {
	it('reads a day period before the time', () => {
		expect(parseTime('오후 9:30', '오전', '오후')).toEqual({ hour: 21, minute: 30 });
		expect(parseTime('上午 9:05', '上午', '下午')).toEqual({ hour: 9, minute: 5 });
		expect(parseTime('PM 9:30 PM')).toBeNull();
	});

	it('accepts 24-hour and 12-hour input', () => {
		expect(parseTime('9:05')).toEqual({ hour: 9, minute: 5 });
		expect(parseTime('21.30')).toEqual({ hour: 21, minute: 30 });
		expect(parseTime('7h45')).toEqual({ hour: 7, minute: 45 });
		expect(parseTime('12:00 AM')).toEqual({ hour: 0, minute: 0 });
		expect(parseTime('1:15 pm')).toEqual({ hour: 13, minute: 15 });
		expect(parseTime('3:00 p')).toEqual({ hour: 15, minute: 0 });
	});

	it('rejects invalid input', () => {
		for (const text of ['24:00', '9:60', '13:00 pm', '0:30 am', 'noon', '930'])
			expect(parseTime(text), text).toBeNull();
	});

	it('formats as the locale writes times and reads it back', () => {
		expect(uses12HourClock('en')).toBe(true);
		expect(uses12HourClock('pt-BR')).toBe(false);
		const time = { hour: 21, minute: 30 };
		expect(formatTime(time, { use24Hour: false })).toBe('9:30 PM');
		expect(formatTime(time, { use24Hour: true })).toBe('21:30');
		expect(formatTime({ hour: 0, minute: 5 }, { use24Hour: false })).toBe('12:05 AM');
		expect(parseTime(formatTime(time, { use24Hour: false }))).toEqual(time);
	});
});

describe('compact dates', () => {
	it('formats in the locale order', () => {
		const date = new Date(2026, 1, 3);
		expect(formatCompactDate(date, 'en')).toBe('2/3/2026');
		expect(formatCompactDate(date, 'pt-BR')).toBe('03/02/2026');
	});

	it('parses the locale order with or without leading zeros', () => {
		expect(parseCompactDate('2/3/2026', 'en')).toEqual(new Date(2026, 1, 3));
		expect(parseCompactDate('02/03/2026', 'en')).toEqual(new Date(2026, 1, 3));
		expect(parseCompactDate('03/02/2026', 'pt-BR')).toEqual(new Date(2026, 1, 3));
		expect(parseCompactDate(' 3/2/2026 ', 'pt_BR')).toEqual(new Date(2026, 1, 3));
	});

	it('rejects impossible dates and other forms', () => {
		expect(parseCompactDate('2/30/2026', 'en')).toBeNull();
		expect(parseCompactDate('13/1/2026', 'en')).toBeNull();
		expect(parseCompactDate('2026-02-03', 'en')).toBeNull();
		expect(parseCompactDate('2/3', 'en')).toBeNull();
	});
});

describe('numbers', () => {
	it('formats and parses the locale format', () => {
		expect(formatNumber(1234.5, 'en', 2)).toBe('1,234.50');
		expect(formatNumber(1234.5, 'pt-BR', 2)).toBe('1.234,50');
		expect(parseNumber('1,234.5', 'en')).toBe(1234.5);
		expect(parseNumber('1.234,5', 'pt-BR')).toBe(1234.5);
		expect(parseNumber('-12', 'en')).toBe(-12);
		expect(parseNumber('12a', 'en')).toBeNull();
		expect(parseNumber('', 'en')).toBeNull();
	});

	it('rounds and clamps', () => {
		expect(normalizeNumber(3.14159, 2, 0, 10)).toBe(3.14);
		expect(normalizeNumber(12, 0, 0, 10)).toBe(10);
		expect(normalizeNumber(-5, 0, 0, 10)).toBe(0);
	});
});

describe('tags', () => {
	it('adds trimmed tags and refuses empty, repeated and extra ones', () => {
		expect(addTags(['a'], [' b ', 'a', '', 'c'], { maxTags: 3 })).toEqual({
			tags: ['a', 'b', 'c'],
			refused: ['a']
		});
		expect(addTags([], ['x', 'yy'], { validator: (tag) => tag.length > 1 })).toEqual({
			tags: ['yy'],
			refused: ['x']
		});
		expect(addTags(['a'], ['a'], { allowDuplicates: true }).tags).toEqual(['a', 'a']);
	});

	it('splits on the delimiters and keeps the rest', () => {
		expect(splitTags('red, green,blu', [','])).toEqual({
			parts: ['red', ' green'],
			rest: 'blu'
		});
		expect(splitTags('a;b|c', [';', '|'])).toEqual({ parts: ['a', 'b'], rest: 'c' });
		expect(splitTags('abc', [','])).toBeNull();
		expect(splitTags('a,b', [])).toBeNull();
	});
});

describe('toggleValues', () => {
	it('toggles one or several values', () => {
		expect(toggleValues(['a'], 'b', false, true)).toEqual(['b']);
		expect(toggleValues(['a'], 'a', false, true)).toEqual([]);
		expect(toggleValues(['a'], 'a', false, false)).toBeNull();
		expect(toggleValues(['a'], 'b', true, true)).toEqual(['a', 'b']);
		expect(toggleValues(['a', 'b'], 'a', true, false)).toEqual(['b']);
	});
});

describe('rating and angle math', () => {
	it('reads the star under the pointer', () => {
		expect(ratingAt(30, 24, 5, false)).toBe(2);
		expect(ratingAt(30, 24, 5, true)).toBe(1.5);
		expect(ratingAt(40, 24, 5, true)).toBe(2);
		expect(ratingAt(500, 24, 5, true)).toBe(5);
		expect(alignRating(3.7, 5, true)).toBe(3.5);
		expect(alignRating(3.7, 5, false)).toBe(4);
		expect(alignRating(9, 5, false)).toBe(5);
	});

	it('snaps and wraps angles clockwise from the top', () => {
		expect(snapAngle(-10, 15)).toBe(345);
		expect(snapAngle(361, 1)).toBe(1);
		expect(angleOf(1, 0)).toBe(90);
		expect(angleOf(0, 1)).toBe(180);
		expect(angleOf(0, -1)).toBe(0);
	});
});
