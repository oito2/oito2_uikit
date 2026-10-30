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

import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { afterEach, describe, expect, it } from 'vitest';
import { NativeWindowController } from './native-window-controller.svelte.js';

/** Mocks a main window whose state commands answer from `state`, recording every command. */
function mockWindow(state: { maximized: boolean; fullscreen: boolean; focused: boolean }) {
	const calls: { cmd: string; args: unknown }[] = [];
	mockWindows('main');
	mockIPC(
		(cmd, args) => {
			calls.push({ cmd, args });
			if (cmd === 'plugin:window|is_maximized') return state.maximized;
			if (cmd === 'plugin:window|is_fullscreen') return state.fullscreen;
			if (cmd === 'plugin:window|is_focused') return state.focused;
			return null;
		},
		{ shouldMockEvents: true }
	);
	return calls;
}

afterEach(() => {
	clearMocks();
	for (const name of ['maximized', 'fullscreen', 'inactive']) {
		document.documentElement.removeAttribute(`data-oito2-window-${name}`);
	}
});

describe('NativeWindowController', () => {
	it('reads the window state and mirrors it on the root element', async () => {
		mockWindow({ maximized: true, fullscreen: false, focused: false });
		const controller = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: true,
			decorations: 'gtk-headerless'
		});
		expect(controller.state).toEqual({
			isMaximized: true,
			isFullScreen: false,
			isActive: false,
			canShowMenu: true
		});
		const root = document.documentElement;
		expect(root.dataset.oito2Decorations).toBe('gtk-headerless');
		expect(root.hasAttribute('data-oito2-window-maximized')).toBe(true);
		expect(root.hasAttribute('data-oito2-window-inactive')).toBe(true);
		controller.dispose();
	});

	it('runs the window actions through the Tauri window API', async () => {
		const calls = mockWindow({ maximized: false, fullscreen: false, focused: true });
		const controller = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: true,
			decorations: 'undecorated'
		});
		calls.length = 0;
		await controller.minimize();
		await controller.toggleMaximize();
		await controller.startDrag();
		await controller.startResize('SouthEast');
		await controller.close();
		expect(calls.map((call) => call.cmd)).toEqual([
			'plugin:window|minimize',
			'plugin:window|toggle_maximize',
			'plugin:window|start_dragging',
			'plugin:window|start_resize_dragging',
			'plugin:window|close'
		]);
		controller.dispose();
	});

	it('shows the native window menu only where the platform has one', async () => {
		const calls = mockWindow({ maximized: false, fullscreen: false, focused: true });
		const withMenu = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: true,
			decorations: 'undecorated'
		});
		calls.length = 0;
		await withMenu.showMenu({ x: 40, y: 12 });
		expect(calls).toEqual([
			{ cmd: 'plugin:oito2-window|show_window_menu', args: { x: 40, y: 12 } }
		]);
		withMenu.dispose();
		const withoutMenu = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: false,
			decorations: 'native'
		});
		calls.length = 0;
		await withoutMenu.showMenu({ x: 40, y: 12 });
		expect(calls).toEqual([]);
		withoutMenu.dispose();
	});

	it('follows resize and focus events', async () => {
		const state = { maximized: false, fullscreen: false, focused: true };
		mockWindow(state);
		const controller = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: false,
			decorations: 'native'
		});
		state.maximized = true;
		await emit('tauri://resize', { width: 800, height: 600 });
		await expect.poll(() => controller.state.isMaximized).toBe(true);
		await emit('tauri://blur');
		await expect.poll(() => controller.state.isActive).toBe(false);
		await emit('tauri://focus');
		await expect.poll(() => controller.state.isActive).toBe(true);
		controller.dispose();
	});
});
