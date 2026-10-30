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

import type { RawSettings } from './raw-settings.js';

/** Where a settings scope reads the platform settings from. */
export interface SettingsSource {
	/** Reads the current values. */
	read(): Promise<RawSettings>;
	/**
	 * Calls `listener` with new values whenever the platform reports a change; returns a
	 * function that stops listening.
	 */
	subscribe(listener: (raw: RawSettings) => void): Promise<() => void>;
}

/** The event `tauri-plugin-oito2-settings` emits with the new values. */
export const settingsChangedEvent = 'oito2-settings://changed';

/** Reads the settings through `tauri-plugin-oito2-settings`. */
export const tauriSettingsSource: SettingsSource = {
	async read() {
		const { invoke } = await import('@tauri-apps/api/core');
		return invoke<RawSettings>('plugin:oito2-settings|read_settings');
	},
	async subscribe(listener) {
		const { listen } = await import('@tauri-apps/api/event');
		return listen<RawSettings>(settingsChangedEvent, (event) => listener(event.payload));
	}
};
