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

import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import TitleBarGallery from '../../tests/TitleBarGallery.svelte';

describe('title bar styles', () => {
	beforeEach(async () => {
		await page.viewport(600, 900);
	});

	for (const mode of ['light', 'dark'] as const) {
		it(`match the golden in ${mode}`, async () => {
			render(TitleBarGallery, { mode });
			await document.fonts.ready;
			await new Promise((resolve) => setTimeout(resolve, 300));
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`title-bars-${mode}`);
		});
	}
});
