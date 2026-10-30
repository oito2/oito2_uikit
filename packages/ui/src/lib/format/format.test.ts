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
import parity from '../../fixtures/parity/format.json';
import { ptBR } from '../l10n/pt-br.js';
import { Format, type ByteUnits } from './format.js';

const formats = {
	en: new Format(),
	'pt-BR': new Format({ locale: 'pt_BR', strings: ptBR }),
	xx: new Format({ locale: 'xx' })
} as const;

describe.each(Object.keys(formats) as (keyof typeof formats)[])('%s matches oito2_ui', (name) => {
	const format = formats[name];
	const expected = parity[name];

	it('formats byte sizes', () => {
		for (const { bytes, units, fractionDigits, result } of expected.bytes) {
			expect(
				format.bytes(bytes, { units: units as ByteUnits, fractionDigits }),
				`${bytes} ${units} ${fractionDigits}`
			).toBe(result);
		}
	});

	it('formats compact numbers', () => {
		for (const { value, result } of expected.compactNumber) {
			expect(format.compactNumber(value), String(value)).toBe(result);
		}
	});

	it('describes relative times', () => {
		const now = new Date(Date.UTC(2026, 9, 20, 12));
		for (const { offsetSeconds, result } of expected.relativeTime) {
			const time = new Date(now.getTime() + offsetSeconds * 1000);
			expect(format.relativeTime(time, now), String(offsetSeconds)).toBe(result);
		}
	});
});

describe('Format', () => {
	it('normalizes the locale and falls back to English', () => {
		expect(new Format({ locale: 'pt_BR' }).locale).toBe('pt-BR');
		expect(new Format({ locale: 'xx' }).locale).toBe('en');
		expect(new Format({ locale: 'not a locale!' }).locale).toBe('en');
	});

	it('uses the current time by default', () => {
		expect(new Format().relativeTime(new Date())).toBe('now');
	});
});
