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

import { describe, expect, it } from 'vitest';
import './fonts.css';

// Loads the requested face and returns the rendered width of the text.
async function measure(font: string, text: string): Promise<number> {
	await document.fonts.load(font, text);
	const span = document.createElement('span');
	span.style.font = font;
	span.style.position = 'absolute';
	span.style.whiteSpace = 'pre';
	span.textContent = text;
	document.body.append(span);
	const { width } = span.getBoundingClientRect();
	span.remove();
	return width;
}

describe('JetBrains Mono variable font', () => {
	it('loads the upright and italic faces', async () => {
		await document.fonts.load("400 16px 'JetBrains Mono'", 'const x = 1;');
		await document.fonts.load("italic 400 16px 'JetBrains Mono'", 'const x = 1;');
		expect(document.fonts.check("400 16px 'JetBrains Mono'", 'const x = 1;')).toBe(true);
		expect(document.fonts.check("italic 400 16px 'JetBrains Mono'", 'const x = 1;')).toBe(true);
	});

	it('keeps one advance width for every glyph and weight', async () => {
		const narrow = await measure("400 32px 'JetBrains Mono', serif", 'iiiiiiiiii');
		const wide = await measure("400 32px 'JetBrains Mono', serif", 'MMMMMMMMMM');
		const bold = await measure("700 32px 'JetBrains Mono', serif", 'MMMMMMMMMM');
		expect(narrow).toBeCloseTo(wide, 1);
		expect(bold).toBeCloseTo(wide, 1);
	});
});
