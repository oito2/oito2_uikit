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

/** The options of `longPress`. */
export interface LongPressOptions {
	/** How long the press lasts, in milliseconds. Defaults to 500. */
	delay?: number;
	/** How far the pointer may move during the press, in pixels. Defaults to 10. */
	tolerance?: number;
}

/**
 * Calls `onPress` with the starting point when a touch or pen pointer stays down on the
 * element for `delay` milliseconds without moving farther than `tolerance` pixels. The
 * press ends when the pointer lifts, is cancelled or moves too far, and when a second
 * pointer comes down, as in a pinch. The pending press is cancelled when the element goes
 * away.
 */
export function longPress(
	onPress: (at: { x: number; y: number }) => void,
	options: LongPressOptions = {}
): Attachment<HTMLElement> {
	const { delay = 500, tolerance = 10 } = options;
	return (node) => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		let start: { id: number; x: number; y: number } | null = null;

		const cancel = () => {
			clearTimeout(timer);
			timer = undefined;
			start = null;
		};
		const onDown = (event: PointerEvent) => {
			const second = start !== null;
			cancel();
			if (second || event.pointerType === 'mouse') return;
			const at = { x: event.clientX, y: event.clientY };
			start = { id: event.pointerId, ...at };
			timer = setTimeout(() => {
				timer = undefined;
				start = null;
				onPress(at);
			}, delay);
		};
		const onMove = (event: PointerEvent) => {
			if (!start || event.pointerId !== start.id) return;
			if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > tolerance) cancel();
		};
		const onEnd = (event: PointerEvent) => {
			if (start && event.pointerId === start.id) cancel();
		};

		node.addEventListener('pointerdown', onDown);
		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerup', onEnd);
		node.addEventListener('pointercancel', onEnd);
		return () => {
			cancel();
			node.removeEventListener('pointerdown', onDown);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerup', onEnd);
			node.removeEventListener('pointercancel', onEnd);
		};
	};
}
