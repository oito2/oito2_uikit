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

import { flavors } from '@catppuccin/palette';
import { describe, expect, it } from 'vitest';
import parity from '../../../ui/src/fixtures/parity/schemes.json';
import { draculaPalettes, everforestPalettes, nordPalette, rosePinePalettes } from './palettes.js';
import { presetColorTheme, themePresetNames, themePresets, type ThemePreset } from './presets.js';

describe('presets match oito2_ui', () => {
	it('has the same palettes', () => {
		expect(everforestPalettes).toEqual(parity.palettes.everforest);
		expect(rosePinePalettes).toEqual(parity.palettes.rosePine);
		expect(nordPalette).toEqual(parity.palettes.nord);
		expect(draculaPalettes).toEqual(parity.palettes.dracula);
	});

	it('reads the same Catppuccin colors as catppuccin_flutter', () => {
		for (const [name, colors] of Object.entries(parity.palettes.catppuccin)) {
			const flavor = flavors[name as keyof typeof flavors];
			for (const [color, hex] of Object.entries(colors)) {
				const actual = flavor.colors[color as keyof typeof flavor.colors].hex;
				expect(actual.toUpperCase(), `${name}.${color}`).toBe(hex);
			}
		}
	});

	it('lists the same presets in the same order', () => {
		const names = [...new Set(parity.presets.map((entry) => entry.preset))];
		expect(themePresetNames).toEqual(names);
		for (const entry of parity.presets) {
			const preset = themePresets[entry.preset as ThemePreset];
			expect(preset).toEqual({ label: entry.label, isDark: entry.isDark });
		}
	});

	it.each(
		parity.presets.map((entry) => [`${entry.preset}${entry.highContrast ? ' HC' : ''}`, entry])
	)('derives %s', (_, entry) => {
		const theme = presetColorTheme(entry.preset as ThemePreset, {
			highContrast: entry.highContrast
		});
		expect(JSON.parse(JSON.stringify(theme))).toEqual(entry.theme);
	});
});
