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
import './styles.css';

// Reads a custom property as resolved on an element inside the given container.
function resolved(property: string, container: HTMLElement = document.body): string {
	const probe = document.createElement('div');
	probe.style.height = `var(${property})`;
	container.append(probe);
	const value = getComputedStyle(probe).height;
	probe.remove();
	return value;
}

describe('styles.css', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it('defines the tokens', () => {
		expect(resolved('--oito2-radius-window')).toBe('14px');
		expect(resolved('--oito2-size-title-bar-height')).toBe('46px');
		expect(getComputedStyle(document.documentElement).fontFamily).toMatch(/^Inter,/);
	});

	it('uses pointer sizes by default and touch sizes on request', () => {
		const coarse = matchMedia('(pointer: coarse)').matches;
		expect(resolved('--oito2-control-height')).toBe(coarse ? '40px' : '34px');
		const touch = document.createElement('section');
		touch.dataset.oito2Density = 'touch';
		document.body.append(touch);
		expect(resolved('--oito2-control-height', touch)).toBe('40px');
		expect(resolved('--oito2-target-min', touch)).toBe('48px');
		const pointer = document.createElement('section');
		pointer.dataset.oito2Density = 'pointer';
		touch.append(pointer);
		expect(resolved('--oito2-control-height', pointer)).toBe('34px');
	});
});
