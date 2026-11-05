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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import CodeBlockHarness from '../tests/CodeBlockHarness.svelte';

const el = (locator: { element(): Element }) => locator.element() as HTMLElement;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clipboard = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');

afterEach(() => {
	if (clipboard) Object.defineProperty(Navigator.prototype, 'clipboard', clipboard);
});

describe('CodeBlock', () => {
	it('colors the tokens with the syntax roles and keeps the text whole', async () => {
		render(CodeBlockHarness, { code: 'const answer = 42; // done', language: 'ts' });
		const code = el(page.getByTestId('block')).querySelector('code') as HTMLElement;
		expect(code.textContent).toBe('const answer = 42; // done');
		const color = (text: string) =>
			[...code.querySelectorAll('span')].find((span) => span.textContent === text)?.style
				.color;
		expect(color('const')).toBe('var(--oito2-syntax-keyword)');
		expect(color('42')).toBe('var(--oito2-syntax-number)');
		expect(color('// done')).toBe('var(--oito2-syntax-comment)');
		await expect
			.element(page.getByTestId('block'))
			.toHaveAttribute('data-language', 'typescript');
	});

	it('shows line numbers hidden from assistive technologies', async () => {
		render(CodeBlockHarness, { code: 'a\nb\nc', language: null, showLineNumbers: true });
		const lines = el(page.getByTestId('block')).querySelector('.oito2-code-block-lines');
		expect(lines?.textContent).toBe('1\n2\n3');
		expect(lines?.getAttribute('aria-hidden')).toBe('true');
		await expect.element(page.getByTestId('block')).not.toHaveAttribute('data-language');
	});

	it('copies the code with the copy button', async () => {
		const copied: string[] = [];
		Object.defineProperty(Navigator.prototype, 'clipboard', {
			configurable: true,
			get: () => ({ writeText: async (text: string) => void copied.push(text) })
		});
		render(CodeBlockHarness, { code: 'print("hi")', language: 'python' });
		await page.getByRole('button', { name: 'Copy' }).click();
		expect(copied).toEqual(['print("hi")']);
		await expect.element(page.getByRole('button', { name: 'Copied' })).toBeVisible();
	});

	it('scrolls long lines with the keyboard', async () => {
		render(CodeBlockHarness, { code: 'x'.repeat(400), language: null });
		const region = page.getByRole('region', { name: 'Snippet' });
		el(region).focus();
		await expect.element(region).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
		await expect.poll(() => el(region).scrollLeft).toBeGreaterThan(0);
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('code block gallery', () => {
	beforeEach(async () => {
		await page.viewport(760, 640);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(CodeBlockHarness, {
				gallery: true,
				mode: scheme.mode,
				highContrast: scheme.highContrast
			});
			await document.fonts.ready;
			await wait(300);
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(CodeBlockHarness, {
				gallery: true,
				mode: scheme.mode,
				highContrast: scheme.highContrast
			});
			await document.fonts.ready;
			await wait(300);
			await expect(page.getByTestId('gallery')).toMatchScreenshot(
				`code-block-${scheme.name}`
			);
		});
	}
});
