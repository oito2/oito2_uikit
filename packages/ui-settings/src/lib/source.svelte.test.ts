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

import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyRawSettings, type RawSettings } from './raw-settings.js';
import { settingsChangedEvent, tauriSettingsSource } from './source.js';

const gnome: RawSettings = { ...emptyRawSettings, xdgCurrentDesktop: 'GNOME' };

/** Mocks the plugin's `read_settings` command answering `payload`, with mocked events. */
function mockPlugin(payload: unknown) {
	mockWindows('main');
	mockIPC((cmd) => (cmd === 'plugin:oito2-settings|read_settings' ? payload : null), {
		shouldMockEvents: true
	});
}

afterEach(() => clearMocks());

describe('tauriSettingsSource', () => {
	it('reads the settings the plugin answers', async () => {
		mockPlugin(gnome);
		await expect(tauriSettingsSource.read()).resolves.toEqual(gnome);
	});

	it('rejects an answer that is not raw settings', async () => {
		mockPlugin({ gsettings: {} });
		await expect(tauriSettingsSource.read()).rejects.toThrow(
			new TypeError('oito2: unexpected settings payload')
		);
	});

	it('passes valid change events to the listener and drops the others', async () => {
		mockPlugin(gnome);
		const received: RawSettings[] = [];
		const stop = await tauriSettingsSource.subscribe((raw) => received.push(raw));
		await emit(settingsChangedEvent, { ...gnome, config: null });
		await emit(settingsChangedEvent, gnome);
		await expect.poll(() => received).toEqual([gnome]);
		stop();
	});
});
