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

import { Platform, fallbackSystemSettings, type SystemSettings } from '@oito2/ui';
import { isTauri } from '@tauri-apps/api/core';
import { composeSystemSettings } from './compose.js';
import { tauriSettingsSource, type SettingsSource } from './source.js';

/**
 * Reads the system settings once: from `tauri-plugin-oito2-settings` inside Tauri, or the
 * defaults of the platform in a browser or when reading fails.
 */
export async function loadSystemSettings(
	options: { platform?: Platform; source?: SettingsSource } = {}
): Promise<SystemSettings> {
	const platform = options.platform ?? Platform.current();
	const source = options.source ?? (isTauri() ? tauriSettingsSource : null);
	if (!source) return fallbackSystemSettings(platform);
	try {
		return composeSystemSettings(await source.read(), platform);
	} catch {
		return fallbackSystemSettings(platform);
	}
}
