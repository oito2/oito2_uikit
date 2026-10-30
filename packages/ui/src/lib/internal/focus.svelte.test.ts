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
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FocusHarness from '../../tests/FocusHarness.svelte';

/** Returns the test id of the focused element. */
function focused(): string | undefined {
	return (document.activeElement as HTMLElement | null)?.dataset.testid;
}

describe('focusScope', () => {
	it('focuses the first tabbable element, traps Tab and restores focus', async () => {
		const props = $state({ open: false });
		render(FocusHarness, props);
		(page.getByTestId('before').element() as HTMLElement).focus();
		props.open = true;
		await expect.poll(focused).toBe('first');
		await userEvent.tab();
		await userEvent.tab();
		expect(focused()).toBe('last');
		await userEvent.tab();
		expect(focused()).toBe('first');
		await userEvent.tab({ shift: true });
		expect(focused()).toBe('last');
		// Focus moved outside by a script comes back into the trap.
		(page.getByTestId('after').element() as HTMLElement).focus();
		expect(focused()).toBe('last');
		props.open = false;
		await expect.poll(focused).toBe('before');
	});

	it('lets Tab leave a scope that does not trap', async () => {
		const props = $state({ open: false, trap: false });
		render(FocusHarness, props);
		props.open = true;
		await expect.poll(focused).toBe('first');
		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		expect(focused()).toBe('r1');
	});
});

describe('rovingFocus', () => {
	it('keeps one Tab stop and moves with the arrows, skipping disabled items', async () => {
		render(FocusHarness, {});
		const items = ['r1', 'r2', 'r3', 'r4'].map(
			(id) => page.getByTestId(id).element() as HTMLElement
		);
		expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);
		items[0]?.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(focused()).toBe('r3');
		await userEvent.keyboard('{End}');
		expect(focused()).toBe('r4');
		await userEvent.keyboard('{ArrowRight}');
		expect(focused()).toBe('r4');
		await userEvent.keyboard('{Home}');
		expect(focused()).toBe('r1');
		await userEvent.keyboard('{ArrowRight}');
		expect(items.map((item) => item.tabIndex)).toEqual([-1, -1, 0, -1]);
		// Tab leaves the group from its only stop.
		await userEvent.tab();
		expect(focused()).toBe('g1');
		await userEvent.tab({ shift: true });
		expect(focused()).toBe('r3');
	});

	it('loops and swaps the arrows right to left', async () => {
		render(FocusHarness, { loop: true, dir: 'rtl' });
		(page.getByTestId('r1').element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(focused()).toBe('r4');
		await userEvent.keyboard('{ArrowLeft}');
		expect(focused()).toBe('r1');
	});
});

describe('edgeFocus and focusBorder', () => {
	it('moves through a grid with the arrows and stops at its edges', async () => {
		render(FocusHarness, {});
		(page.getByTestId('g1').element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(focused()).toBe('g2');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('g4');
		await userEvent.keyboard('{ArrowLeft}');
		expect(focused()).toBe('g3');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('g3');
		await userEvent.keyboard('{ArrowLeft}');
		expect(focused()).toBe('g3');
	});

	it('draws the ring only for keyboard focus inside', async () => {
		render(FocusHarness, {});
		const grid = page.getByTestId('grid').element() as HTMLElement;
		expect(grid.dataset.oito2FocusBorder).toBe('auto');
		expect(getComputedStyle(grid).borderTopLeftRadius).toBe('12px');
		expect(getComputedStyle(grid).outlineStyle).toBe('none');
		await page.getByTestId('g1').click();
		expect(getComputedStyle(grid).outlineStyle).toBe('none');
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => getComputedStyle(grid).outlineStyle).toBe('solid');
		expect(getComputedStyle(grid).outlineWidth).toBe('2px');
	});
});
