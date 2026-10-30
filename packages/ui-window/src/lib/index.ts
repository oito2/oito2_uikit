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

export {
	decorationMode,
	setDecorationMode,
	showWindowMenu,
	type DecorationMode
} from './commands.js';
export {
	NativeWindowController,
	type NativeWindowControllerOptions,
	type ResizeDirection
} from './native-window-controller.svelte.js';
export { initWindow, type InitWindowOptions } from './init-window.js';
export { default as WindowResizeHandles } from './WindowResizeHandles.svelte';
