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
import type { LogicalSize as LogicalSizeClass, Window } from '@tauri-apps/api/window';
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
	/**
	 * Cancels the call: once it aborts before the call finishes, the controller created
	 * so far is disposed and the call resolves to `null`.
	 */
	signal?: AbortSignal;
}

/** The controller of each window label, from the call that created it until it is disposed. */
const controllers = new Map<string, Promise<NativeWindowController | null>>();

/**
 * Prepares the current Tauri window and returns its controller for a `WindowScope`, or
 * `null` outside Tauri (in a browser), where title bars show no window controls.
 *
 * One controller exists per window: while it is alive (until `dispose()`), later calls
 * for the same window resolve to it without applying their options or `signal`. Rejects
 * when `tauri-plugin-oito2-window` is not registered or the capability does not allow
 * its commands.
 */
export async function initWindow(
	options: InitWindowOptions = {}
): Promise<NativeWindowController | null> {
	if (!isTauri() || options.signal?.aborted) return null;
	const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
	const window = getCurrentWindow();
	const live = controllers.get(window.label);
	if (live) return live;
	const release = () => {
		if (controllers.get(window.label) === connecting) controllers.delete(window.label);
	};
	const connecting: Promise<NativeWindowController | null> = connect(
		window,
		LogicalSize,
		options,
		release
	).then(
		(controller) => {
			if (!controller) release();
			return controller;
		},
		(error: unknown) => {
			release();
			throw error;
		}
	);
	controllers.set(window.label, connecting);
	return connecting;
}

/** Applies `options` to `window` and attaches its controller, or `null` once `signal` aborts. */
async function connect(
	window: Window,
	LogicalSize: typeof LogicalSizeClass,
	options: InitWindowOptions,
	onDispose: () => void
): Promise<NativeWindowController | null> {
	const { signal } = options;
	let decorations: DecorationMode;
	try {
		if (options.decorations) {
			await setDecorationMode(options.decorations);
			decorations = options.decorations;
		} else {
			decorations = await decorationMode();
		}
	} catch (error) {
		throw new Error(
			'oito2: tauri-plugin-oito2-window is not registered or the capability does not allow it',
			{ cause: error }
		);
	}
	if (signal?.aborted) return null;
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
	const controller = await NativeWindowController.attach(window, {
		canShowMenu: os === 'linux' || os === 'windows',
		decorations,
		onDispose
	});
	if (signal?.aborted) {
		controller.dispose();
		return null;
	}
	return controller;
}
