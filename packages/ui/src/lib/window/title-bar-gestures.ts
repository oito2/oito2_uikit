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

import type { Attachment } from 'svelte/attachments';
import type { WindowController } from './window-controller.js';

/** The attribute that marks the parts of a title bar that move the window. */
export const dragRegionAttribute = 'data-oito2-drag-region';

/** Elements that take their own clicks, even inside a drag region. */
const interactive =
	'button, a[href], input, select, textarea, label, [role="button"], [role="tab"], [contenteditable]:not([contenteditable="false"])';

/**
 * Whether a pointer event hit an empty part of a title bar: the bar itself, or an
 * element inside it marked with `data-oito2-drag-region`.
 */
function onBackground(bar: HTMLElement, event: Event): boolean {
	const target = event.target as Element | null;
	if (!target || !bar.contains(target)) return false;
	if (target === bar) return true;
	// Controls on the bar keep their own clicks.
	if (target.closest(interactive)) return false;
	const region = target.closest(`[${dragRegionAttribute}]`);
	return region !== null && bar.contains(region);
}

/**
 * Makes an element behave like a window title bar for `controller`: pressing its empty
 * background (the element itself, or descendants marked with `data-oito2-drag-region`)
 * moves the window, double-clicking it maximizes or restores the window, and the
 * secondary button shows the window menu where the platform has one. Controls on the bar
 * keep their own clicks.
 */
export function titleBarGestures(
	controller: () => WindowController | null | undefined
): Attachment<HTMLElement> {
	return (bar) => {
		// Mouse events count the clicks of a double click in \`detail\`; pointer events don't
		// in every engine.
		const onMouseDown = (event: MouseEvent) => {
			const window = controller();
			if (!window || event.button !== 0 || !onBackground(bar, event)) return;
			if (event.detail === 2) void window.toggleMaximize();
			else if (!window.state.isFullScreen) void window.startDrag();
		};
		const onContextMenu = (event: MouseEvent) => {
			const window = controller();
			if (!window || !onBackground(bar, event)) return;
			event.preventDefault();
			if (window.state.canShowMenu)
				void window.showMenu({ x: event.clientX, y: event.clientY });
		};
		bar.addEventListener('mousedown', onMouseDown);
		bar.addEventListener('contextmenu', onContextMenu);
		return () => {
			bar.removeEventListener('mousedown', onMouseDown);
			bar.removeEventListener('contextmenu', onContextMenu);
		};
	};
}
