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

import {
	WindowButtonLayout,
	accentColors,
	detectDesktopEnvironment,
	fallbackSystemSettings,
	type AccentColor,
	type DesktopEnvironment,
	type Platform,
	type SystemSettings,
	type WindowButton
} from '@oito2/ui';
import type { RawSettings } from './raw-settings.js';

const gnomeWm = 'org.gnome.desktop.wm.preferences';
const cinnamonWm = 'org.cinnamon.desktop.wm.preferences';
const mateWm = 'org.mate.Marco.general';
const gnomeInterface = 'org.gnome.desktop.interface';
const gnomeA11y = 'org.gnome.desktop.a11y.interface';

/** Returns the window button layout of `environment`, or `null` to use the default. */
function buttonLayout(
	raw: RawSettings,
	environment: DesktopEnvironment
): WindowButtonLayout | null {
	const gnomeLayout = (schema: string) => {
		const value = raw.gsettings[`${schema}/button-layout`];
		return typeof value === 'string' ? WindowButtonLayout.parseGnome(value) : null;
	};
	switch (environment) {
		case 'kde':
			// Missing keys use KWin's default buttons.
			return WindowButtonLayout.parseKde({
				buttonsOnLeft: raw.config.kwinButtonsOnLeft ?? 'MS',
				buttonsOnRight: raw.config.kwinButtonsOnRight ?? 'HIAX'
			});
		case 'xfce':
			// A missing property uses xfwm4's default layout.
			return WindowButtonLayout.parseXfwm(raw.config.xfwmButtonLayout ?? 'O|SHMC');
		case 'cosmic': {
			// A missing flag shows the button.
			const trailing: WindowButton[] = [];
			if (raw.config.cosmicShowMinimize ?? true) trailing.push('minimize');
			if (raw.config.cosmicShowMaximize ?? true) trailing.push('maximize');
			trailing.push('close');
			return new WindowButtonLayout({ trailing });
		}
		case 'cinnamon':
			return gnomeLayout(cinnamonWm);
		case 'mate':
			return gnomeLayout(mateWm);
		default:
			return gnomeLayout(gnomeWm);
	}
}

/** Returns the Linux accent: KDE's, or GNOME's named accent, else the toolkit's. */
function linuxAccent(raw: RawSettings, environment: DesktopEnvironment): string | null {
	if (environment === 'kde') {
		if (raw.config.kdeAccentColor) return raw.config.kdeAccentColor;
	} else {
		const name = raw.gsettings[`${gnomeInterface}/accent-color`];
		if (typeof name === 'string' && name in accentColors)
			return accentColors[name as AccentColor];
	}
	return raw.systemAccent;
}

/** Whether the Linux desktop asks for high contrast. */
function linuxHighContrast(raw: RawSettings, environment: DesktopEnvironment): boolean {
	if (environment === 'kde') {
		return (raw.config.kdeColorScheme ?? '').toLowerCase().includes('contrast');
	}
	if (raw.gsettings[`${gnomeA11y}/high-contrast`] === true) return true;
	const theme = raw.gsettings[`${gnomeInterface}/gtk-theme`];
	return typeof theme === 'string' && theme.toLowerCase().includes('highcontrast');
}

/**
 * Turns the values read from the platform into the `SystemSettings` of `platform`, with
 * the rules of `oito2_ui_settings`: the desktop environment from the session variables,
 * the button layout of each desktop's own settings (or its default), the accent and the
 * high-contrast preference. Outside native Linux only the accent and contrast count.
 */
export function composeSystemSettings(raw: RawSettings, platform: Platform): SystemSettings {
	const linux = platform.isLinux && platform.isDesktopNative;
	const environment = linux
		? detectDesktopEnvironment({
				xdgCurrentDesktop: raw.xdgCurrentDesktop ?? undefined,
				desktopSession: raw.desktopSession ?? undefined
			})
		: null;
	const fallback = fallbackSystemSettings(platform, { desktopEnvironment: environment });
	const layout = environment ? buttonLayout(raw, environment) : null;
	return {
		platform,
		desktopEnvironment: environment,
		windowControlStyle: fallback.windowControlStyle,
		windowButtonLayout: layout ?? fallback.windowButtonLayout,
		accentColor: environment ? linuxAccent(raw, environment) : raw.systemAccent,
		highContrast:
			raw.systemHighContrast || (environment !== null && linuxHighContrast(raw, environment))
	};
}

/** Whether two settings are the same, field by field. */
export function sameSystemSettings(a: SystemSettings, b: SystemSettings): boolean {
	return (
		a.platform.os === b.platform.os &&
		a.platform.isWeb === b.platform.isWeb &&
		a.desktopEnvironment === b.desktopEnvironment &&
		a.windowControlStyle === b.windowControlStyle &&
		a.windowButtonLayout.equals(b.windowButtonLayout) &&
		a.accentColor === b.accentColor &&
		a.highContrast === b.highContrast
	);
}
