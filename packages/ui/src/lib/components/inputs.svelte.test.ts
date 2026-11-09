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
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import InputsGallery from '../../tests/InputsGallery.svelte';
import InputsHarness from '../../tests/InputsHarness.svelte';

describe('ToggleGroup', () => {
	it('toggles one item at a time and moves with the arrows, skipping disabled ones', async () => {
		const props = $state({ toggles: [] as readonly string[] });
		render(InputsHarness, props);
		const bold = page.getByRole('button', { name: 'Bold' });
		await bold.click();
		expect(props.toggles).toEqual(['bold']);
		await expect.element(bold).toHaveAttribute('aria-pressed', 'true');
		await page.getByRole('button', { name: 'Italic' }).click();
		expect(props.toggles).toEqual(['italic']);
		el(page.getByRole('button', { name: 'Italic' })).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('button', { name: 'Link' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(bold).toHaveFocus();
		await userEvent.keyboard(' ');
		expect(props.toggles).toEqual(['bold']);
	});

	it('keeps several items on when multiple', async () => {
		const props = $state({ toggles: [] as readonly string[], multiple: true });
		render(InputsHarness, props);
		await page.getByRole('button', { name: 'Bold' }).click();
		await page.getByRole('button', { name: 'Italic' }).click();
		expect(props.toggles).toEqual(['bold', 'italic']);
	});
});

describe('SegmentGroup and ChoiceChipBar', () => {
	it('selects segments with the arrows as radio buttons', async () => {
		const props = $state({ segment: 'day' as string | null });
		render(InputsHarness, props);
		el(page.getByRole('radio', { name: 'Day' })).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.segment).toBe('week');
		await expect
			.element(page.getByRole('radio', { name: 'Week' }))
			.toHaveAttribute('aria-checked', 'true');
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(props.segment).toBe('month');
	});

	it('selects several chips', async () => {
		const props = $state({ chips: [] as readonly string[] });
		render(InputsHarness, props);
		await page.getByRole('button', { name: 'New' }).click();
		await page.getByRole('button', { name: 'Open' }).click();
		expect(props.chips).toEqual(['new', 'open']);
	});
});

describe('SearchField and PasswordField', () => {
	it('clears on Escape, then reports Escape on the empty field', async () => {
		const props = $state({ search: '', escapes: 0 });
		render(InputsHarness, props);
		const field = page.getByRole('searchbox');
		await field.fill('apples');
		expect(props.search).toBe('apples');
		await expect.element(page.getByRole('button', { name: 'Clear text' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		expect(props.search).toBe('');
		await userEvent.keyboard('{Escape}');
		expect(props.escapes).toBe(1);
	});

	it('shows and hides the password', async () => {
		render(InputsHarness, {});
		const field = page.getByLabelText('Password', { exact: true });
		await expect.element(field).toHaveAttribute('type', 'password');
		await page.getByRole('button', { name: 'Show password' }).click();
		await expect.element(field).toHaveAttribute('type', 'text');
	});
});

describe('EditableLabel', () => {
	it('edits on Enter, keeps on Enter and restores on Escape', async () => {
		const props = $state({ label: 'Report' });
		render(InputsHarness, props);
		el(page.getByRole('button', { name: 'Report' })).focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('Summary{Enter}');
		expect(props.label).toBe('Summary');
		await expect.element(page.getByRole('button', { name: 'Summary' })).toHaveFocus();
		await userEvent.keyboard('{F2}');
		await userEvent.keyboard('Other{Escape}');
		expect(props.label).toBe('Summary');
	});
});

describe('PinEntry', () => {
	it('keeps digits, fills from a paste and completes', async () => {
		const props = $state({ pin: '', completed: '' });
		render(InputsHarness, {
			get pin() {
				return props.pin;
			},
			set pin(value) {
				props.pin = value;
			},
			onComplete: (code: string) => (props.completed = code)
		});
		const input = page.getByRole('textbox', { name: 'Code of 4 characters' });
		el(input).focus();
		await userEvent.keyboard('1a2');
		expect(props.pin).toBe('12');
		await userEvent.keyboard('{Backspace}');
		expect(props.pin).toBe('1');
		await userEvent.keyboard('{Backspace}');
		await navigator.clipboard?.writeText?.('9876').catch(() => {});
		el(input).dispatchEvent(new InputEvent('input', { bubbles: true }));
		(el(input) as HTMLInputElement).value = '98 76 5';
		el(input).dispatchEvent(new InputEvent('input', { bubbles: true }));
		expect(props.pin).toBe('9876');
		expect(props.completed).toBe('9876');
	});
});

describe('TagsField', () => {
	it('adds typed and pasted tags and removes them from the keyboard', async () => {
		const props = $state({ tags: [] as readonly string[] });
		render(InputsHarness, props);
		const input = page.getByRole('combobox', { name: 'Tags' });
		await input.click();
		await userEvent.keyboard('red,');
		expect(props.tags).toEqual(['red']);
		await userEvent.keyboard('red,');
		expect(props.tags).toEqual(['red']);
		await expect.element(input).toHaveValue('red');
		await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
		const native = el(input) as HTMLInputElement;
		native.value = 'green, blue, red, ';
		native.dispatchEvent(new InputEvent('input', { bubbles: true }));
		expect(props.tags).toEqual(['red', 'green', 'blue']);
		await expect.element(input).toHaveValue(' ');
		native.value = '';
		native.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await userEvent.keyboard('{Backspace}');
		await expect.element(page.getByRole('button', { name: 'blue', exact: true })).toHaveFocus();
		await userEvent.keyboard('{Delete}');
		expect(props.tags).toEqual(['red', 'green']);
		await expect
			.element(page.getByRole('button', { name: 'green', exact: true }))
			.toHaveFocus();
	});

	it('suggests tags not added yet', async () => {
		const props = $state({ tags: ['red'] as readonly string[] });
		render(InputsHarness, props);
		await page.getByRole('combobox', { name: 'Tags' }).click();
		await userEvent.keyboard('re');
		await expect.element(page.getByRole('option', { name: 'green' })).toBeVisible();
		await expect.element(page.getByRole('option', { name: 'red' })).not.toBeInTheDocument();
		await userEvent.keyboard('{ArrowDown}{Enter}');
		expect(props.tags).toEqual(['red', 'green']);
	});
});

describe('Combobox', () => {
	it('suggests matching items and picks with the keyboard', async () => {
		const props = $state({ fruit: '', picked: '' });
		render(InputsHarness, {
			get fruit() {
				return props.fruit;
			},
			set fruit(value) {
				props.fruit = value;
			},
			onPick: (item: string) => (props.picked = item)
		});
		const input = page.getByRole('combobox', { name: 'Fruit' });
		await input.click();
		await userEvent.keyboard('ap');
		await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('option', { name: 'Apricot' })).toBeVisible();
		expect(page.getByRole('option').elements()).toHaveLength(2);
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(input)
			.toHaveAttribute('aria-activedescendant', expect.stringContaining('Apricot'));
		await userEvent.keyboard('{Enter}');
		expect(props.picked).toBe('Apricot');
		expect(props.fruit).toBe('Apricot');
		await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		await userEvent.keyboard('{Control>}a{/Control}zz');
		await expect.element(page.getByText('No results')).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(input).toHaveAttribute('aria-expanded', 'false');
	});
});

describe('DateEntry and TimeEntry', () => {
	it('parses the locale date and shows errors after leaving the field', async () => {
		const props = $state({ date: null as Date | null, dateError: null as string | null });
		render(InputsHarness, {
			get date() {
				return props.date;
			},
			set date(value) {
				props.date = value;
			},
			onDateError: (error: string | null) => (props.dateError = error)
		});
		const field = page.getByRole('textbox', { name: 'Date' });
		await field.fill('2/3/2026');
		expect(props.date).toEqual(new Date(2026, 1, 3));
		await field.fill('2/30/2026');
		expect(props.dateError).toBe('Invalid format.');
		await expect.element(page.getByText('Invalid format.')).not.toBeInTheDocument();
		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByText('Invalid format.')).toBeVisible();
		await expect.element(field).toHaveAttribute('aria-invalid', 'true');
		expect(props.date).toEqual(new Date(2026, 1, 3));
		await field.fill('1/1/2040');
		expect(props.dateError).toBe('Out of range.');
	});

	it('follows the Portuguese date order', async () => {
		const props = $state({ locale: 'pt-BR', date: new Date(2026, 1, 3) as Date | null });
		render(InputsHarness, props);
		await expect.element(page.getByRole('textbox', { name: 'Date' })).toHaveValue('03/02/2026');
	});

	it('reads 12-hour and 24-hour times', async () => {
		const props = $state({ time: null as { hour: number; minute: number } | null });
		render(InputsHarness, props);
		const field = page.getByRole('textbox', { name: 'Time' });
		await field.fill('9:30 pm');
		expect(props.time).toEqual({ hour: 21, minute: 30 });
		await field.fill('7h05');
		expect(props.time).toEqual({ hour: 7, minute: 5 });
	});
});

describe('SegmentedEntry', () => {
	it('moves to the next segment when one fills or the delimiter is typed', async () => {
		const props = $state({ ip: [] as readonly string[] });
		render(InputsHarness, props);
		const parts = [1, 2, 3, 4].map((n) =>
			page.getByRole('textbox', { name: `Part ${n} of 4` })
		);
		await parts[0]!.click();
		await userEvent.keyboard('192.168.1.');
		expect(props.ip).toEqual(['192', '168', '1', '']);
		await expect.element(parts[3]!).toHaveFocus();
		await userEvent.keyboard('{Backspace}');
		await expect.element(parts[2]!).toHaveFocus();
	});
});

describe('NumberEntry', () => {
	it('steps with the keys, the buttons and the wheel, within the limits', async () => {
		const props = $state({ amount: 5 });
		render(InputsHarness, props);
		const field = page.getByRole('spinbutton', { name: 'Amount' });
		el(field).focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(props.amount).toBe(6);
		await userEvent.keyboard('{PageUp}');
		expect(props.amount).toBe(10);
		await expect.element(page.getByRole('button', { name: 'Increase' })).toBeDisabled();
		await userEvent.keyboard('{Home}');
		expect(props.amount).toBe(0);
		el(field).dispatchEvent(
			new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })
		);
		expect(props.amount).toBe(1);
		await page.getByRole('button', { name: 'Increase' }).click();
		expect(props.amount).toBe(2);
	});

	it('reads typed text on Enter and restores text that is not a number', async () => {
		const props = $state({ amount: 5 });
		render(InputsHarness, props);
		const field = page.getByRole('spinbutton', { name: 'Amount' });
		await field.fill('42');
		await userEvent.keyboard('{Enter}');
		expect(props.amount).toBe(10);
		await field.fill('abc');
		await userEvent.keyboard('{Tab}');
		await expect.element(field).toHaveValue('10');
	});

	it('scrubs by dragging sideways on the buttons', async () => {
		const props = $state({ amount: 5 });
		render(InputsHarness, props);
		const button = el(page.getByRole('button', { name: 'Decrease' }));
		const box = button.getBoundingClientRect();
		const at = (dx: number) => ({
			clientX: box.left + dx,
			clientY: box.top + 4,
			bubbles: true,
			pointerId: 1,
			button: 0
		});
		button.dispatchEvent(new PointerEvent('pointerdown', at(0)));
		button.dispatchEvent(new PointerEvent('pointermove', at(9)));
		button.dispatchEvent(new PointerEvent('pointerup', at(9)));
		expect(props.amount).toBe(7);
	});
});

describe('Rating and AngleSlider', () => {
	it('changes the rating by halves, with the digits and Home', async () => {
		const props = $state({ stars: 0 });
		render(InputsHarness, props);
		const rating = page.getByRole('slider', { name: 'Stars' });
		el(rating).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.stars).toBe(0.5);
		await expect.element(rating).toHaveAttribute('aria-valuetext', '0.5 of 5 stars');
		await userEvent.keyboard('4');
		expect(props.stars).toBe(4);
		await userEvent.keyboard('{Home}');
		expect(props.stars).toBe(0);
	});

	it('turns the dial in steps and wraps around', async () => {
		const props = $state({ angle: 0 });
		render(InputsHarness, props);
		const dial = page.getByRole('slider', { name: 'Angle' });
		el(dial).focus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(props.angle).toBe(345);
		await userEvent.keyboard('{PageUp}');
		expect(props.angle).toBe(0);
		await expect.element(dial).toHaveAttribute('aria-valuetext', '0°');
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('inputs gallery', () => {
	beforeEach(async () => {
		await page.viewport(840, 900);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(InputsGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await new Promise((resolve) => setTimeout(resolve, 300));
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(InputsGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await new Promise((resolve) => setTimeout(resolve, 300));
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`inputs-${scheme.name}`);
		});
	}
});
