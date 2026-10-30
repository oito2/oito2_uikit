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
import parity from '../../fixtures/parity/foundation.json';
import type { DesktopEnvironment } from './desktop-environment.js';
import { Platform, type OperatingSystem } from './platform.js';
import { fallbackSystemSettings } from './system-settings.js';

describe('fallbackSystemSettings matches oito2_ui', () => {
	it('derives the same settings', () => {
		for (const { os, isWeb, desktopEnvironment, result } of parity.systemSettings) {
			const settings = fallbackSystemSettings(
				new Platform({ os: os as OperatingSystem, isWeb }),
				{
					desktopEnvironment: desktopEnvironment as DesktopEnvironment | null
				}
			);
			expect(
				{
					desktopEnvironment: settings.desktopEnvironment,
					windowControlStyle: settings.windowControlStyle,
					windowButtonLayout: {
						leading: [...settings.windowButtonLayout.leading],
						trailing: [...settings.windowButtonLayout.trailing]
					},
					accentColor: settings.accentColor,
					highContrast: settings.highContrast
				},
				`${os} web=${isWeb} ${desktopEnvironment}`
			).toEqual(result);
		}
	});
});
