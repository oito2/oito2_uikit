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
import { emptyRawSettings, isRawSettings } from './raw-settings.js';

describe('isRawSettings', () => {
	it('accepts the empty settings and a full payload', () => {
		expect(isRawSettings(emptyRawSettings)).toBe(true);
		expect(
			isRawSettings({
				xdgCurrentDesktop: 'KDE',
				desktopSession: 'plasma',
				gsettings: { 'org.gnome.desktop.interface/accent-color': 'blue' },
				config: { ...emptyRawSettings.config, kdeAccentColor: '#3DAEE9' },
				systemAccent: '#3DAEE9',
				systemHighContrast: true
			})
		).toBe(true);
	});

	it('rejects values without the shape', () => {
		expect(isRawSettings(null)).toBe(false);
		expect(isRawSettings('settings')).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, gsettings: undefined })).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, config: null })).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, systemHighContrast: 'false' })).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, xdgCurrentDesktop: 1 })).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, desktopSession: undefined })).toBe(false);
		expect(isRawSettings({ ...emptyRawSettings, systemAccent: false })).toBe(false);
	});
});
