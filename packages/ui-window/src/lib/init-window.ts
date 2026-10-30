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
import { isTauri } from '@tauri-apps/api/core';
import { decorationMode, setDecorationMode, type DecorationMode } from './commands.js';
import { NativeWindowController } from './native-window-controller.svelte.js';

/** The options of `initWindow`. */
export interface InitWindowOptions {
	/** The window title. */
	title?: string;
	/** The size in logical pixels. */
	size?: { width: number; height: number };
	/** The minimum size in logical pixels. */
	minimumSize?: { width: number; height: number };
	/** Whether the window is centered on the screen. */
	center?: boolean;
	/**
	 * The frame to apply. Leave it out to keep the one the app set up in Rust (or the
	 * configuration's).
	 */
	decorations?: DecorationMode;
	/**
	 * Whether the window is shown and focused at the end, for windows configured with
	 * `visible: false` so the frame changes before they appear. Defaults to true.
	 */
	show?: boolean;
}

/**
 * Prepares the current Tauri window and returns its controller for a `WindowScope`, or
 * `null` outside Tauri (in a browser), where title bars show no window controls.
 */
export async function initWindow(
	options: InitWindowOptions = {}
): Promise<NativeWindowController | null> {
	if (!isTauri()) return null;
	const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
	const window = getCurrentWindow();
	if (options.decorations) await setDecorationMode(options.decorations);
	if (options.title !== undefined) await window.setTitle(options.title);
	if (options.size)
		await window.setSize(new LogicalSize(options.size.width, options.size.height));
	if (options.minimumSize) {
		await window.setMinSize(
			new LogicalSize(options.minimumSize.width, options.minimumSize.height)
		);
	}
	if (options.center) await window.center();
	if (options.show ?? true) {
		await window.show();
		await window.setFocus();
	}
	const os = Platform.current().os;
	return NativeWindowController.attach(window, {
		canShowMenu: os === 'linux' || os === 'windows',
		decorations: options.decorations ?? (await decorationMode())
	});
}
