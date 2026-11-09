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

import { el } from '@oito2/ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ControlledHarness from '../../tests/ControlledHarness.svelte';

describe('Values passed without bind', () => {
	// A value passed without `bind:` changes inside the component until the parent passes
	// a new one; every change is reported.
	it('report page changes', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'controlled', log });
		const previous = page.getByRole('button', { name: 'Previous page' });
		await previous.click();
		expect(log).toEqual(['pagination:1']);
		await expect.element(previous).toBeDisabled();
		await page.getByRole('button', { name: 'Next page' }).click();
		expect(log).toEqual(['pagination:1', 'pagination:2']);

		await page.getByRole('button', { name: 'Page 3 of 4', exact: true }).click();
		expect(log.at(-1)).toBe('indicator:2');
		await expect
			.element(page.getByRole('button', { name: 'Page 3 of 4', exact: true }))
			.toHaveAttribute('aria-current', 'step');
	});

	it('report rating and angle changes', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'controlled', log });
		const rating = page.getByRole('slider', { name: 'Fixed rating' });
		el(rating).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		expect(log).toEqual(['rating:3', 'rating:4']);
		await expect.element(rating).toHaveAttribute('aria-valuenow', '4');

		const angle = page.getByRole('slider', { name: 'Fixed angle' });
		el(angle).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(log.slice(2)).toEqual(['angle:45', 'angle-commit:45']);
		await expect.element(angle).toHaveAttribute('aria-valuenow', '45');
	});

	it('report number and code changes', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'controlled', log });
		const amount = page.getByRole('spinbutton', { name: 'Fixed amount' });
		el(amount).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(log).toEqual(['number:6']);
		await expect.element(amount).toHaveValue('6');

		const code = page.getByRole('textbox', { name: 'Fixed code' });
		el(code).focus();
		await userEvent.keyboard('{End}3');
		expect(log.at(-1)).toBe('pin:123');
		await expect.element(code).toHaveValue('123');
	});

	it('report picked days and colors', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'controlled', log });
		await page.getByRole('button', { name: 'Friday, November 13, 2026' }).click();
		expect(log).toEqual(['calendar:13']);
		await expect
			.element(page.getByRole('button', { name: 'Friday, November 13, 2026' }))
			.toHaveAttribute('data-selected', '');

		await page.getByRole('button', { name: '#E62D42' }).click();
		expect(log.at(-1)).toBe('color:#E62D42');
		await expect.element(page.getByRole('textbox', { name: 'Hex' })).toHaveValue('#E62D42');
	});
});

describe('Default values of uncontrolled components', () => {
	it('starts every component at its default value', async () => {
		render(ControlledHarness, { show: 'defaults' });
		await expect
			.element(page.getByRole('button', { name: 'Page 3 of 4', exact: true }))
			.toHaveAttribute('aria-current', 'step');
		await expect.element(page.getByRole('spinbutton', { name: 'Amount' })).toHaveValue('7');
		await expect.element(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('report');
		const password = page.getByLabelText('Password', { exact: true });
		await expect.element(password).toHaveValue('secret');
		await expect.element(password).toHaveAttribute('type', 'text');
		await expect.element(page.getByRole('button', { name: 'Hide password' })).toBeVisible();
		await expect.element(page.getByRole('textbox', { name: 'Code' })).toHaveValue('34');
		await expect.element(page.getByText('red', { exact: true })).toBeVisible();
		await expect.element(page.getByText('green', { exact: true })).toBeVisible();
		await expect.element(page.getByRole('textbox', { name: 'Part 1 of 2' })).toHaveValue('10');
		await expect.element(page.getByRole('textbox', { name: 'Part 2 of 2' })).toHaveValue('0');
		await expect
			.element(page.getByRole('button', { name: 'Accent: #E62D42' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Due: 11/4/2026' })).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Thursday, November 12, 2026' }))
			.toHaveAttribute('data-selected', '');
	});

	it('changes an uncontrolled value from its default', async () => {
		render(ControlledHarness, { show: 'defaults' });
		const amount = page.getByRole('spinbutton', { name: 'Amount' });
		el(amount).focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(amount).toHaveValue('8');

		await page.getByRole('button', { name: 'Page 1 of 4', exact: true }).click();
		await expect
			.element(page.getByRole('button', { name: 'Page 1 of 4', exact: true }))
			.toHaveAttribute('aria-current', 'step');

		const search = page.getByRole('searchbox', { name: 'Search' });
		el(search).focus();
		await userEvent.keyboard('{Escape}');
		await expect.element(search).toHaveValue('');

		await page.getByRole('button', { name: 'Friday, November 13, 2026' }).click();
		await expect
			.element(page.getByRole('button', { name: 'Friday, November 13, 2026' }))
			.toHaveAttribute('data-selected', '');
	});
});

describe('Overlays opened by default', () => {
	it('opens a select from defaultOpen and reports when it closes and opens', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'select', log });
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(log).toEqual([]);
		await page.getByRole('option', { name: 'Banana' }).click();
		expect(log).toEqual(['select:false']);
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		const trigger = page.getByRole('combobox', { name: 'Fruit' });
		await expect.element(trigger).toHaveTextContent('Banana');
		await trigger.click();
		expect(log).toEqual(['select:false', 'select:true']);
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
	});

	it('opens a menu from defaultOpen and reports when it closes', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'menu', log });
		await expect.element(page.getByRole('menu')).toBeInTheDocument();
		await page.getByRole('menuitem', { name: 'Copy' }).click();
		expect(log).toEqual(['copy', 'menu:false']);
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('opens a tooltip from defaultOpen', async () => {
		render(ControlledHarness, { show: 'tooltip' });
		await expect.element(page.getByRole('tooltip')).toHaveTextContent('About the text');
	});
});

describe('Consumer handlers next to internal ones', () => {
	it('runs the handlers of a rating and a dial and keeps their behavior', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'handlers', log });
		const stars = page.getByRole('slider', { name: 'Stars' });
		await stars.click({ position: { x: 4, y: 8 } });
		expect(log).toContain('rating-click');
		el(stars).focus();
		await userEvent.keyboard('{End}');
		expect(log).toContain('rating-key');
		await expect.element(stars).toHaveAttribute('aria-valuenow', '5');

		const angle = page.getByRole('slider', { name: 'Angle' });
		el(angle).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(log).toContain('angle-key');
		await expect.element(angle).toHaveAttribute('aria-valuenow', '1');
	});

	it('runs the input handlers of a number entry and a code entry and keeps their behavior', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'handlers', log });
		const amount = page.getByRole('spinbutton', { name: 'Amount' });
		await amount.fill('4');
		await userEvent.keyboard('{Enter}');
		expect(log).toContain('number-input');
		expect(log).toContain('number:4');
		await expect.element(amount).toHaveValue('4');

		const code = page.getByRole('textbox', { name: 'Code' });
		await code.click();
		await userEvent.keyboard('12');
		expect(log).toContain('pin-focus');
		expect(log).toContain('pin-input');
		expect(log).toContain('pin:12');
		await expect.element(code).toHaveValue('12');
	});

	it('runs the handlers of the picker buttons and still opens their popovers', async () => {
		const log: string[] = [];
		render(ControlledHarness, { show: 'handlers', log });
		const due = page.getByRole('button', { name: /^Due/ });
		await due.click();
		expect(log).toContain('date-click');
		await expect.element(page.getByRole('dialog', { name: 'Select date' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect
			.element(page.getByRole('dialog', { name: 'Select date' }))
			.not.toBeInTheDocument();
		el(due).focus();
		await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
		expect(log).toContain('date-key');
		await expect.element(page.getByRole('dialog', { name: 'Select date' })).toBeVisible();
		await userEvent.keyboard('{Escape}');

		await page.getByRole('button', { name: /^Accent/ }).click();
		expect(log).toContain('color-click');
		await expect.element(page.getByRole('dialog', { name: 'Accent' })).toBeVisible();
	});
});
