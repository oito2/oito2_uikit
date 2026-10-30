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

import { invoke } from '@tauri-apps/api/core';

/**
 * How a window frame is drawn: the system frame (`native`), none at all
 * (`undecorated`, the app draws the title bar and resize handles), or GTK client-side
 * decorations with an empty title bar (`gtk-headerless`, Linux: GTK keeps the shadow and
 * resize edges).
 */
export type DecorationMode = 'native' | 'undecorated' | 'gtk-headerless';

/**
 * Applies `mode` to the current window through `tauri-plugin-oito2-window`. Call it
 * while the window is still hidden.
 */
export function setDecorationMode(mode: DecorationMode): Promise<void> {
	return invoke('plugin:oito2-window|set_decoration_mode', { mode });
}

/** Returns the decoration mode of the current window. */
export function decorationMode(): Promise<DecorationMode> {
	return invoke<DecorationMode>('plugin:oito2-window|decoration_mode');
}

/**
 * Shows the native window menu of the current window at `x`, `y` (CSS pixels from the
 * top left of the page), on Linux and Windows.
 */
export function showWindowMenu(x: number, y: number): Promise<void> {
	return invoke('plugin:oito2-window|show_window_menu', { x, y });
}
