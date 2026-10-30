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
import FieldHarness from '../../tests/FieldHarness.svelte';

describe('Field', () => {
	it('labels the control and describes it with the helper or the error', async () => {
		const props = $state({ invalid: false, value: '' });
		render(FieldHarness, props);
		const input = page.getByRole('textbox', { name: 'Email' });
		await expect.element(input).toBeRequired();
		await expect.element(input).toHaveAccessibleDescription('Your work address.');
		await expect.element(page.getByText('Enter an address.')).not.toBeInTheDocument();
		props.invalid = true;
		await expect.element(input).toHaveAttribute('aria-invalid', 'true');
		await expect.element(input).toHaveAccessibleDescription('Enter an address.');
		await input.fill('ana@example.com');
		expect(props.value).toBe('ana@example.com');
	});

	it('gives custom controls the field attributes', async () => {
		render(FieldHarness, {});
		await expect.element(page.getByRole('textbox', { name: 'Custom' })).toBeInTheDocument();
	});

	it('grows a text area with its text up to its maximum', async () => {
		render(FieldHarness, {});
		const area = page.getByRole('textbox', { name: 'Notes' });
		const start = (area.element() as HTMLElement).offsetHeight;
		await area.click();
		await userEvent.keyboard('one{Enter}two{Enter}three');
		await expect
			.poll(() => (area.element() as HTMLElement).offsetHeight)
			.toBeGreaterThan(start);
		await userEvent.keyboard('{Enter}4{Enter}5{Enter}6{Enter}7{Enter}8');
		const tall = (area.element() as HTMLElement).offsetHeight;
		await userEvent.keyboard('{Enter}9{Enter}10');
		expect((area.element() as HTMLElement).offsetHeight).toBe(tall);
	});
});
