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

import { settleFonts } from '@oito2/ui-test-utils';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PresetGallery from '../tests/PresetGallery.svelte';
import { presetColorTheme, type ThemePreset } from './presets.js';

const presets: ThemePreset[] = ['rosePineDawn', 'catppuccinMocha'];

describe('controls under presets', () => {
	// The whole gallery must be on screen: axe reads the colors behind each element there.
	beforeEach(async () => {
		await page.viewport(700, 600);
	});

	for (const preset of presets) {
		it(`has no axe violations in ${preset}`, async () => {
			render(PresetGallery, { theme: presetColorTheme(preset) });
			await settleFonts();
			const result = await axe.run(page.getByTestId('gallery').element());
			expect(result.violations.map((v) => v.id)).toEqual([]);
		});

		it(`matches the golden in ${preset}`, async () => {
			render(PresetGallery, { theme: presetColorTheme(preset) });
			await settleFonts();
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`gallery-${preset}`);
		});
	}
});
