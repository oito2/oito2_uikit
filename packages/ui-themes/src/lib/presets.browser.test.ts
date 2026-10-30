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

import { colorThemeVariables } from '@oito2/ui/theme';
import { afterEach, describe, expect, it } from 'vitest';
import { presetColorTheme, themePresetNames } from './presets.js';
import './presets.css';

// Converts camelCase to kebab-case.
const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

describe('presets.css', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it.each(
		themePresetNames.flatMap((preset) => [[preset, false] as const, [preset, true] as const])
	)('applies %s (high contrast: %s)', (preset, highContrast) => {
		const element = document.createElement('div');
		element.dataset.oito2Scheme = `${kebab(preset)}${highContrast ? '-hc' : ''}`;
		document.body.append(element);
		const style = getComputedStyle(element);
		const theme = presetColorTheme(preset, { highContrast });
		for (const [property, value] of Object.entries(colorThemeVariables(theme))) {
			expect(style.getPropertyValue(property).trim(), property).toBe(value);
		}
	});
});
