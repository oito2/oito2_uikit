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
import Providers from '../../tests/Providers.svelte';
import ReadContext from '../../tests/ReadContext.svelte';
import { en } from '../l10n/en.js';
import { Platform } from './platform.js';
import { fallbackSystemSettings } from './system-settings.js';

const kde = fallbackSystemSettings(new Platform({ os: 'linux', isWeb: false }), {
	desktopEnvironment: 'kde'
});

describe('context providers', () => {
	it('fall back to the running platform and English', async () => {
		render(ReadContext);
		await expect.element(page.getByTestId('style')).toHaveTextContent('none');
		await expect.element(page.getByTestId('locale')).toHaveTextContent('en');
		await expect.element(page.getByTestId('close')).toHaveTextContent('Close');
		await expect.element(page.getByTestId('bytes')).toHaveTextContent('1.5 kB');
	});

	it('provide the settings, locale, strings and formatter', async () => {
		render(Providers, { settings: kde, locale: 'pt-BR' });
		await expect.element(page.getByTestId('style')).toHaveTextContent('breeze');
		await expect.element(page.getByTestId('locale')).toHaveTextContent('pt-BR');
		await expect.element(page.getByTestId('close')).toHaveTextContent('Fechar');
		await expect.element(page.getByTestId('bytes')).toHaveTextContent('1,5 kB');
	});

	it('follow prop changes', async () => {
		const props = $state({ settings: kde, locale: 'pt-BR' });
		render(Providers, props);
		await expect.element(page.getByTestId('close')).toHaveTextContent('Fechar');
		props.settings = { ...kde, accentColor: '#E62D42' };
		props.locale = 'en';
		await expect.element(page.getByTestId('accent')).toHaveTextContent('#E62D42');
		await expect.element(page.getByTestId('close')).toHaveTextContent('Close');
		await expect.element(page.getByTestId('bytes')).toHaveTextContent('1.5 kB');
	});

	it('let custom strings replace the built-in ones', async () => {
		render(Providers, { settings: kde, locale: 'en', strings: { ...en, closeWindow: 'Shut' } });
		await expect.element(page.getByTestId('close')).toHaveTextContent('Shut');
	});
});
