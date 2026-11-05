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

// The showcase shell: deep links, the search, View source and the settings.

import { expect, test } from '@playwright/test';
import { collectErrors, setAppearance } from './support.js';

test.beforeEach(async ({ page }) => {
	await setAppearance(page, { mode: 'light', rtl: false, language: 'en' });
});

test('a deep link opens its page and the list follows the selection', async ({ page }) => {
	const errors = collectErrors(page);
	await page.goto('/tabs');
	await expect(page.getByRole('heading', { level: 1, name: 'Tabs' })).toBeVisible();
	await page
		.getByRole('option', { name: 'Avatar' })
		.or(page.getByText('Avatar', { exact: true }))
		.first()
		.click();
	await expect(page).toHaveURL(/\/avatar$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
	expect(errors).toEqual([]);
});

test('the search filters the list, ignoring case', async ({ page }) => {
	await page.goto('/button');
	await page.getByRole('searchbox', { name: 'Search pages' }).fill('TILE');
	const list = page.locator('.oito2-master-detail-list');
	await expect(list.getByText('List tile', { exact: true })).toBeVisible();
	await expect(list.getByText('Tile', { exact: true })).toBeVisible();
	await expect(list.getByText('Button', { exact: true })).toHaveCount(0);
	await page.getByRole('searchbox', { name: 'Search pages' }).fill('nothing like this');
	await expect(page.getByText('No page matches')).toBeVisible();
});

test('View source shows the page source', async ({ page }) => {
	await page.goto('/badge');
	await page.getByRole('button', { name: 'View source' }).click();
	const dialog = page.getByRole('dialog', { name: 'Badge source' });
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('code')).toContainText('<main class="showcase-page">');
	await expect(dialog.getByRole('link', { name: 'Open on GitHub' })).toHaveAttribute(
		'href',
		/apps\/showcase\/src\/lib\/pages\/badge\.svelte$/
	);
});

test('the settings switch to the compact layout and to Portuguese', async ({ page }) => {
	await page.goto('/switch');
	await page.getByRole('button', { name: 'Settings' }).click();
	const dialog = page.getByRole('dialog', { name: 'Settings' });
	await dialog.getByRole('switch', { name: /Compact layout/ }).click();
	await dialog.getByRole('combobox', { name: 'Language' }).click();
	await page.getByRole('option', { name: 'Português (Brasil)' }).click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('navigation').first()).toBeVisible();
	await expect(page.locator('.oito2-master-detail-list')).toHaveCount(0);
	const stored = await page.evaluate(() => localStorage.getItem('oito2-showcase-settings'));
	expect(JSON.parse(stored ?? '{}')).toMatchObject({ compact: true, language: 'pt-BR' });
});
