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
import { formatCompactDate, parseCompactDate } from './date-time.js';

describe('parseCompactDate', () => {
	it('reads the non-Latin digits and direction marks the locale writes', () => {
		const date = new Date(2026, 1, 3);
		for (const locale of ['ar-EG', 'bn', 'en-u-nu-thai', 'fa-u-ca-gregory']) {
			expect(parseCompactDate(formatCompactDate(date, locale), locale)).toEqual(date);
		}
	});

	it('also reads Latin digits in a locale with other digits', () => {
		expect(parseCompactDate('3/2/2026', 'ar-EG')).toEqual(new Date(2026, 1, 3));
	});
});
