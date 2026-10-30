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
import ThemeHarness from '../../tests/ThemeHarness.svelte';
import { Platform } from '../foundation/platform.js';
import { fallbackSystemSettings } from '../foundation/system-settings.js';
import { colorThemeFromRoles, createColorTheme } from './color-theme.js';

// Returns the value of a custom property on the provider element.
function variable(name: string): string {
	const element = document.querySelector<HTMLElement>('[data-testid="provider"]');
	return element ? getComputedStyle(element).getPropertyValue(name).trim() : '';
}

describe('ThemeProvider', () => {
	it('applies the base scheme as custom properties and provides it', async () => {
		render(ThemeHarness, { mode: 'dark', accent: 'red', highContrast: false });
		const expected = createColorTheme({ brightness: 'dark', accent: 'red' });
		await expect
			.element(page.getByTestId('theme-primary'))
			.toHaveTextContent(expected.colorScheme.primary);
		await expect.element(page.getByTestId('theme-brightness')).toHaveTextContent('dark');
		expect(variable('--oito2-color-primary')).toBe(expected.colorScheme.primary.toLowerCase());
		expect(variable('--oito2-chrome-mainbar')).toBe(expected.chrome.mainbar.toLowerCase());
		expect(variable('--oito2-syntax-keyword')).toBe(expected.syntax.keyword.toLowerCase());
		const provider = page.getByTestId('provider').element();
		expect(getComputedStyle(provider).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(provider.dataset.oito2Brightness).toBe('dark');
	});

	it('follows mode and contrast changes', async () => {
		const props = $state({ mode: 'light' as 'light' | 'dark', highContrast: false });
		render(ThemeHarness, props);
		await expect.element(page.getByTestId('theme-brightness')).toHaveTextContent('light');
		props.mode = 'dark';
		props.highContrast = true;
		await expect.element(page.getByTestId('theme-brightness')).toHaveTextContent('dark');
		await expect.element(page.getByTestId('theme-contrast')).toHaveTextContent('high');
	});

	it('takes the accent and high contrast from the system settings', async () => {
		const settings = {
			...fallbackSystemSettings(new Platform({ os: 'linux', isWeb: false })),
			accentColor: '#E62D42',
			highContrast: true
		};
		render(ThemeHarness, { mode: 'light', settings });
		const expected = createColorTheme({
			brightness: 'light',
			accent: '#E62D42',
			highContrast: true
		});
		await expect
			.element(page.getByTestId('theme-primary'))
			.toHaveTextContent(expected.colorScheme.primary);
		await expect.element(page.getByTestId('theme-contrast')).toHaveTextContent('high');
	});

	it('uses a theme source for the light or dark mode', async () => {
		const roles = {
			brightness: 'light' as const,
			background: '#FAF4ED',
			card: '#FFFAF3',
			foreground: '#575279',
			primary: '#286983',
			secondary: '#F2E9E1',
			mutedForeground: '#9893A5',
			destructive: '#B4637A',
			border: '#F2E9E1',
			success: '#56949F',
			warning: '#EA9D34',
			info: '#907AA9',
			syntax: {
				foreground: '#575279',
				comment: '#9893A5',
				keyword: '#286983',
				string: '#EA9D34',
				number: '#EA9D34',
				function: '#D7827E',
				type: '#56949F',
				tag: '#56949F',
				attribute: '#907AA9',
				constant: '#EA9D34',
				invalid: '#B4637A'
			}
		};
		render(ThemeHarness, {
			mode: 'light',
			highContrast: false,
			light: ({ highContrast }) => colorThemeFromRoles(roles, { highContrast })
		});
		const expected = colorThemeFromRoles(roles);
		await expect
			.element(page.getByTestId('theme-primary'))
			.toHaveTextContent(expected.colorScheme.primary);
	});
});
