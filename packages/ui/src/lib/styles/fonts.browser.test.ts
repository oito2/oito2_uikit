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
import { page } from 'vitest/browser';
import './fonts.css';

const sample = 'Hamburgefonstiv 0123456789';

// Loads the requested face and returns the rendered width of the sample text.
async function measure(font: string): Promise<number> {
	await document.fonts.load(font, sample);
	const span = document.createElement('span');
	span.style.font = font;
	span.style.position = 'absolute';
	span.style.whiteSpace = 'nowrap';
	span.textContent = sample;
	document.body.append(span);
	const { width } = span.getBoundingClientRect();
	span.remove();
	return width;
}

describe('Inter variable font', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it('loads the upright and italic faces', async () => {
		await document.fonts.load('400 16px Inter', sample);
		await document.fonts.load('italic 400 16px Inter', sample);
		expect(document.fonts.check('400 16px Inter', sample)).toBe(true);
		expect(document.fonts.check('italic 400 16px Inter', sample)).toBe(true);
	});

	it('renders with Inter instead of the fallback', async () => {
		const inter = await measure('400 32px Inter, monospace');
		const fallback = await measure('400 32px monospace');
		expect(inter).not.toBeCloseTo(fallback, 0);
	});

	it('drives the wght axis with font-weight', async () => {
		const widths: number[] = [];
		for (const weight of [400, 500, 600, 700]) {
			widths.push(await measure(`${weight} 32px Inter, monospace`));
		}
		for (let i = 1; i < widths.length; i++) {
			expect(widths[i]).toBeGreaterThan(widths[i - 1] ?? 0);
		}
	});

	it('renders the weights consistently', async () => {
		const block = document.createElement('div');
		block.dataset.testid = 'inter-weights';
		block.style.cssText = 'display: inline-block; padding: 8px; background: #fff; color: #000;';
		for (const weight of [400, 500, 600, 700]) {
			const line = document.createElement('div');
			line.style.font = `${weight} 20px/28px Inter`;
			line.textContent = `${weight} ${sample}`;
			block.append(line);
		}
		document.body.append(block);
		await document.fonts.ready;
		await expect.element(page.getByTestId('inter-weights')).toMatchScreenshot('inter-weights');
	});
});
