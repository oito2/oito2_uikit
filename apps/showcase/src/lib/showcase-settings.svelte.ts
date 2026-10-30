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

import type { AccentColor } from '@oito2/ui';
import type { ThemePreset } from '@oito2/ui-themes';

const storageKey = 'oito2-showcase-settings';

/** The appearance the showcase is viewed with. */
interface Stored {
	mode: 'light' | 'dark' | 'system';
	accent: AccentColor;
	highContrast: boolean | 'system';
	scheme: 'base' | ThemePreset;
	desktop: SimulatedDesktop;
}

/** The desktops the browser build can imitate, or the real platform (\`system\`). */
export type SimulatedDesktop = 'system' | 'gnome' | 'kde' | 'xfce' | 'cosmic' | 'windows' | 'macos';

const defaults: Stored = {
	mode: 'system',
	accent: 'blue',
	highContrast: 'system',
	scheme: 'base',
	desktop: 'system'
};

// Reads the stored settings; private windows and blocked storage fall back to the defaults.
function load(): Stored {
	try {
		const raw = globalThis.localStorage?.getItem(storageKey);
		return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Stored>) } : defaults;
	} catch {
		return defaults;
	}
}

/** The showcase appearance settings, remembered in local storage when it is available. */
export class ShowcaseSettings {
	mode = $state(defaults.mode);
	accent = $state(defaults.accent);
	highContrast = $state(defaults.highContrast);
	scheme = $state(defaults.scheme);
	desktop = $state(defaults.desktop);

	constructor() {
		const stored = load();
		this.mode = stored.mode;
		this.accent = stored.accent;
		this.highContrast = stored.highContrast;
		this.scheme = stored.scheme;
		this.desktop = stored.desktop;
	}

	/** Writes the settings to local storage, ignoring storage errors. */
	save(): void {
		try {
			const value: Stored = {
				mode: this.mode,
				accent: this.accent,
				highContrast: this.highContrast,
				scheme: this.scheme,
				desktop: this.desktop
			};
			globalThis.localStorage?.setItem(storageKey, JSON.stringify(value));
		} catch {
			// The settings just aren't remembered.
		}
	}
}
