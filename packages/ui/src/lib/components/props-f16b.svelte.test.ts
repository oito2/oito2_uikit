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

import { el, wait } from '@oito2/ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PropsHarness from '../../tests/PropsHarness.svelte';

describe('Handlers given to tooltip triggers', () => {
	it('run while the tooltip still shows on keyboard focus', async () => {
		const log: string[] = [];
		render(PropsHarness, { show: 'tooltip-triggers', log });
		el(page.getByRole('button', { name: 'Favorite' })).focus();
		for (const name of ['Bold', 'Options', 'Blue']) {
			await userEvent.tab();
			await expect.element(page.getByRole('tooltip')).toHaveTextContent(name);
			await expect
				.element(page.getByRole('button', { name }))
				.toHaveAttribute('aria-describedby', el(page.getByRole('tooltip')).id);
		}
		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await expect.element(page.getByRole('tooltip')).toHaveTextContent('Favorite');
		expect(log).toEqual([
			'icon-button',
			'toggle-item',
			'option-button',
			'color-disk',
			'option-button',
			'toggle-item',
			'icon-button'
		]);
	});

	it('keep a toggle group item toggling', async () => {
		const log: string[] = [];
		const props = $state({ show: 'tooltip-triggers' as const, log, toggles: [] as string[] });
		render(PropsHarness, props);
		await page.getByRole('button', { name: 'Bold' }).click();
		expect(props.toggles).toEqual(['bold']);
		expect(props.log).toContain('toggle-item');
	});
});

describe('Handlers given to menu and popover triggers', () => {
	it('run before the menu opens, and can keep it closed', async () => {
		const log: string[] = [];
		const props = $state({ show: 'menu' as const, log, cancel: false });
		render(PropsHarness, props);
		const trigger = page.getByRole('button', { name: 'Actions' });
		await trigger.click();
		await expect.element(page.getByRole('menu')).toBeInTheDocument();
		expect(props.log).toContain('menu-click');
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

		props.cancel = true;
		el(trigger).focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(props.log).toContain('menu-key');
		await wait(50);
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('run before the popover opens, and can keep it closed', async () => {
		const log: string[] = [];
		const props = $state({ show: 'popover' as const, log, cancel: false });
		render(PropsHarness, props);
		const trigger = page.getByRole('button', { name: 'Details' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside popover' })).toBeVisible();
		expect(props.log).toEqual(['popover-click']);
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

		props.cancel = true;
		await trigger.click();
		expect(props.log).toEqual(['popover-click', 'popover-click']);
		await wait(50);
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});
});

describe('A handler given to Sheet.Close', () => {
	it('runs and the sheet still closes', async () => {
		const log: string[] = [];
		const props = $state({ show: 'sheet' as const, log, sheetOpen: true });
		render(PropsHarness, props);
		await page.getByRole('button', { name: 'Done' }).click();
		expect(props.log).toEqual(['sheet-close']);
		expect(props.sheetOpen).toBe(false);
	});

	it('keeps the sheet open when it prevents the default', async () => {
		const log: string[] = [];
		const props = $state({ show: 'sheet' as const, log, sheetOpen: true, cancel: true });
		render(PropsHarness, props);
		await page.getByRole('button', { name: 'Done' }).click();
		expect(props.log).toEqual(['sheet-close']);
		expect(props.sheetOpen).toBe(true);
	});
});

describe('A handler given to HoverCard.Content', () => {
	it('runs and the pointer on the card still keeps it open', async () => {
		const log: string[] = [];
		render(PropsHarness, { show: 'hover-card', log });
		await page.getByRole('link', { name: '@ana' }).hover();
		const card = page.getByText('Ana Souza, designer');
		await expect.element(card).toBeVisible();
		await card.hover();
		await wait(150);
		await expect.element(card).toBeVisible();
		expect(log).toContain('card-enter');
	});
});

describe('Attributes given to ThemeProvider and Chip', () => {
	it('keeps the style given to ThemeProvider next to the theme', async () => {
		render(PropsHarness, { show: 'theme' });
		const root = el(page.getByText('Themed')).closest<HTMLElement>('.oito2-theme')!;
		expect(root.style.minHeight).toBe('123px');
		expect(root.style.getPropertyValue('color-scheme')).toBe('light');
	});

	it('puts the attributes of a removable chip without onclick on its label', async () => {
		const log: string[] = [];
		render(PropsHarness, { show: 'chip', log });
		const main = el(page.getByText('Svelte')).closest<HTMLElement>('.oito2-chip-main')!;
		expect(main.id).toBe('tag-chip');
		expect(main.dataset['kind']).toBe('tag');
		await page.getByRole('button', { name: 'Dismiss' }).click();
		expect(log).toEqual(['remove']);
	});
});

describe('Handlers given to EditableLabel', () => {
	it('run and the label still starts editing', async () => {
		const log: string[] = [];
		render(PropsHarness, { show: 'editable-label', log });
		const label = page.getByRole('button', { name: 'Notes' });
		el(label).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByRole('textbox')).toHaveFocus();
		expect(log).toEqual(['label-key']);
		await userEvent.keyboard('{Escape}');
		await label.dblClick();
		await expect.element(page.getByRole('textbox')).toHaveFocus();
		expect(log).toContain('label-dblclick');
	});

	it('keep the label from editing when they prevent the default', async () => {
		const log: string[] = [];
		render(PropsHarness, { show: 'editable-label', log, cancel: true });
		const label = page.getByRole('button', { name: 'Notes' });
		el(label).focus();
		await userEvent.keyboard('{Enter}');
		await label.dblClick();
		expect(log).toContain('label-key');
		expect(log).toContain('label-dblclick');
		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
	});
});

describe('An oninput given to TimeEntry', () => {
	it('runs and the text is still parsed', async () => {
		const log: string[] = [];
		const props = $state({
			show: 'time-entry' as const,
			log,
			time: null as { hour: number; minute: number } | null
		});
		render(PropsHarness, props);
		await page.getByRole('textbox', { name: 'Time' }).fill('7h05');
		expect(props.log).toContain('time-input');
		expect(props.time).toEqual({ hour: 7, minute: 5 });
	});
});
