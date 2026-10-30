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

import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Gallery from '../../tests/Gallery.svelte';

/** Waits for the fonts and for transitions to settle. */
async function settled() {
	await document.fonts.ready;
	await new Promise((resolve) => setTimeout(resolve, 300));
}

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('component gallery', () => {
	// The whole gallery must be on screen: axe reads the colors behind each element there.
	beforeEach(async () => {
		await page.viewport(820, 900);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(Gallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await settled();
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(Gallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await settled();
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`gallery-${scheme.name}`);
		});
	}
});
