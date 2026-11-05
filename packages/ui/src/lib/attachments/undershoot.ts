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

/** The options of `undershoot`. */
export interface UndershootOptions {
	/** Whether the shadow at the start edge shows. Defaults to true. */
	start?: boolean;
	/** Whether the shadow at the end edge shows. Defaults to true. */
	end?: boolean;
	/** The depth of the shadows in pixels. Defaults to 16. */
	extent?: number;
	/** The axis the element scrolls along. Defaults to `vertical`. */
	orientation?: 'vertical' | 'horizontal';
	/** Whether a horizontal scroll also follows the vertical mouse wheel. Defaults to true. */
	pointerScrolling?: boolean;
}

/**
 * Fades a soft shadow in at the start and end edges of a scrolling element while there is
 * more content beyond them, as GTK does.
 *
 * The shadows are the element's `::before` and `::after`, kept in view with
 * `position: sticky`, so the element must not use those pseudo-elements itself. A
 * horizontal undershoot needs a flex row (the shadows stretch across it). With
 * `pointerScrolling`, a horizontal scroll also follows the vertical mouse wheel.
 *
 * Needs `@oito2/ui/styles.css` (or `base.css`), which styles `data-oito2-undershoot`.
 *
 * ```svelte
 * <div style="overflow: auto; height: 200px" {@attach undershoot()}>…</div>
 * ```
 */
export function undershoot(options: UndershootOptions = {}): Attachment<HTMLElement> {
	return (element) => {
		const { start = true, end = true, extent = 16, orientation = 'vertical' } = options;
		const pointerScrolling = options.pointerScrolling ?? true;
		const horizontal = orientation === 'horizontal';
		element.dataset.oito2Undershoot = orientation;
		element.style.setProperty('--oito2-undershoot-extent', `${extent}px`);

		const update = () => {
			const offset = Math.abs(horizontal ? element.scrollLeft : element.scrollTop);
			const size = horizontal ? element.clientWidth : element.clientHeight;
			const total = horizontal ? element.scrollWidth : element.scrollHeight;
			const before = start && offset > 0.5;
			const after = end && offset + size < total - 0.5;
			if (before) element.dataset.oito2UndershootStart = '';
			else delete element.dataset.oito2UndershootStart;
			if (after) element.dataset.oito2UndershootEnd = '';
			else delete element.dataset.oito2UndershootEnd;
		};

		const onWheel = (event: WheelEvent) => {
			if (!horizontal || !pointerScrolling || event.ctrlKey) return;
			if (event.deltaY === 0 || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
			if (element.scrollWidth <= element.clientWidth) return;
			event.preventDefault();
			const rtl = getComputedStyle(element).direction === 'rtl';
			const scale =
				event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
			element.scrollBy({ left: event.deltaY * scale * (rtl ? -1 : 1) });
		};

		update();
		const resize = new ResizeObserver(update);
		resize.observe(element);
		const mutation = new MutationObserver(update);
		mutation.observe(element, { childList: true, subtree: true, characterData: true });
		element.addEventListener('scroll', update, { passive: true });
		element.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			resize.disconnect();
			mutation.disconnect();
			element.removeEventListener('scroll', update);
			element.removeEventListener('wheel', onWheel);
			delete element.dataset.oito2Undershoot;
			delete element.dataset.oito2UndershootStart;
			delete element.dataset.oito2UndershootEnd;
			element.style.removeProperty('--oito2-undershoot-extent');
		};
	};
}
