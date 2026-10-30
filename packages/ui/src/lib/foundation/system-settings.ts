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

import type { DesktopEnvironment } from './desktop-environment.js';
import type { Platform } from './platform.js';
import {
	WindowButtonLayout,
	resolveWindowControlStyle,
	type WindowControlStyle
} from './window-button-layout.js';

/**
 * The operating system preferences that shape an oito2 app: platform, desktop
 * environment, window controls, accent color and contrast. `fallbackSystemSettings`
 * derives them from the platform alone; `@oito2/ui-settings` reads the real ones.
 */
export interface SystemSettings {
	/** The platform the app runs on. */
	readonly platform: Platform;
	/** The Linux desktop environment, or `null` outside native Linux. */
	readonly desktopEnvironment: DesktopEnvironment | null;
	/** The visual family of the window control buttons. */
	readonly windowControlStyle: WindowControlStyle;
	/** The order and side of the window control buttons. */
	readonly windowButtonLayout: WindowButtonLayout;
	/** The system accent color as a hex string, or `null` when there is none or it is unknown. */
	readonly accentColor: string | null;
	/** Whether the system asks for high contrast. */
	readonly highContrast: boolean;
}

/**
 * Returns settings derived from `platform` only. On native Linux the desktop environment
 * defaults to `unknown`; elsewhere it is `null`. The control style and button layout follow
 * `resolveWindowControlStyle` and `WindowButtonLayout.defaultFor`; there is no accent color
 * and high contrast is off.
 */
export function fallbackSystemSettings(
	platform: Platform,
	options: { desktopEnvironment?: DesktopEnvironment | null } = {}
): SystemSettings {
	const desktopEnvironment =
		platform.isLinux && platform.isDesktopNative
			? (options.desktopEnvironment ?? 'unknown')
			: null;
	const windowControlStyle = resolveWindowControlStyle(platform, { desktopEnvironment });
	return {
		platform,
		desktopEnvironment,
		windowControlStyle,
		windowButtonLayout: WindowButtonLayout.defaultFor(windowControlStyle),
		accentColor: null,
		highContrast: false
	};
}
