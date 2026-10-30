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
import { formatHex, fromHsl, parseHex, roundHalfAway, toHsl } from './color.js';

describe('hex colors', () => {
	it('parses every hex form', () => {
		expect(parseHex('#3584E4')).toEqual({ r: 0x35, g: 0x84, b: 0xe4, a: 255 });
		expect(parseHex('fff')).toEqual({ r: 255, g: 255, b: 255, a: 255 });
		expect(parseHex('#0008')).toEqual({ r: 0, g: 0, b: 0, a: 0x88 });
		expect(parseHex(' #11223344 ')).toEqual({ r: 0x11, g: 0x22, b: 0x33, a: 0x44 });
	});

	it('rejects anything else', () => {
		expect(() => parseHex('#12345')).toThrow(TypeError);
		expect(() => parseHex('red')).toThrow(TypeError);
	});

	it('formats as uppercase, with alpha only when not opaque', () => {
		expect(formatHex({ r: 0x35, g: 0x84, b: 0xe4, a: 255 })).toBe('#3584E4');
		expect(formatHex({ r: 1, g: 2, b: 3, a: 4 })).toBe('#01020304');
	});
});

describe('HSL', () => {
	it('round-trips 8-bit colors', () => {
		for (const hex of ['#3584E4', '#E62D42', '#C88800', '#808080', '#000000', '#FFFFFF']) {
			expect(formatHex(fromHsl(toHsl(parseHex(hex)))), hex).toBe(hex);
		}
	});

	it('rounds half away from zero', () => {
		expect(roundHalfAway(2.5)).toBe(3);
		expect(roundHalfAway(-2.5)).toBe(-3);
		expect(roundHalfAway(2.4)).toBe(2);
	});
});
