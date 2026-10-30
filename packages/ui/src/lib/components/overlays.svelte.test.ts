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
import OverlayHarness from '../../tests/OverlayHarness.svelte';

/** Returns the text of the focused element. */
const focused = () => document.activeElement?.textContent?.trim();

/** Waits for the next task, after which the layers listen for outside presses. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

describe('Tooltip', () => {
	it('shows on keyboard focus and hides on Escape', async () => {
		render(OverlayHarness, {});
		(page.getByRole('button', { name: 'Info' }).element() as HTMLElement).focus();
		// Focus that comes from the keyboard is visible, so the tooltip shows at once.
		await userEvent.tab();
		await userEvent.tab({ shift: true });
		await expect.element(page.getByRole('tooltip')).toHaveTextContent('More information');
		await expect
			.element(page.getByRole('button', { name: 'Info' }))
			.toHaveAttribute('aria-describedby', page.getByRole('tooltip').element().id);
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
	});

	it('shows after the hover delay', async () => {
		render(OverlayHarness, {});
		await page.getByRole('button', { name: 'Info' }).hover();
		await expect.element(page.getByRole('tooltip')).toBeInTheDocument();
		await page.getByTestId('outside').hover();
		await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
	});
});

describe('Dialog', () => {
	it('moves focus in, traps it, closes on Escape and restores focus', async () => {
		render(OverlayHarness, {});
		const trigger = page.getByRole('button', { name: 'Open dialog' });
		await trigger.click();
		const dialog = page.getByRole('dialog', { name: 'Settings' });
		await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
		await expect.element(dialog).toHaveAccessibleDescription('Change the settings.');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
		await userEvent.keyboard('{Escape}');
		await expect.element(dialog).not.toBeInTheDocument();
		expect(document.activeElement).toBe(trigger.element());
	});

	it('closes on an outside click and from a close button', async () => {
		render(OverlayHarness, {});
		await page.getByRole('button', { name: 'Open dialog' }).click();
		await settle();
		await page.getByRole('button', { name: 'Done' }).click();
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		await page.getByRole('button', { name: 'Open dialog' }).click();
		await settle();
		const overlay = document.querySelector('.oito2-dialog-overlay') as HTMLElement;
		await userEvent.click(overlay, { position: { x: 5, y: 5 } });
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('asks to confirm in an alert dialog that only its buttons close', async () => {
		const props = $state({ log: [] as string[], alertOpen: false });
		render(OverlayHarness, props);
		await page.getByRole('button', { name: 'Delete', exact: true }).click();
		const alert = page.getByRole('alertdialog', { name: 'Delete it?' });
		await expect.element(alert).toBeInTheDocument();
		expect(focused()).toBe('Delete');
		await settle();
		const overlay = document.querySelector('.oito2-dialog-overlay') as HTMLElement;
		await userEvent.click(overlay, { position: { x: 5, y: 5 } });
		await expect.element(alert).toBeInTheDocument();
		await page.getByRole('button', { name: 'Keep' }).click();
		await expect.element(alert).not.toBeInTheDocument();
		expect(props.log).toEqual(['cancel']);
		await page.getByRole('button', { name: 'Delete', exact: true }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
		expect(props.log).toEqual(['cancel', 'confirm']);
		expect(props.alertOpen).toBe(false);
	});
});

describe('Menu', () => {
	it('opens from the keyboard, loops, finds items by typing and runs them', async () => {
		const log: string[] = [];
		render(OverlayHarness, { log });
		const trigger = page.getByRole('button', { name: 'Actions' });
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('menu')).toBeInTheDocument();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(focused()).toBe('Copy');
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe('More');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('Copy');
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		// The disabled item is skipped.
		expect(focused()).toBe('Hidden files');
		await userEvent.keyboard('c');
		expect(focused()).toBe('Copy');
		await userEvent.keyboard('c');
		expect(focused()).toBe('Cut');
		await userEvent.keyboard('{Enter}');
		expect(log).toEqual(['cut']);
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		expect(document.activeElement).toBe(trigger.element());
	});

	it('toggles check box items without closing and checks radio items', async () => {
		const props = $state({ hidden: false, sort: 'name' as string | null });
		render(OverlayHarness, props);
		await page.getByRole('button', { name: 'Actions' }).click();
		await page.getByRole('menuitemcheckbox', { name: 'Hidden files' }).click();
		expect(props.hidden).toBe(true);
		await expect
			.element(page.getByRole('menuitemcheckbox', { name: 'Hidden files' }))
			.toHaveAttribute('aria-checked', 'true');
		await page.getByRole('menuitemradio', { name: 'By date' }).click();
		expect(props.sort).toBe('date');
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('opens submenus with the arrows and closes on Escape and outside clicks', async () => {
		const log: string[] = [];
		render(OverlayHarness, { log });
		const trigger = page.getByRole('button', { name: 'Actions' });
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe('More');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('menu', { name: 'More' })).toBeInTheDocument();
		expect(focused()).toBe('Share');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(page.getByRole('menu', { name: 'More' })).not.toBeInTheDocument();
		expect(focused()).toBe('More');
		await userEvent.keyboard('{Enter}{ArrowDown}{Enter}');
		expect(log).toEqual(['print']);
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		await trigger.click();
		await settle();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		await trigger.click();
		await settle();
		await page.getByTestId('outside').click();
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});
});

describe('Select', () => {
	it('opens on the selected option, chooses with the keyboard and shows the label', async () => {
		const props = $state({ fruit: 'Cherry' as string | null });
		render(OverlayHarness, props);
		const trigger = page.getByRole('combobox');
		await expect.element(trigger).toHaveTextContent('Cherry');
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(focused()).toBe('Cherry');
		await expect
			.element(page.getByRole('option', { name: 'Banana' }))
			.toHaveAttribute('aria-disabled', 'true');
		await userEvent.keyboard('{ArrowUp}{Enter}');
		expect(props.fruit).toBe('Apple');
		await expect.element(trigger).toHaveTextContent('Apple');
		expect(document.activeElement).toBe(trigger.element());
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		expect(document.activeElement).toBe(trigger.element());
	});

	it('shows the placeholder without a value', async () => {
		render(OverlayHarness, { fruit: null });
		await expect.element(page.getByRole('combobox')).toHaveTextContent('Fruit');
	});
});
