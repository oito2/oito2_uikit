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

import { Platform } from '@oito2/ui';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { NativeWindowController } from './native-window-controller.svelte.js';
import WindowResizeHandles from './WindowResizeHandles.svelte';

/** Mocks a main window whose state commands answer from `state`, recording every command. */
function mockWindow(state: { maximized: boolean }) {
	const calls: { cmd: string; args: unknown }[] = [];
	mockWindows('main');
	mockIPC(
		(cmd, args) => {
			calls.push({ cmd, args });
			if (cmd === 'plugin:window|is_maximized') return state.maximized;
			if (cmd === 'plugin:window|is_fullscreen') return false;
			if (cmd === 'plugin:window|is_focused') return true;
			return null;
		},
		{ shouldMockEvents: true }
	);
	return calls;
}

const handles = () => document.querySelectorAll('.oito2-resize-handle');
// The handles exist on Linux only; WebKit on Linux reports itself as macOS.
const linux = Platform.current().isLinux;

afterEach(() => clearMocks());

describe('WindowResizeHandles', () => {
	it.skipIf(!linux)(
		'renders the eight handles of an undecorated window and resizes from them',
		async () => {
			const calls = mockWindow({ maximized: false });
			const controller = await NativeWindowController.attach(getCurrentWindow(), {
				canShowMenu: true,
				decorations: 'undecorated'
			});
			render(WindowResizeHandles, { controller });
			await expect.poll(() => handles().length).toBe(8);
			calls.length = 0;
			const corner = document.querySelector('[data-edge="se"]');
			expect(corner).not.toBeNull();
			corner?.dispatchEvent(
				new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true })
			);
			await expect
				.poll(() =>
					calls.find((call) => call.cmd === 'plugin:window|start_resize_dragging')
				)
				.toEqual({
					cmd: 'plugin:window|start_resize_dragging',
					args: { label: 'main', value: 'SouthEast' }
				});
			controller.dispose();
		}
	);

	it('renders nothing while the window is maximized', async () => {
		mockWindow({ maximized: true });
		const controller = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: true,
			decorations: 'undecorated'
		});
		render(WindowResizeHandles, { controller });
		await expect.poll(() => handles().length).toBe(0);
		controller.dispose();
	});

	it('renders nothing with GTK client-side decorations', async () => {
		mockWindow({ maximized: false });
		const controller = await NativeWindowController.attach(getCurrentWindow(), {
			canShowMenu: true,
			decorations: 'gtk-headerless'
		});
		render(WindowResizeHandles, { controller });
		await expect.poll(() => handles().length).toBe(0);
		controller.dispose();
	});
});
