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

import { Platform, WindowButtonLayout, accentColors } from '@oito2/ui';
import { describe, expect, it } from 'vitest';
import { composeSystemSettings, sameSystemSettings } from './compose.js';
import { emptyRawSettings, type ConfigValues, type RawSettings } from './raw-settings.js';
import { loadSystemSettings } from './load.js';

const linux = new Platform({ os: 'linux', isWeb: false });
const windows = new Platform({ os: 'windows', isWeb: false });
const gnomeWm = 'org.gnome.desktop.wm.preferences';
const gnomeInterface = 'org.gnome.desktop.interface';
const a11y = 'org.gnome.desktop.a11y.interface';

/** Builds raw settings for a session on `desktop` with the given keys and files. */
function raw(
	desktop: string,
	options: {
		gsettings?: RawSettings['gsettings'];
		config?: Partial<ConfigValues>;
		systemAccent?: string;
		systemHighContrast?: boolean;
	} = {}
): RawSettings {
	return {
		...emptyRawSettings,
		xdgCurrentDesktop: desktop,
		gsettings: options.gsettings ?? {},
		config: { ...emptyRawSettings.config, ...options.config },
		systemAccent: options.systemAccent ?? null,
		systemHighContrast: options.systemHighContrast ?? false
	};
}

describe('GNOME family', () => {
	it('reads the button layout from GSettings', () => {
		const settings = composeSystemSettings(
			raw('GNOME', { gsettings: { [`${gnomeWm}/button-layout`]: 'close:' } }),
			linux
		);
		expect(settings.desktopEnvironment).toBe('gnome');
		expect(settings.windowControlStyle).toBe('gnome');
		expect(
			settings.windowButtonLayout.equals(new WindowButtonLayout({ leading: ['close'] }))
		).toBe(true);
	});

	it('falls back to the default layout without GSettings', () => {
		const settings = composeSystemSettings(raw('GNOME'), linux);
		expect(settings.windowButtonLayout.equals(WindowButtonLayout.defaultFor('gnome'))).toBe(
			true
		);
	});

	it('reads the GNOME schema on Budgie, Pantheon and Unity', () => {
		for (const desktop of ['Budgie:GNOME', 'Pantheon', 'Unity']) {
			const settings = composeSystemSettings(
				raw(desktop, { gsettings: { [`${gnomeWm}/button-layout`]: 'close:' } }),
				linux
			);
			expect(settings.windowButtonLayout.leading, desktop).toEqual(['close']);
		}
	});

	it('reads the Cinnamon and MATE schemas', () => {
		const cinnamon = composeSystemSettings(
			raw('X-Cinnamon', {
				gsettings: {
					'org.cinnamon.desktop.wm.preferences/button-layout': ':minimize,close'
				}
			}),
			linux
		);
		expect(cinnamon.windowButtonLayout.trailing).toEqual(['minimize', 'close']);
		const mate = composeSystemSettings(
			raw('MATE', {
				gsettings: { 'org.mate.Marco.general/button-layout': 'close,maximize:' }
			}),
			linux
		);
		expect(mate.windowButtonLayout.leading).toEqual(['close', 'maximize']);
	});

	it('maps the GNOME 47 accent-color to the GNOME palette', () => {
		const settings = composeSystemSettings(
			raw('GNOME', {
				gsettings: { [`${gnomeInterface}/accent-color`]: 'purple' },
				systemAccent: '#123456'
			}),
			linux
		);
		expect(settings.accentColor).toBe(accentColors.purple);
	});

	it('uses the toolkit accent without accent-color', () => {
		const settings = composeSystemSettings(raw('GNOME', { systemAccent: '#123456' }), linux);
		expect(settings.accentColor).toBe('#123456');
	});

	it('reads high contrast from the a11y key, the GTK theme or the portal', () => {
		const contrast = (options: Parameters<typeof raw>[1]) =>
			composeSystemSettings(raw('GNOME', options), linux).highContrast;
		expect(contrast({ gsettings: { [`${a11y}/high-contrast`]: true } })).toBe(true);
		expect(contrast({ gsettings: { [`${gnomeInterface}/gtk-theme`]: 'HighContrast' } })).toBe(
			true
		);
		expect(contrast({ gsettings: { [`${gnomeInterface}/gtk-theme`]: 'Adwaita' } })).toBe(false);
		expect(contrast({ systemHighContrast: true })).toBe(true);
	});
});

describe('KDE Plasma', () => {
	it('reads the button layout from kwinrc', () => {
		const settings = composeSystemSettings(
			raw('KDE', { config: { kwinButtonsOnLeft: 'X', kwinButtonsOnRight: 'IA' } }),
			linux
		);
		expect(settings.windowControlStyle).toBe('breeze');
		expect(
			settings.windowButtonLayout.equals(
				new WindowButtonLayout({ leading: ['close'], trailing: ['minimize', 'maximize'] })
			)
		).toBe(true);
	});

	it('uses the Breeze defaults without kwinrc', () => {
		const settings = composeSystemSettings(raw('KDE'), linux);
		expect(settings.windowButtonLayout.trailing).toEqual(['minimize', 'maximize', 'close']);
	});

	it('reads the accent and contrast from kdeglobals', () => {
		const settings = composeSystemSettings(
			raw('KDE', {
				config: { kdeAccentColor: '#3DAEE9', kdeColorScheme: 'BreezeHighContrast' },
				systemAccent: '#123456'
			}),
			linux
		);
		expect(settings.accentColor).toBe('#3DAEE9');
		expect(settings.highContrast).toBe(true);
	});

	it('falls back to the toolkit accent without AccentColor', () => {
		const settings = composeSystemSettings(
			raw('KDE', { config: { kdeColorScheme: 'Breeze' }, systemAccent: '#123456' }),
			linux
		);
		expect(settings.accentColor).toBe('#123456');
		expect(settings.highContrast).toBe(false);
	});
});

describe('Xfce and COSMIC', () => {
	it('reads the Xfwm layout or its default', () => {
		const set = composeSystemSettings(
			raw('XFCE', { config: { xfwmButtonLayout: 'CMH|' } }),
			linux
		);
		expect(set.windowControlStyle).toBe('xfwm');
		expect(set.windowButtonLayout.leading).toEqual(['close', 'maximize', 'minimize']);
		expect(set.windowButtonLayout.trailing).toEqual([]);
		const unset = composeSystemSettings(raw('XFCE'), linux);
		expect(unset.windowButtonLayout.trailing).toEqual(['minimize', 'maximize', 'close']);
	});

	it('hides the COSMIC buttons turned off and shows every one by default', () => {
		const set = composeSystemSettings(
			raw('COSMIC', { config: { cosmicShowMinimize: false, cosmicShowMaximize: true } }),
			linux
		);
		expect(set.windowControlStyle).toBe('cosmic');
		expect(set.windowButtonLayout.trailing).toEqual(['maximize', 'close']);
		expect(composeSystemSettings(raw('COSMIC'), linux).windowButtonLayout.trailing).toEqual([
			'minimize',
			'maximize',
			'close'
		]);
	});
});

describe('other platforms', () => {
	it('use the platform defaults and the system accent', () => {
		const settings = composeSystemSettings(
			raw('GNOME', {
				systemAccent: '#0078D4',
				gsettings: { [`${gnomeWm}/button-layout`]: 'close:' }
			}),
			windows
		);
		expect(settings.desktopEnvironment).toBeNull();
		expect(settings.windowControlStyle).toBe('windows');
		expect(settings.windowButtonLayout.equals(WindowButtonLayout.defaultFor('windows'))).toBe(
			true
		);
		expect(settings.accentColor).toBe('#0078D4');
	});

	it('honor the system high-contrast preference', () => {
		expect(
			composeSystemSettings(raw('', { systemHighContrast: true }), windows).highContrast
		).toBe(true);
	});

	it('give the web no desktop environment', () => {
		const settings = composeSystemSettings(
			raw('GNOME'),
			new Platform({ os: 'linux', isWeb: true })
		);
		expect(settings.desktopEnvironment).toBeNull();
		expect(settings.windowControlStyle).toBe('none');
	});
});

describe('helpers', () => {
	it('compare settings field by field', () => {
		const a = composeSystemSettings(raw('GNOME'), linux);
		expect(sameSystemSettings(a, composeSystemSettings(raw('GNOME'), linux))).toBe(true);
		expect(
			sameSystemSettings(
				a,
				composeSystemSettings(raw('GNOME', { systemAccent: '#111111' }), linux)
			)
		).toBe(false);
	});

	it('load the defaults without a source or when reading fails', async () => {
		const defaults = await loadSystemSettings({ platform: linux });
		expect(defaults.desktopEnvironment).toBe('unknown');
		const failing = await loadSystemSettings({
			platform: linux,
			source: {
				read: () => Promise.reject(new Error('no plugin')),
				subscribe: async () => () => {}
			}
		});
		expect(failing.windowControlStyle).toBe(defaults.windowControlStyle);
		const read = await loadSystemSettings({
			platform: linux,
			source: { read: async () => raw('KDE'), subscribe: async () => () => {} }
		});
		expect(read.desktopEnvironment).toBe('kde');
	});
});
