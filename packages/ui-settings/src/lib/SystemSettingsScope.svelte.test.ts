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

import { Platform, type SystemSettings } from '@oito2/ui';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { FakeSettingsSource } from '../tests/fake-source.js';
import ScopeHarness from '../tests/ScopeHarness.svelte';
import { emptyRawSettings, type RawSettings } from './raw-settings.js';

const linux = new Platform({ os: 'linux', isWeb: false });
const gnomeLayout = 'org.gnome.desktop.wm.preferences/button-layout';

/** Raw settings of a GNOME session with `layout` and `accent`. */
function gnome(layout: string, accent: string | null = null): RawSettings {
	return {
		...emptyRawSettings,
		xdgCurrentDesktop: 'GNOME',
		gsettings: { [gnomeLayout]: layout },
		systemAccent: accent
	};
}

describe('SystemSettingsScope', () => {
	it('starts from the defaults, then provides the settings read', async () => {
		const source = new FakeSettingsSource(gnome('close:'));
		let release: () => void = () => {};
		source.gate = new Promise((resolve) => (release = resolve));
		render(ScopeHarness, { source, platform: linux });
		await expect.element(page.getByTestId('desktop')).toHaveTextContent('unknown');
		release();
		await expect.element(page.getByTestId('desktop')).toHaveTextContent('gnome');
		await expect.element(page.getByTestId('layout')).toHaveTextContent('close|');
	});

	it('follows change events and reports only real changes', async () => {
		const source = new FakeSettingsSource(gnome('close:'));
		const changes: SystemSettings[] = [];
		render(ScopeHarness, { source, platform: linux, onSettingsChange: (s) => changes.push(s) });
		await expect.element(page.getByTestId('layout')).toHaveTextContent('close|');
		await expect.poll(() => source.listening).toBe(1);
		source.emit(gnome('close:'));
		source.emit(gnome(':minimize,close', '#123456'));
		await expect.element(page.getByTestId('layout')).toHaveTextContent('|minimize,close');
		await expect.element(page.getByTestId('accent')).toHaveTextContent('#123456');
		expect(changes).toHaveLength(2);
	});

	it('reads again when the window regains focus', async () => {
		const source = new FakeSettingsSource(gnome('close:'));
		render(ScopeHarness, { source, platform: linux });
		await expect.element(page.getByTestId('layout')).toHaveTextContent('close|');
		source.current = gnome(':close');
		window.dispatchEvent(new Event('focus'));
		await expect.element(page.getByTestId('layout')).toHaveTextContent('|close');
	});

	it('drops a read that a newer event overtakes', async () => {
		const source = new FakeSettingsSource(gnome('close:', '#111111'));
		let release: () => void = () => {};
		source.gate = new Promise((resolve) => (release = resolve));
		render(ScopeHarness, { source, platform: linux });
		await expect.poll(() => source.listening).toBe(1);
		source.emit(gnome('close:', '#222222'));
		await expect.element(page.getByTestId('accent')).toHaveTextContent('#222222');
		release();
		await new Promise((resolve) => setTimeout(resolve, 30));
		await expect.element(page.getByTestId('accent')).toHaveTextContent('#222222');
	});

	it('keeps the current settings when the values are malformed', async () => {
		const source = new FakeSettingsSource(null as unknown as RawSettings);
		render(ScopeHarness, { source, platform: linux });
		await expect.poll(() => source.reads).toBe(1);
		await expect.poll(() => source.listening).toBe(1);
		source.emit({ ...emptyRawSettings, config: null } as unknown as RawSettings);
		await new Promise((resolve) => setTimeout(resolve, 30));
		await expect.element(page.getByTestId('desktop')).toHaveTextContent('unknown');
	});

	it('keeps the defaults without a source', async () => {
		render(ScopeHarness, { source: null, platform: linux });
		await expect.element(page.getByTestId('desktop')).toHaveTextContent('unknown');
	});

	it('stops listening when it unmounts', async () => {
		const source = new FakeSettingsSource(gnome('close:'));
		const screen = await render(ScopeHarness, { source, platform: linux });
		await expect.poll(() => source.listening).toBe(1);
		screen.unmount();
		await expect.poll(() => source.listening).toBe(0);
	});
});
