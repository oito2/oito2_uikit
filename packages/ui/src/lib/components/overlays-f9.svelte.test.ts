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

import { el, settleAnimations, wait } from '@oito2/ui-test-utils';
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import OverlaysF9Harness from '../../tests/OverlaysF9Harness.svelte';
import PickersGallery from '../../tests/PickersGallery.svelte';
import { ToasterStore } from './toast/toaster.svelte.js';
import { TourController } from './tour/tour-controller.svelte.js';
import { KeyChord, Shortcut } from '../shortcuts/shortcut.js';

describe('Popover', () => {
	it('moves focus in, keeps an inner popover inside it and returns focus on Escape', async () => {
		render(OverlaysF9Harness, { show: 'popover' });
		const trigger = page.getByRole('button', { name: 'Options' });
		await trigger.click();
		const dialog = page.getByRole('dialog', { name: 'Options' });
		await expect.element(dialog).toBeVisible();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		await page.getByRole('button', { name: 'More' }).click();
		await page.getByRole('button', { name: 'Inner' }).click();
		await expect.element(dialog).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('button', { name: 'Inner' })).not.toBeInTheDocument();
		await expect.element(dialog).toBeVisible();
		el(page.getByRole('textbox', { name: 'Name' })).focus();
		await userEvent.keyboard('{Escape}');
		await expect.element(dialog).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});

	it('closes on a click outside and flips above a trigger at the bottom', async () => {
		render(OverlaysF9Harness, { show: 'popover', bottomTrigger: true });
		await page.getByRole('button', { name: 'Options' }).click();
		const dialog = page.getByRole('dialog', { name: 'Options' });
		await expect.element(dialog).toHaveAttribute('data-placement', 'top-start');
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await expect.element(dialog).not.toBeInTheDocument();
	});
});

describe('HoverCard and ContextMenu', () => {
	it('opens the card on hover and keyboard focus', async () => {
		render(OverlaysF9Harness, { show: 'hover-card' });
		await page.getByRole('link', { name: '@ana' }).hover();
		const card = page.getByText('Ana Souza, designer');
		await expect.element(card).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: '@ana' }))
			.toHaveAccessibleDescription('Ana Souza, designer');
		await page.getByRole('link', { name: '@ana' }).unhover();
		await expect.element(card).not.toBeInTheDocument();
		el(page.getByRole('link', { name: '@ana' })).focus();
		await expect.element(card).toBeVisible();
	});

	it('opens at the pointer and from Shift+F10 with the first item focused', async () => {
		const log: string[] = [];
		render(OverlaysF9Harness, { show: 'context-menu', log });
		const area = el(page.getByRole('button', { name: 'Canvas' }));
		const box = area.getBoundingClientRect();
		area.dispatchEvent(
			new MouseEvent('contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: box.left + 30,
				clientY: box.top + 40
			})
		);
		const menu = page.getByRole('menu');
		await expect.element(menu).toBeVisible();
		await expect
			.poll(() => Math.abs(el(menu).getBoundingClientRect().left - (box.left + 30)))
			.toBeLessThan(4);
		await page.getByRole('menuitem', { name: 'Paste' }).click();
		expect(log).toEqual(['paste']);
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		area.focus();
		await userEvent.keyboard('{Shift>}{F10}{/Shift}');
		await expect.element(page.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});
});

describe('Calendar and DatePicker', () => {
	it('moves through the grid with the keyboard and picks a day', async () => {
		const props = $state({ show: 'calendar', date: new Date(2026, 10, 4) as Date | null });
		render(OverlaysF9Harness, props);
		const day = (label: string) => page.getByRole('button', { name: label });
		el(day('Wednesday, November 4, 2026')).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(day('Thursday, November 5, 2026')).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(day('Thursday, November 12, 2026')).toHaveFocus();
		await userEvent.keyboard('{Home}');
		await expect.element(day('Sunday, November 8, 2026')).toHaveFocus();
		await userEvent.keyboard('{PageDown}');
		await expect.element(day('Tuesday, December 8, 2026')).toHaveFocus();
		await userEvent.keyboard('{PageDown}');
		await expect.element(day('Thursday, December 31, 2026')).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		expect(props.date).toEqual(new Date(2026, 11, 31));
		await expect.element(page.getByText('December 2026')).toBeVisible();
		await expect
			.element(page.getByRole('rowheader').first())
			.toHaveAttribute('aria-label', 'Week 49');
	});

	it('picks a range in either order', async () => {
		const props = $state({
			show: 'calendar',
			rangeMode: true,
			range: null as { start: Date; end: Date } | null
		});
		render(OverlaysF9Harness, props);
		await page.getByRole('button', { name: 'Tuesday, November 10, 2026' }).click();
		await page.getByRole('button', { name: 'Thursday, November 5, 2026' }).click();
		expect(props.range).toEqual({ start: new Date(2026, 10, 5), end: new Date(2026, 10, 10) });
	});

	it('opens a calendar from the date entry button', async () => {
		const props = $state({ show: 'date-entry', date: new Date(2026, 10, 4) as Date | null });
		render(OverlaysF9Harness, props);
		await page.getByRole('button', { name: 'Select date' }).click();
		await expect
			.element(page.getByRole('button', { name: 'Wednesday, November 4, 2026' }))
			.toHaveFocus();
		await userEvent.keyboard('{ArrowRight}{Enter}');
		expect(props.date).toEqual(new Date(2026, 10, 5));
		await expect.element(page.getByRole('textbox', { name: 'Due' })).toHaveValue('11/5/2026');
		await expect.element(page.getByRole('grid')).not.toBeInTheDocument();
	});
});

describe('ColorPicker', () => {
	it('applies hex, RGB and HSL fields and the hue slider', async () => {
		const props = $state({ show: 'color', color: '#3584E4' });
		render(OverlaysF9Harness, props);
		const hex = page.getByRole('textbox', { name: 'Hex' });
		await hex.fill('#f00');
		await userEvent.keyboard('{Enter}');
		expect(props.color).toBe('#FF0000');
		await page.getByRole('radio', { name: 'RGB' }).click();
		await page.getByRole('textbox', { name: 'Green' }).fill('128');
		await userEvent.keyboard('{Tab}');
		expect(props.color).toBe('#FF8000');
		await page.getByRole('radio', { name: 'HSL' }).click();
		await expect.element(page.getByRole('textbox', { name: 'Hue' })).toHaveValue('30');
		el(page.getByRole('slider', { name: 'Hue' })).focus();
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
		await expect
			.element(page.getByRole('slider', { name: 'Hue' }))
			.toHaveAttribute('aria-valuenow', '66');
		el(page.getByRole('slider', { name: 'Opacity' })).focus();
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
		expect(props.color).toMatch(/E6$/);
		await page.getByRole('button', { name: '#3A944A' }).click();
		expect(props.color).toBe('#3A944A');
	});
});

describe('Sheet', () => {
	it('traps focus, moves between snap points and returns focus', async () => {
		const props = $state({ show: 'sheet', sheetOpen: false, snap: 0 });
		render(OverlaysF9Harness, props);
		const trigger = page.getByRole('button', { name: 'Open sheet' });
		await trigger.click();
		const sheet = page.getByRole('dialog', { name: 'Filters' });
		await expect.element(sheet).toBeVisible();
		await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}');
		expect(el(sheet).contains(document.activeElement)).toBe(true);
		el(page.getByRole('button', { name: 'Resize sheet' })).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(props.snap).toBe(1);
		await userEvent.keyboard('{Enter}');
		expect(props.snap).toBe(0);
		await userEvent.keyboard('{Escape}');
		expect(props.sheetOpen).toBe(false);
		await expect.element(trigger).toHaveFocus();
	});
});

describe('Toaster', () => {
	it('shows toasts, pauses while hovered and closes on its button', async () => {
		const store = new ToasterStore();
		render(OverlaysF9Harness, { show: 'toast', store });
		store.show({ title: 'Saved', type: 'success', duration: 800 });
		const toast = page.getByRole('status').filter({ hasText: 'Saved' });
		await expect.element(toast).toBeVisible();
		await wait(250);
		await toast.hover();
		await wait(1200);
		await expect.element(toast).toBeVisible();
		await page.getByRole('button', { name: 'Dismiss' }).click();
		await expect.element(toast).not.toBeInTheDocument();
		store.show({ title: 'Gone soon', duration: 200 });
		await expect.element(page.getByText('Gone soon')).toBeVisible();
		await page.getByRole('button', { name: 'Dismiss' }).unhover();
		document.querySelector('.oito2-toaster')?.dispatchEvent(new PointerEvent('pointerleave'));
		await expect.element(page.getByText('Gone soon')).not.toBeInTheDocument();
	});
});

describe('FloatingPanel', () => {
	it('moves and resizes with the keyboard and closes', async () => {
		const log: string[] = [];
		const props = $state({
			show: 'panel',
			log,
			rect: { x: 20, y: 20, width: 260, height: 180 }
		});
		render(OverlaysF9Harness, props);
		const panel = page.getByRole('dialog', { name: 'Tools' });
		el(panel).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowDown}');
		expect(props.rect).toEqual({ x: 36, y: 36, width: 260, height: 180 });
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
		expect(props.rect.width).toBe(276);
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
		expect(props.rect.x).toBe(0);
		await page.getByRole('button', { name: 'Close' }).click();
		expect(props.log).toEqual(['close']);
	});
});

describe('Tour', () => {
	it('spotlights the target, steps with the keys and reports the end', async () => {
		const log: string[] = [];
		const tour = new TourController([
			{ title: 'First', target: '#tour-target', description: 'The target.' },
			{ title: 'Second' }
		]);
		render(OverlaysF9Harness, { show: 'tour', tour, log });
		tour.start();
		const card = page.getByRole('dialog', { name: 'First' });
		await expect.element(card).toHaveAccessibleDescription('The target.');
		await expect.element(page.getByRole('button', { name: 'Next' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('dialog', { name: 'Second' })).toBeVisible();
		await page.getByRole('button', { name: 'Done' }).click();
		expect(log).toEqual(['finish true']);
		tour.start();
		await expect.element(page.getByRole('dialog', { name: 'First' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		expect(log).toEqual(['finish true', 'finish false']);
	});
});

describe('Shortcuts', () => {
	it('records a shortcut with the platform command key and labels it', async () => {
		const props = $state({ show: 'recorder', shortcut: null as Shortcut | null });
		render(OverlaysF9Harness, props);
		const field = page.getByRole('button', { name: /Shortcut/ });
		await field.click();
		await expect.element(field).toHaveAccessibleName('Shortcut: Press a shortcut');
		await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
		expect(props.shortcut?.label('macos')).toBe('⇧⌘K');
		await expect.element(field).toHaveAccessibleName('Shortcut: Ctrl+Shift+K');
		await page.getByRole('button', { name: 'Clear shortcut' }).click();
		expect(props.shortcut).toBeNull();
	});

	it('labels shortcuts with Apple symbols on macOS', async () => {
		const props = $state({
			show: 'recorder',
			os: 'macos' as const,
			shortcut: new Shortcut([new KeyChord('k', { primary: true })]) as Shortcut | null
		});
		render(OverlaysF9Harness, props);
		await expect
			.element(page.getByRole('button', { name: /Shortcut/ }))
			.toHaveAccessibleName('Shortcut: ⌘K');
		await expect.element(page.getByText('⌘K').last()).toBeVisible();
	});

	it('filters commands, runs the highlighted one and closes', async () => {
		const log: string[] = [];
		const command = (id: string, label: string) => ({
			id,
			label,
			onInvoke: () => log.push(id)
		});
		const props = $state({
			show: 'palette',
			paletteOpen: true,
			log,
			commands: [
				command('open', 'Open file'),
				command('save', 'Save file'),
				command('quit', 'Quit')
			]
		});
		render(OverlaysF9Harness, props);
		const search = page.getByRole('combobox', { name: 'Type a command' });
		await expect.element(search).toHaveFocus();
		await userEvent.keyboard('file');
		expect(page.getByRole('option').elements()).toHaveLength(2);
		await userEvent.keyboard('{ArrowDown}{Enter}');
		expect(log).toEqual(['save']);
		expect(props.paletteOpen).toBe(false);
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('pickers gallery', () => {
	beforeEach(async () => {
		await page.viewport(840, 1000);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(PickersGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await wait(400);
			await settleAnimations();
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(PickersGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await wait(400);
			await settleAnimations();
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`pickers-${scheme.name}`);
		});
	}
});
