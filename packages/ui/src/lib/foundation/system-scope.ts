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

import { getContext, hasContext, setContext } from 'svelte';
import { Platform } from './platform.js';
import { fallbackSystemSettings, type SystemSettings } from './system-settings.js';

const key = Symbol('oito2.system-settings');

/** A live view of the system settings: `current` always reads the latest value. */
export interface SystemSettingsRef {
	readonly current: SystemSettings;
}

/**
 * Provides system settings to the components below the calling one. `get` is called on
 * every read, so passing a getter over a prop or `$state` keeps the settings reactive.
 * Must be called during component initialization.
 */
export function setSystemSettings(get: () => SystemSettings): void {
	setContext<SystemSettingsRef>(key, {
		get current() {
			return get();
		}
	});
}

/**
 * Returns the system settings provided by the closest `SystemScope` (or
 * `setSystemSettings`), or settings derived from `Platform.current()` when there is none.
 * Must be called during component initialization.
 */
export function useSystemSettings(): SystemSettingsRef {
	if (hasContext(key)) return getContext<SystemSettingsRef>(key);
	const fallback = fallbackSystemSettings(Platform.current());
	return { current: fallback };
}
