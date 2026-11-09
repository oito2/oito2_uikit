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

import { accentColors, type AccentColor } from '@oito2/ui';
import { themePresetNames, type ThemePreset } from '@oito2/ui-themes';

const storageKey = 'oito2-showcase-settings';

/** The appearance the showcase is viewed with. */
interface Stored {
	mode: 'light' | 'dark' | 'system';
	accent: AccentColor | 'system';
	highContrast: boolean | 'system';
	scheme: 'base' | ThemePreset;
	desktop: SimulatedDesktop;
	compact: boolean;
	rtl: boolean;
	language: ShowcaseLanguage;
	density: ShowcaseDensity;
}

/** The language of the components: the system's, English or Brazilian Portuguese. */
export type ShowcaseLanguage = 'system' | 'en' | 'pt-BR';

/** The control sizes: the platform's (automatic), the pointer ones or the touch ones. */
export type ShowcaseDensity = 'auto' | 'pointer' | 'touch';

/** The desktops the browser build can imitate, or the real platform (\`system\`). */
export type SimulatedDesktop = 'system' | 'gnome' | 'kde' | 'xfce' | 'cosmic' | 'windows' | 'macos';

const modes = ['light', 'dark', 'system'] as const;
const desktops = ['system', 'gnome', 'kde', 'xfce', 'cosmic', 'windows', 'macos'] as const;
const languages = ['system', 'en', 'pt-BR'] as const;
const densities = ['auto', 'pointer', 'touch'] as const;

/** Whether `value` names an accent color. */
export function isAccentColor(value: unknown): value is AccentColor {
	return typeof value === 'string' && Object.hasOwn(accentColors, value);
}

/** Whether `value` names a theme preset. */
export function isThemePreset(value: unknown): value is ThemePreset {
	return (themePresetNames as readonly unknown[]).includes(value);
}

const defaults: Stored = {
	mode: 'system',
	accent: 'system',
	highContrast: 'system',
	scheme: 'base',
	desktop: 'system',
	compact: false,
	rtl: false,
	language: 'system',
	density: 'auto'
};

// Returns `value` when it is one of `allowed`, and `fallback` otherwise.
function pick<T>(value: unknown, allowed: readonly T[], fallback: T): T {
	return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
}

// Reads the stored settings field by field, so a value that is no longer valid falls back to
// its default; private windows and blocked storage fall back to all the defaults.
function load(): Stored {
	try {
		const raw = globalThis.localStorage?.getItem(storageKey);
		if (!raw) return defaults;
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null) return defaults;
		const stored = parsed as Record<keyof Stored, unknown>;
		return {
			mode: pick(stored.mode, modes, defaults.mode),
			accent:
				stored.accent === 'system' || isAccentColor(stored.accent)
					? stored.accent
					: defaults.accent,
			highContrast:
				typeof stored.highContrast === 'boolean' || stored.highContrast === 'system'
					? stored.highContrast
					: defaults.highContrast,
			scheme:
				stored.scheme === 'base' || isThemePreset(stored.scheme)
					? stored.scheme
					: defaults.scheme,
			desktop: pick(stored.desktop, desktops, defaults.desktop),
			compact: stored.compact === true,
			rtl: stored.rtl === true,
			language: pick(stored.language, languages, defaults.language),
			density: pick(stored.density, densities, defaults.density)
		};
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
	compact = $state(defaults.compact);
	rtl = $state(defaults.rtl);
	language = $state(defaults.language);
	density = $state(defaults.density);

	constructor() {
		const stored = load();
		this.mode = stored.mode;
		this.accent = stored.accent;
		this.highContrast = stored.highContrast;
		this.scheme = stored.scheme;
		this.desktop = stored.desktop;
		this.compact = stored.compact;
		this.rtl = stored.rtl;
		this.language = stored.language;
		this.density = stored.density;
	}

	/** The locale the components use: the chosen one, or the browser's for `system`. */
	get locale(): string {
		if (this.language !== 'system') return this.language;
		return globalThis.navigator?.language ?? 'en';
	}

	/** Writes the settings to local storage, ignoring storage errors. */
	save(): void {
		try {
			const value: Stored = {
				mode: this.mode,
				accent: this.accent,
				highContrast: this.highContrast,
				scheme: this.scheme,
				desktop: this.desktop,
				compact: this.compact,
				rtl: this.rtl,
				language: this.language,
				density: this.density
			};
			globalThis.localStorage?.setItem(storageKey, JSON.stringify(value));
		} catch {
			// The settings just aren't remembered.
		}
	}
}
