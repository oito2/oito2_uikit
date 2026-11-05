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

// Every catalogue page renders without errors or horizontal overflow and passes axe, in
// light, left-to-right English and in dark, right-to-left Portuguese.

import { expect, test } from '@playwright/test';
import {
	axeViolations,
	collectErrors,
	settle,
	setAppearance,
	slugs,
	type Appearance
} from './support.js';

const appearances: [string, Appearance][] = [
	['light, LTR, en', { mode: 'light', rtl: false, language: 'en' }],
	['dark, RTL, pt-BR', { mode: 'dark', rtl: true, language: 'pt-BR' }]
];

test('the catalogue lists pages', () => {
	expect(slugs.length).toBeGreaterThan(90);
});

for (const slug of slugs) {
	for (const [name, appearance] of appearances) {
		test(`${slug} (${name})`, async ({ page }) => {
			const errors = collectErrors(page);
			await setAppearance(page, appearance);
			await page.goto(`/${slug}`);
			await expect(
				page.locator('.content .showcase-page, .content main').first()
			).toBeVisible();
			await page.waitForLoadState('networkidle');
			await settle(page);
			const overflow = await page.evaluate(() => {
				const content = document.querySelector('.content') as HTMLElement;
				return content.scrollWidth - content.clientWidth;
			});
			expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
			expect(await axeViolations(page, '.content')).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
