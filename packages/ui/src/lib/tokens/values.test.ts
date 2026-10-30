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
import parity from '../../fixtures/parity/tokens.json';
import {
	accentColors,
	neutralPalettes,
	radius,
	sizes,
	spacing,
	statusPalettes,
	surfacesOf,
	typography
} from './values.js';

describe('tokens match oito2_ui', () => {
	it('has the same radii, spacing and sizes', () => {
		expect(radius).toEqual(parity.radius);
		expect(spacing).toEqual(parity.spacing);
		expect(sizes).toEqual(parity.sizes);
	});

	it('has the same accent, neutral and status colors', () => {
		expect(accentColors).toEqual(parity.accents);
		expect(neutralPalettes).toEqual(parity.neutrals);
		expect(statusPalettes).toEqual(parity.status);
	});

	it('has the same typography', () => {
		expect(typography.fontFamilyFallback).toEqual(parity.typography.fontFamilyFallback);
		expect(typography.emphasisWeight).toBe(parity.typography.emphasisWeight);
		expect(Object.keys(typography.scale)).toEqual(Object.keys(parity.typography.scale));
		for (const [name, expected] of Object.entries(parity.typography.scale)) {
			const style = typography.scale[name as keyof typeof typography.scale];
			expect(style.fontSize, name).toBe(expected.fontSize);
			expect(style.lineHeight * style.fontSize, name).toBeCloseTo(expected.lineHeight, 2);
			expect(style.fontWeight, name).toBe(expected.fontWeight);
			expect(style.letterSpacing, name).toBe(expected.letterSpacing);
		}
		expect(typography.scale.bodyLarge.fontSize).toBe(parity.typography.bodyLargeSize);
		expect(typography.scale.bodyMedium.fontSize).toBe(parity.typography.bodyMediumSize);
		expect(typography.scale.bodySmall.fontSize).toBe(parity.typography.bodySmallSize);
	});

	it('lists every surface of a palette', () => {
		expect(surfacesOf(neutralPalettes.light)).toHaveLength(7);
		expect(surfacesOf(neutralPalettes.dark)).toContain(neutralPalettes.dark.titleBar);
	});
});
