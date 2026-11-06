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
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FormsL10nHarness from '../../tests/FormsL10nHarness.svelte';

/** Returns the entries of the test form, as `name=value` strings. */
const submitted = () =>
	[...new FormData(page.getByTestId('form').element() as HTMLFormElement)].map(
		([name, value]) => `${name}=${String(value)}`
	);

describe('LocaleProvider strings', () => {
	it('replace the labels of the standard buttons and entries', async () => {
		render(FormsL10nHarness, { show: 'strings' });
		await expect.element(page.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('textbox', { name: 'Due' }))
			.toHaveAttribute('placeholder', 'tt.mm.jjjj');
	});
});

describe('Form controls', () => {
	it('submit their values with the form they name', async () => {
		render(FormsL10nHarness, { show: 'form' });
		await expect.element(page.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
		expect(submitted()).toEqual(['news=on', 'sync=on', 'volume=40']);
	});

	it('submit nothing while disabled', async () => {
		render(FormsL10nHarness, { show: 'form', disabled: true });
		await expect.element(page.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
		expect(submitted()).toEqual([]);
	});
});
