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

// Helpers shared by the showcase end-to-end tests.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Page } from '@playwright/test';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

/** The slugs of the catalogue pages, read from the catalogue source. */
export const slugs: string[] = [
	...readFileSync(new URL('../src/lib/catalog.ts', import.meta.url), 'utf8').matchAll(
		/slug: '([a-z0-9-]+)'/g
	)
].map((match) => match[1] as string);

/** The showcase settings a test starts with, stored the way the showcase reads them. */
export interface Appearance {
	mode: 'light' | 'dark';
	rtl: boolean;
	language: 'en' | 'pt-BR';
	compact?: boolean;
}

/** Stores `appearance` before the showcase loads. */
export async function setAppearance(page: Page, appearance: Appearance): Promise<void> {
	await page.addInitScript((value) => {
		localStorage.setItem('oito2-showcase-settings', JSON.stringify(value));
	}, appearance);
}

/** Collects the uncaught errors and console errors of `page`. */
export function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(String(error)));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	return errors;
}

/** Returns the axe violations inside `selector`, as `rule: targets` lines. */
export async function axeViolations(page: Page, selector: string): Promise<string[]> {
	await page.addScriptTag({ content: axeSource });
	return page.evaluate(async (scope) => {
		const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
		const result = await axe.run(document.querySelector(scope) as Element);
		return result.violations.map(
			(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
		);
	}, selector);
}

/** Waits for the finite animations on the page, such as a page sliding in, to end. */
export async function settle(page: Page): Promise<void> {
	await page.evaluate(async () => {
		const finite = document
			.getAnimations()
			.filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
		await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
	});
}
