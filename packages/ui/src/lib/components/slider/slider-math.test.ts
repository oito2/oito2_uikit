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
import { roundToStep, snapSliderValue } from './slider-math.js';

describe('snapSliderValue', () => {
	it('returns divisions without floating-point noise', () => {
		expect(snapSliderValue(0.3, 0, 1, 10)).toBe(0.3);
		expect(snapSliderValue(0.7, 0, 1, 10)).toBe(0.7);
		expect(snapSliderValue(0.29, 0.05, 1.05, 10)).toBe(0.25);
		expect(snapSliderValue(23, 0, 100, 10)).toBe(20);
	});

	it('keeps values without divisions as they are, within the limits', () => {
		expect(snapSliderValue(0.4372, 0, 1)).toBe(0.4372);
		expect(snapSliderValue(120, 0, 100)).toBe(100);
	});
});

describe('roundToStep', () => {
	it('rounds a sum of steps to the decimals of the step and the origin', () => {
		expect(roundToStep(0.1 + 0.2, 0.1)).toBe(0.3);
		expect(roundToStep(0.15000000000000002, 0.1, 0.05)).toBe(0.15);
		expect(roundToStep(3 * 0.1, 0.30000000000000004 / 3)).toBe(0.3);
		expect(roundToStep(2e-7 + 1e-7, 1e-7)).toBe(3e-7);
		expect(roundToStep(40, 20)).toBe(40);
	});
});
