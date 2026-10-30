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

import { getContext, hasContext, setContext } from 'svelte';

/** The state of an app window, as the title bar shows it. */
export interface WindowState {
	/** Whether the window fills the work area. */
	readonly isMaximized: boolean;
	/** Whether the window is in full-screen mode. */
	readonly isFullScreen: boolean;
	/** Whether the window has the input focus. */
	readonly isActive: boolean;
	/** Whether the platform can show the native window menu. */
	readonly canShowMenu: boolean;
}

/** The state of a window nothing controls: restored, windowed and active. */
export const defaultWindowState: WindowState = Object.freeze({
	isMaximized: false,
	isFullScreen: false,
	isActive: true,
	canShowMenu: false
});

/**
 * Controls the window an app runs in. `@oito2/ui-window` implements it for Tauri
 * (`NativeWindowController`); tests and previews can provide their own. `state` must be
 * reactive (a `$state` field), so title bars follow it.
 */
export interface WindowController {
	/** The current window state. */
	readonly state: WindowState;
	/** Minimizes the window. */
	minimize(): Promise<void>;
	/** Maximizes the window, or restores it when it is maximized. */
	toggleMaximize(): Promise<void>;
	/** Asks the window to close. */
	close(): Promise<void>;
	/** Starts moving the window with the pointer that is pressed. */
	startDrag(): Promise<void>;
	/**
	 * Shows the native window menu at `position` (in CSS pixels from the top left of the
	 * page), or under the pointer; does nothing unless `state.canShowMenu`.
	 */
	showMenu(position?: { x: number; y: number }): Promise<void>;
}

const key = Symbol('oito2.window-controller');

/** A live view of the window controller provided to a component. */
export interface WindowControllerRef {
	/** The controller, or `null` when the app doesn't control its window (on the web). */
	readonly current: WindowController | null;
}

/**
 * Provides a window controller to the components below the calling one; `get` is called
 * on every read. Must be called during component initialization.
 */
export function setWindowController(get: () => WindowController | null | undefined): void {
	setContext<WindowControllerRef>(key, {
		get current() {
			return get() ?? null;
		}
	});
}

/**
 * Returns the window controller of the closest `WindowScope`, whose `current` is `null`
 * when there is none. Must be called during component initialization.
 */
export function useWindowController(): WindowControllerRef {
	if (hasContext(key)) return getContext<WindowControllerRef>(key);
	return { current: null };
}
