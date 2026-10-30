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
import parity from '../../fixtures/parity/foundation.json';
import { Contrast } from './contrast.js';

describe('Contrast matches oito2_ui', () => {
	it('computes the same ratios', () => {
		for (const { a, b, ratio } of parity.contrast.ratio) {
			expect(Contrast.ratio(a, b), `${a} on ${b}`).toBeCloseTo(ratio, 10);
		}
	});

	it('picks the same foreground', () => {
		for (const { background, foreground } of parity.contrast.foregroundFor) {
			expect(Contrast.foregroundFor(background), background).toBe(foreground);
		}
	});

	it('ensures contrast with the same colors', () => {
		for (const { color, backgrounds, target, result } of parity.contrast.ensure) {
			expect(Contrast.ensure(color, backgrounds, target), `${color} at ${target}`).toBe(
				result
			);
		}
	});
});

describe('Contrast', () => {
	it('spans 1 to 21', () => {
		expect(Contrast.ratio('#000000', '#FFFFFF')).toBeCloseTo(21, 10);
		expect(Contrast.ratio('#3584E4', '#3584E4')).toBe(1);
	});

	it('returns the color unchanged without backgrounds', () => {
		expect(Contrast.minRatio('#3584E4', [])).toBe(21);
		expect(Contrast.ensure('#3584E4', [], Contrast.textAAA)).toBe('#3584E4');
	});
});
