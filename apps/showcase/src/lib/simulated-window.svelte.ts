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
	Platform,
	WindowButtonLayout,
	fallbackSystemSettings,
	type SystemSettings,
	type WindowController,
	type WindowState
} from '@oito2/ui';
import type { SimulatedDesktop } from './showcase-settings.svelte.js';

/**
 * A window controller for the browser build: maximize toggles the state so the title bar
 * shows the restore glyph, and the other actions only report themselves.
 */
export class SimulatedWindowController implements WindowController {
	state: WindowState = $state({
		isMaximized: false,
		isFullScreen: false,
		isActive: true,
		canShowMenu: false
	});
	/** The last action, shown by the showcase. */
	lastAction = $state('');

	async minimize() {
		this.lastAction = 'minimize';
	}

	async toggleMaximize() {
		this.lastAction = this.state.isMaximized ? 'restore' : 'maximize';
		this.state = { ...this.state, isMaximized: !this.state.isMaximized };
	}

	async close() {
		this.lastAction = 'close';
	}

	async startDrag() {
		this.lastAction = 'drag';
	}

	async showMenu() {
		this.lastAction = 'menu';
	}
}

/** Returns the system settings of a native app on the simulated `desktop`. */
export function simulatedSettings(desktop: Exclude<SimulatedDesktop, 'system'>): SystemSettings {
	if (desktop === 'windows' || desktop === 'macos') {
		return fallbackSystemSettings(new Platform({ os: desktop, isWeb: false }));
	}
	const environment = { gnome: 'gnome', kde: 'kde', xfce: 'xfce', cosmic: 'cosmic' } as const;
	const settings = fallbackSystemSettings(new Platform({ os: 'linux', isWeb: false }), {
		desktopEnvironment: environment[desktop]
	});
	return {
		...settings,
		windowButtonLayout: WindowButtonLayout.defaultFor(settings.windowControlStyle)
	};
}
