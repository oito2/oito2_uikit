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
import { activeElement, focusElement, tabbables } from '../internal/focus.js';
import { isEditableTarget } from '../internal/keyboard.js';

/** The options of `edgeFocus`. */
export interface EdgeFocusOptions {
	/**
	 * Which arrows move focus: `horizontal` (Left/Right), `vertical` (Up/Down) or `both`.
	 * Defaults to `both`.
	 */
	orientation?: 'horizontal' | 'vertical' | 'both';
}

type Arrow = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

const vectors: Record<Arrow, readonly [number, number]> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1]
};

/**
 * Returns the element of `candidates` nearest to `from` in the direction of `arrow`, or
 * `undefined` when none lies that way. Distance along the arrow counts once and the
 * sideways offset twice, so elements in the same row or column win.
 */
function nearest(
	from: Element,
	candidates: readonly HTMLElement[],
	arrow: Arrow
): HTMLElement | undefined {
	const [dx, dy] = vectors[arrow];
	const origin = from.getBoundingClientRect();
	const ox = origin.left + origin.width / 2;
	const oy = origin.top + origin.height / 2;
	let best: HTMLElement | undefined;
	let bestScore = Infinity;
	for (const candidate of candidates) {
		if (candidate === from) continue;
		const rect = candidate.getBoundingClientRect();
		// Only elements that start past the edge of `from` in the arrow's direction count.
		const ahead =
			dx > 0
				? rect.left >= origin.right - 1
				: dx < 0
					? rect.right <= origin.left + 1
					: dy > 0
						? rect.top >= origin.bottom - 1
						: rect.bottom <= origin.top + 1;
		if (!ahead) continue;
		const cx = rect.left + rect.width / 2 - ox;
		const cy = rect.top + rect.height / 2 - oy;
		const along = Math.abs(dx !== 0 ? cx : cy);
		const across = Math.abs(dx !== 0 ? cy : cx);
		const score = along + 2 * across;
		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}
	return best;
}

/**
 * Moves focus between the focusable elements of a group with the arrow keys, by their
 * position on screen, and keeps it inside the group: at the edges the arrows stop instead
 * of leaving it or scrolling the page. Tab and Shift+Tab still move to the elements
 * around the group. Useful for grids of cards and toolbars of mixed controls.
 *
 * Keys a control inside already handles (it calls `preventDefault`) and the arrows of
 * text fields are left alone.
 */
export function edgeFocus(options: EdgeFocusOptions = {}): Attachment<HTMLElement> {
	return (container) => {
		const { orientation = 'both' } = options;
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.ctrlKey ||
				event.altKey ||
				event.metaKey ||
				event.shiftKey
			) {
				return;
			}
			const arrow = event.key as Arrow;
			if (!(arrow in vectors)) return;
			const horizontal = arrow === 'ArrowLeft' || arrow === 'ArrowRight';
			if (
				(horizontal && orientation === 'vertical') ||
				(!horizontal && orientation === 'horizontal')
			) {
				return;
			}
			if (isEditableTarget(event.target)) return;
			const active = activeElement(container.ownerDocument);
			if (!active || !container.contains(active)) return;
			event.preventDefault();
			focusElement(nearest(active, tabbables(container), arrow));
		};
		container.addEventListener('keydown', onKeyDown);
		return () => container.removeEventListener('keydown', onKeyDown);
	};
}
