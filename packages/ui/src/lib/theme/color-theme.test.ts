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
import parity from '../../fixtures/parity/schemes.json';
import type { AccentColor } from '../tokens/values.js';
import {
	colorSchemeRoles,
	createColorTheme,
	surfacesOfTheme,
	type ColorTheme
} from './color-theme.js';
import { Contrast } from '../foundation/contrast.js';
import type { Brightness } from './color-roles.js';

// The JSON fixture as a plain object, for comparison with a ColorTheme.
function plain(theme: ColorTheme) {
	return JSON.parse(JSON.stringify(theme)) as unknown;
}

describe('base schemes match oito2_ui', () => {
	it.each(
		parity.base.map((entry) => [
			`${entry.brightness} ${entry.accent}${entry.highContrast ? ' HC' : ''}`,
			entry
		])
	)('%s', (_, entry) => {
		const theme = createColorTheme({
			brightness: entry.brightness as Brightness,
			accent: entry.accent as AccentColor,
			highContrast: entry.highContrast
		});
		expect(plain(theme)).toEqual(entry.theme);
	});
});

describe('createColorTheme', () => {
	it('accepts any hex accent and caches by input', () => {
		const a = createColorTheme({ brightness: 'light', accent: '#0F766E' });
		expect(createColorTheme({ brightness: 'light', accent: '#0F766E' })).toBe(a);
		expect(Contrast.ratio(a.colorScheme.primary, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
	});

	it('defaults to the blue accent', () => {
		expect(createColorTheme({ brightness: 'dark' })).toEqual(
			createColorTheme({ brightness: 'dark', accent: 'blue' })
		);
	});

	it.each([false, true])(
		'keeps text readable on every surface (high contrast: %s)',
		(highContrast) => {
			const theme = createColorTheme({ brightness: 'light', accent: 'yellow', highContrast });
			const target = highContrast ? Contrast.textAAA : Contrast.textAA;
			const surfaces = surfacesOfTheme(theme);
			expect(Contrast.minRatio(theme.colorScheme.onSurface, surfaces)).toBeGreaterThanOrEqual(
				target
			);
			expect(Contrast.minRatio(theme.semantic.primaryText, surfaces)).toBeGreaterThanOrEqual(
				target
			);
			expect(colorSchemeRoles).toHaveLength(Object.keys(theme.colorScheme).length);
		}
	);
});
