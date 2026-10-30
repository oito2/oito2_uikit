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

import { afterEach, describe, expect, it } from 'vitest';
import { createColorTheme } from '../theme/color-theme.js';
import { colorThemeVariables } from '../theme/css.js';
import './schemes.css';

describe('schemes.css', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it.each([
		['light-blue', { brightness: 'light', accent: 'blue', highContrast: false }],
		['dark-teal-hc', { brightness: 'dark', accent: 'teal', highContrast: true }]
	] as const)('applies %s', (name, options) => {
		const element = document.createElement('div');
		element.dataset.oito2Scheme = name;
		document.body.append(element);
		const style = getComputedStyle(element);
		for (const [property, value] of Object.entries(
			colorThemeVariables(createColorTheme(options))
		)) {
			expect(style.getPropertyValue(property).trim(), property).toBe(value);
		}
		expect(style.colorScheme).toBe(options.brightness);
	});
});
