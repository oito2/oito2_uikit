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

/** A GSettings value: a string or a boolean. */
export type SettingValue = string | boolean;

/** The values `tauri-plugin-oito2-settings` extracts from the desktop configuration files. */
export interface ConfigValues {
	/** `ButtonsOnLeft` of KWin's decoration settings. */
	readonly kwinButtonsOnLeft: string | null;
	/** `ButtonsOnRight` of KWin's decoration settings. */
	readonly kwinButtonsOnRight: string | null;
	/** KDE's accent color, as `#RRGGBB`. */
	readonly kdeAccentColor: string | null;
	/** KDE's color scheme name. */
	readonly kdeColorScheme: string | null;
	/** The Xfwm4 button layout, such as `O|SHMC`. */
	readonly xfwmButtonLayout: string | null;
	/** COSMIC's `show_minimize` flag. */
	readonly cosmicShowMinimize: boolean | null;
	/** COSMIC's `show_maximize` flag. */
	readonly cosmicShowMaximize: boolean | null;
}

/**
 * What `tauri-plugin-oito2-settings` reads from the platform: the session variables, the
 * GSettings keys (by `schema/key`), the configuration values and the toolkit's accent and
 * contrast. `composeSystemSettings` turns it into a `SystemSettings`.
 */
export interface RawSettings {
	readonly xdgCurrentDesktop: string | null;
	readonly desktopSession: string | null;
	readonly gsettings: Readonly<Record<string, SettingValue>>;
	readonly config: ConfigValues;
	/** The accent of the toolkit or system, as `#RRGGBB`. */
	readonly systemAccent: string | null;
	/** Whether the system asks for high contrast. */
	readonly systemHighContrast: boolean;
}

/** Settings with nothing read: no session, no keys, no files. */
export const emptyRawSettings: RawSettings = Object.freeze({
	xdgCurrentDesktop: null,
	desktopSession: null,
	gsettings: Object.freeze({}),
	config: Object.freeze({
		kwinButtonsOnLeft: null,
		kwinButtonsOnRight: null,
		kdeAccentColor: null,
		kdeColorScheme: null,
		xfwmButtonLayout: null,
		cosmicShowMinimize: null,
		cosmicShowMaximize: null
	}),
	systemAccent: null,
	systemHighContrast: false
});
