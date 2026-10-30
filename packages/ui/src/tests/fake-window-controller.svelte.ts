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

import type { WindowController, WindowState } from '../lib/window/window-controller.js';

/** A window controller for tests: records every call and lets the test set the state. */
export class FakeWindowController implements WindowController {
	state: WindowState = $state({
		isMaximized: false,
		isFullScreen: false,
		isActive: true,
		canShowMenu: true
	});
	readonly calls: string[] = [];

	async minimize() {
		this.calls.push('minimize');
	}

	async toggleMaximize() {
		this.calls.push('toggleMaximize');
		this.state = { ...this.state, isMaximized: !this.state.isMaximized };
	}

	async close() {
		this.calls.push('close');
	}

	async startDrag() {
		this.calls.push('startDrag');
	}

	async showMenu(position?: { x: number; y: number }) {
		this.calls.push(
			position ? `showMenu ${Math.round(position.x)},${Math.round(position.y)}` : 'showMenu'
		);
	}
}
