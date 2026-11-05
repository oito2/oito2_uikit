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

/** A position in pixels from the top-left corner of the positioned container. */
export interface DraggablePosition {
	x: number;
	y: number;
}

/** The options of `draggable`. */
export interface DraggableOptions {
	/** The position at first; later changes are ignored. Defaults to the top-left corner. */
	initialPosition?: DraggablePosition;
	/** How far one arrow key press moves the element, in pixels. Defaults to 8. */
	keyboardStep?: number;
	/** Called when a pointer drag starts. */
	onDragStart?: () => void;
	/** Called when a pointer drag ends or is cancelled. */
	onDragEnd?: () => void;
	/** Called with each new position, after a pointer or keyboard move. */
	onMove?: (position: DraggablePosition) => void;
}

/**
 * Lets the user move an element inside its positioned container, with the pointer or, once
 * focused, with the arrow keys. The element is placed with `position: absolute` at
 * `left`/`top` from the container's top-left corner and joins the tab order.
 *
 * Give the element an accessible name, and a description such as the localized
 * `moveWithArrowKeys` string, which tells assistive technologies how to move it.
 *
 * ```svelte
 * <div style="position: relative">
 *   <div aria-label="Note" {@attach draggable({ initialPosition: { x: 16, y: 16 } })}>…</div>
 * </div>
 * ```
 */
export function draggable(options: DraggableOptions = {}): Attachment<HTMLElement> {
	return (element) => {
		const step = options.keyboardStep ?? 8;
		const position = { ...(options.initialPosition ?? { x: 0, y: 0 }) };
		let drag: { pointer: number; x: number; y: number } | null = null;
		const previousTabIndex = element.getAttribute('tabindex');

		const place = () => {
			element.style.left = `${position.x}px`;
			element.style.top = `${position.y}px`;
		};
		const move = (dx: number, dy: number) => {
			position.x += dx;
			position.y += dy;
			place();
			options.onMove?.({ ...position });
		};

		element.style.position = 'absolute';
		element.style.touchAction = 'none';
		element.style.cursor = 'grab';
		if (previousTabIndex === null) element.tabIndex = 0;
		element.dataset.oito2Draggable = '';
		place();

		const onPointerDown = (event: PointerEvent) => {
			if (event.button !== 0 || drag) return;
			drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
			try {
				element.setPointerCapture(event.pointerId);
			} catch {
				// A pointer that is no longer active can't be captured; the drag still follows it.
			}
			element.style.cursor = 'grabbing';
			element.dataset.dragging = '';
			options.onDragStart?.();
		};
		const onPointerMove = (event: PointerEvent) => {
			if (!drag || event.pointerId !== drag.pointer) return;
			const dx = event.clientX - drag.x;
			const dy = event.clientY - drag.y;
			drag.x = event.clientX;
			drag.y = event.clientY;
			if (dx !== 0 || dy !== 0) move(dx, dy);
		};
		const onPointerEnd = (event: PointerEvent) => {
			if (!drag || event.pointerId !== drag.pointer) return;
			drag = null;
			element.style.cursor = 'grab';
			delete element.dataset.dragging;
			options.onDragEnd?.();
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.target !== element || event.altKey || event.ctrlKey || event.metaKey) return;
			const delta: Record<string, [number, number]> = {
				ArrowUp: [0, -step],
				ArrowDown: [0, step],
				ArrowLeft: [-step, 0],
				ArrowRight: [step, 0]
			};
			const shift = delta[event.key];
			if (!shift) return;
			event.preventDefault();
			move(shift[0], shift[1]);
		};

		element.addEventListener('pointerdown', onPointerDown);
		element.addEventListener('pointermove', onPointerMove);
		element.addEventListener('pointerup', onPointerEnd);
		element.addEventListener('pointercancel', onPointerEnd);
		element.addEventListener('lostpointercapture', onPointerEnd);
		element.addEventListener('keydown', onKeyDown);
		return () => {
			element.removeEventListener('pointerdown', onPointerDown);
			element.removeEventListener('pointermove', onPointerMove);
			element.removeEventListener('pointerup', onPointerEnd);
			element.removeEventListener('pointercancel', onPointerEnd);
			element.removeEventListener('lostpointercapture', onPointerEnd);
			element.removeEventListener('keydown', onKeyDown);
			delete element.dataset.oito2Draggable;
			delete element.dataset.dragging;
			if (previousTabIndex === null) element.removeAttribute('tabindex');
		};
	};
}
