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
import NestingHarness from '../../tests/NestingHarness.svelte';
import OverlayHarness from '../../tests/OverlayHarness.svelte';
import OverlaysF9Harness from '../../tests/OverlaysF9Harness.svelte';

/** Returns the text of the focused element. */
const focused = () => document.activeElement?.textContent?.trim();

/** Returns the element of a locator. */
const el = (locator: { element(): Element }) => locator.element() as HTMLElement;

/** Waits for the next task, after which the layers listen for outside presses. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

describe('Overlays inside a dialog', () => {
	it('keeps focus in a select opened from a dialog', async () => {
		const props = $state({ show: 'dialog' as const, fruit: null as string | null });
		render(NestingHarness, props);
		await page.getByRole('button', { name: 'Open dialog' }).click();
		const trigger = page.getByRole('combobox');
		el(trigger).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(focused()).toBe('Apple');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('Banana');
		await userEvent.keyboard('{Enter}');
		expect(props.fruit).toBe('Banana');
		expect(document.activeElement).toBe(el(trigger));
		await expect.element(page.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
	});

	it('keeps focus in a popover and a menu opened from a dialog', async () => {
		const log: string[] = [];
		render(NestingHarness, { show: 'dialog', log });
		await page.getByRole('button', { name: 'Open dialog' }).click();
		await page.getByRole('button', { name: 'Details' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside popover' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('button', { name: 'Details' })).toHaveFocus();

		el(page.getByRole('button', { name: 'Actions' })).focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('Copy');
		await userEvent.keyboard('{ArrowDown}{Enter}');
		expect(log).toEqual(['cut']);
		await expect.element(page.getByRole('button', { name: 'Actions' })).toHaveFocus();
		await expect.element(page.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
	});

	it('keeps focus in a menu opened from a modal sheet', async () => {
		render(NestingHarness, { show: 'sheet' });
		await page.getByRole('button', { name: 'Open sheet' }).click();
		el(page.getByRole('button', { name: 'Sort' })).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('menu')).toBeInTheDocument();
		expect(focused()).toBe('By name');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('By date');
	});

	it('returns focus to a fallback when the trigger is gone', async () => {
		render(NestingHarness, { show: 'remove' });
		await page.getByRole('button', { name: 'Delete One' }).click();
		await page.getByRole('button', { name: 'Confirm' }).click();
		await expect
			.element(page.getByRole('button', { name: 'Delete One' }))
			.not.toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Rows' })).toHaveFocus();
	});
});

describe('CommandPalette', () => {
	it('runs a command after closing, so its dialog returns focus to the opener', async () => {
		render(NestingHarness, { show: 'palette' });
		const opener = page.getByRole('button', { name: 'Commands' });
		await opener.click();
		await expect.element(page.getByRole('combobox')).toHaveFocus();
		await userEvent.keyboard('About{Enter}');
		await expect.element(page.getByRole('dialog', { name: 'About' })).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('dialog', { name: 'About' })).not.toBeInTheDocument();
		await expect.element(opener).toHaveFocus();
	});
});

describe('Menu keyboard', () => {
	it('moves focus back to the trigger on Tab, so Tab goes on from it', async () => {
		render(OverlayHarness, {});
		const trigger = page.getByRole('button', { name: 'Actions' });
		el(trigger).focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('Copy');
		await userEvent.tab();
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		await expect.element(page.getByRole('combobox')).toHaveFocus();
	});

	it('closes on a right click outside', async () => {
		render(OverlayHarness, {});
		await page.getByRole('button', { name: 'Actions' }).click();
		await settle();
		await page.getByTestId('outside').click({ button: 'right' });
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('opens a submenu on hover without taking focus from its trigger', async () => {
		render(OverlayHarness, {});
		el(page.getByRole('button', { name: 'Actions' })).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe('More');
		await page.getByRole('menuitem', { name: 'More' }).hover();
		await expect.element(page.getByRole('menu', { name: 'More' })).toBeInTheDocument();
		expect(focused()).toBe('More');
		await userEvent.keyboard('{ArrowRight}');
		expect(focused()).toBe('Share');
	});

	it('enters a context menu opened by the pointer with the arrow keys', async () => {
		render(OverlaysF9Harness, { show: 'context-menu' });
		const area = el(page.getByRole('button', { name: 'Canvas' }));
		const box = area.getBoundingClientRect();
		const openAt = (x: number, y: number) =>
			area.dispatchEvent(
				new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					clientX: box.left + x,
					clientY: box.top + y
				})
			);
		openAt(10, 10);
		const menu = page.getByRole('menu');
		await expect.element(menu).toBeVisible();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
		// A second right click moves the open menu to the new point.
		openAt(60, 30);
		await expect
			.poll(() => Math.abs(el(menu).getBoundingClientRect().left - (box.left + 60)))
			.toBeLessThan(4);
		await userEvent.keyboard('{End}');
		await expect.element(page.getByRole('menuitem', { name: 'Paste' })).toHaveFocus();
	});
});
