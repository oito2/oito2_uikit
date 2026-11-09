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

import type { WindowController, WindowState } from '@oito2/ui';
import type { Window } from '@tauri-apps/api/window';
import { showWindowMenu, type DecorationMode } from './commands.js';

/** An edge or corner of a window that resize handles drag. */
export type ResizeDirection = Parameters<Window['startResizeDragging']>[0];

/** The options of `NativeWindowController.attach`. */
export interface NativeWindowControllerOptions {
	/** Whether the platform has a native window menu (Linux and Windows). */
	canShowMenu: boolean;
	/** The decoration mode of the window. */
	decorations: DecorationMode;
	/**
	 * Whether the controller mirrors the window state as `data-oito2-window-*` attributes
	 * on the root element, for CSS. Defaults to true.
	 */
	reflectToDocument?: boolean;
	/** Called once, after `dispose()` has stopped following the window. */
	onDispose?: () => void;
}

/** A point in CSS pixels from the top left of the page. */
interface Point {
	x: number;
	y: number;
}

const windowAttributes = ['maximized', 'fullscreen', 'inactive'] as const;
const pointerEvents = ['pointerdown', 'pointermove'] as const;

/**
 * Controls a Tauri window: minimize, maximize and restore, close, drag, resize and the
 * window menu, with a reactive `state` kept up to date from the window's resize, focus
 * and full-screen changes.
 */
export class NativeWindowController implements WindowController {
	/** The current window state. */
	state: WindowState = $state({
		isMaximized: false,
		isFullScreen: false,
		isActive: true,
		canShowMenu: false
	});

	/** The decoration mode of the window. */
	readonly decorations: DecorationMode;

	readonly #window: Window;
	readonly #reflect: boolean;
	readonly #onDispose: (() => void) | undefined;
	#unlisten: (() => void)[] = [];
	#generation = 0;
	#disposed = false;
	/** Where the pointer was last pressed or moved, for `showMenu()` without a position. */
	#pointer: Point | null = null;

	private constructor(window: Window, options: NativeWindowControllerOptions) {
		this.#window = window;
		this.decorations = options.decorations;
		this.#reflect = options.reflectToDocument ?? true;
		this.#onDispose = options.onDispose;
		this.state = { ...this.state, canShowMenu: options.canShowMenu };
	}

	/**
	 * Creates a controller for `window`, starts following its resize and focus events and
	 * reads its state. A controller that fails to read the state is disposed before the
	 * error propagates.
	 */
	static async attach(
		window: Window,
		options: NativeWindowControllerOptions
	): Promise<NativeWindowController> {
		const controller = new NativeWindowController(window, options);
		const refresh = () => {
			controller
				.refresh()
				.catch((error) => console.warn('oito2: could not read the window state', error));
		};
		try {
			controller.#unlisten = await Promise.all([
				window.onResized(refresh),
				window.onFocusChanged(({ payload }) => controller.#update({ isActive: payload }))
			]);
			controller.#listenToPointer(true);
			await controller.refresh();
		} catch (error) {
			controller.dispose();
			throw error;
		}
		return controller;
	}

	/**
	 * Reads the maximized, full-screen and focused state from the window. A read that a
	 * newer one overtakes is dropped.
	 */
	async refresh(): Promise<void> {
		if (this.#disposed) return;
		const generation = ++this.#generation;
		const [isMaximized, isFullScreen, isActive] = await Promise.all([
			this.#window.isMaximized(),
			this.#window.isFullscreen(),
			this.#window.isFocused()
		]);
		if (this.#disposed || generation !== this.#generation) return;
		this.state = { ...this.state, isMaximized, isFullScreen, isActive };
		this.#reflectState();
	}

	#update(change: Partial<WindowState>): void {
		if (this.#disposed) return;
		this.state = { ...this.state, ...change };
		this.#reflectState();
	}

	/** Mirrors the state on the root element: `data-oito2-window-maximized` and so on. */
	#reflectState(): void {
		if (!this.#reflect || typeof document === 'undefined') return;
		const root = document.documentElement;
		const set = (name: string, on: boolean) =>
			root.toggleAttribute(`data-oito2-window-${name}`, on);
		root.dataset.oito2Decorations = this.decorations;
		set('maximized', this.state.isMaximized);
		set('fullscreen', this.state.isFullScreen);
		set('inactive', !this.state.isActive);
	}

	/** Removes the attributes `#reflectState` set on the root element. */
	#clearReflectedState(): void {
		if (!this.#reflect || typeof document === 'undefined') return;
		const root = document.documentElement;
		delete root.dataset.oito2Decorations;
		for (const name of windowAttributes) root.removeAttribute(`data-oito2-window-${name}`);
	}

	readonly #trackPointer = (event: PointerEvent): void => {
		this.#pointer = { x: event.clientX, y: event.clientY };
	};

	/** Starts or stops recording the pointer position from the document's pointer events. */
	#listenToPointer(on: boolean): void {
		if (typeof document === 'undefined') return;
		for (const type of pointerEvents) {
			if (on) {
				document.addEventListener(type, this.#trackPointer, {
					capture: true,
					passive: true
				});
			} else {
				document.removeEventListener(type, this.#trackPointer, { capture: true });
			}
		}
	}

	minimize(): Promise<void> {
		return this.#window.minimize();
	}

	toggleMaximize(): Promise<void> {
		return this.#window.toggleMaximize();
	}

	close(): Promise<void> {
		return this.#window.close();
	}

	startDrag(): Promise<void> {
		return this.#window.startDragging();
	}

	/** Starts resizing the window from `direction` with the pointer that is pressed. */
	startResize(direction: ResizeDirection): Promise<void> {
		return this.#window.startResizeDragging(direction);
	}

	/**
	 * Shows the native window menu at `position` (CSS pixels from the top left of the page),
	 * or where the pointer was last pressed or moved (the top left corner before any pointer
	 * event); does nothing unless `state.canShowMenu`.
	 */
	async showMenu(position?: Point): Promise<void> {
		if (!this.state.canShowMenu) return;
		const { x, y } = position ?? this.#pointer ?? { x: 0, y: 0 };
		await showWindowMenu(Math.max(0, x), Math.max(0, y));
	}

	/**
	 * Stops following the window and the pointer, removes the attributes mirrored on the
	 * root element and calls `onDispose`. Later calls do nothing.
	 */
	dispose(): void {
		if (this.#disposed) return;
		this.#disposed = true;
		for (const stop of this.#unlisten) stop();
		this.#unlisten = [];
		this.#listenToPointer(false);
		this.#clearReflectedState();
		this.#onDispose?.();
	}
}
