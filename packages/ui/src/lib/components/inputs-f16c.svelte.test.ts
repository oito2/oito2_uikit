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
import InputsF16cHarness from '../../tests/InputsF16cHarness.svelte';

/** Dispatches a paste of `text` on `target`, as the clipboard would. */
function paste(target: HTMLElement, text: string): ClipboardEvent {
	const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
	Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
	target.dispatchEvent(event);
	return event;
}

describe('Slider', () => {
	it('steps without floating-point noise', async () => {
		const props = $state({ show: 'slider' as const, value: 0, log: [] as string[] });
		render(InputsF16cHarness, props);
		const thumb = page.getByRole('slider', { name: 'Level' });
		el(thumb).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
		expect(props.value).toBe(0.3);
		await expect.element(thumb).toHaveAttribute('aria-valuenow', '0.3');
	});

	it('commits on key up only after a change, and never while disabled', async () => {
		const props = $state({
			show: 'slider' as const,
			value: 0,
			disabled: false,
			log: [] as string[]
		});
		render(InputsF16cHarness, props);
		const thumb = page.getByRole('slider', { name: 'Level' });
		el(thumb).focus();
		await userEvent.keyboard('{Home}');
		expect(props.log).toEqual([]);
		await userEvent.keyboard('{ArrowRight}');
		expect(props.log).toEqual(['commit 0.1']);
		props.disabled = true;
		await expect.element(thumb).toHaveAttribute('aria-disabled', 'true');
		el(thumb).dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
		expect(props.log).toEqual(['commit 0.1']);
	});
});

describe('NumberEntry', () => {
	it('lets Enter submit the form it is in', async () => {
		const props = $state({ show: 'number' as const, log: [] as string[] });
		render(InputsF16cHarness, props);
		await page.getByRole('spinbutton', { name: 'Amount' }).click();
		await userEvent.keyboard('{Enter}');
		expect(props.log).toEqual(['submit']);
	});
});

describe('DateEntry', () => {
	it('shows the date in the format of a new locale', async () => {
		const props = $state({ show: 'date' as const, locale: 'en' });
		render(InputsF16cHarness, props);
		const input = page.getByRole('textbox', { name: 'Due' });
		await expect.element(input).toHaveValue('2/3/2026');
		props.locale = 'pt-BR';
		await expect.element(input).toHaveValue('03/02/2026');
	});
});

describe('Calendar', () => {
	it('moves focus to the focused day when a month button is disabled at a limit', async () => {
		render(InputsF16cHarness, { show: 'calendar' });
		const previous = page.getByRole('button', { name: 'Previous month' });
		el(previous).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(previous).toBeDisabled();
		await expect
			.element(page.getByRole('button', { name: 'Tuesday, February 10, 2026' }))
			.toHaveFocus();
	});
});

describe('SegmentedEntry', () => {
	it('spreads a pasted value over the segments', async () => {
		const props = $state({ show: 'segmented' as const, segments: [] as readonly string[] });
		render(InputsF16cHarness, props);
		const first = page.getByRole('textbox', { name: 'Part 1 of 4' });
		el(first).focus();
		expect(paste(el(first), '192.168.0.1').defaultPrevented).toBe(true);
		expect(props.segments).toEqual(['192', '168', '0', '1']);
		await expect.element(page.getByRole('textbox', { name: 'Part 4 of 4' })).toHaveFocus();
		el(first).focus();
		paste(el(first), '010203');
		expect(props.segments).toEqual(['010', '203', '0', '1']);
	});
});

describe('TagsField', () => {
	it('disables the input and takes the tags out of focus while disabled', async () => {
		render(InputsF16cHarness, { show: 'tags', disabled: true });
		await expect.element(page.getByRole('textbox', { name: 'Tags' })).toBeDisabled();
		const tag = page.getByRole('button', { name: 'red', exact: true });
		await expect.element(tag).not.toHaveAttribute('tabindex');
		await expect.element(tag).toHaveAttribute('aria-disabled', 'true');
	});
});

describe('EditableLabel', () => {
	it('starts editing on Space', async () => {
		render(InputsF16cHarness, { show: 'label' });
		el(page.getByRole('button', { name: 'Name' })).focus();
		await userEvent.keyboard(' ');
		await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Name');
	});
});

describe('PinEntry', () => {
	it('keeps the caret at the end when the arrows or Home are pressed', async () => {
		const props = $state({ show: 'pin' as const, pin: '12' });
		render(InputsF16cHarness, props);
		const input = page.getByRole('textbox', { name: 'Code of 4 characters' });
		el(input).focus();
		await userEvent.keyboard('{ArrowLeft}{Home}3');
		expect(props.pin).toBe('123');
	});
});

describe('ChoiceChipBar', () => {
	it('shows the forward arrow once added chips overflow', async () => {
		const props = $state({ show: 'chips' as const, chips: 1 });
		render(InputsF16cHarness, props);
		await expect.element(page.getByText('Chip 0')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Scroll forward' }))
			.not.toBeInTheDocument();
		props.chips = 20;
		await expect
			.element(page.getByRole('button', { name: 'Scroll forward' }))
			.toBeInTheDocument();
	});
});
