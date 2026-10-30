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

import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
	size,
	type Middleware,
	type Placement
} from '@floating-ui/dom';
import type { Attachment } from 'svelte/attachments';

export type { Placement };

/** The options of `floating`. */
export interface FloatingOptions {
	/** Where the floating element goes relative to its reference. Defaults to `bottom`. */
	placement?: Placement;
	/** The gap between the reference and the floating element, in pixels. Defaults to 4. */
	offset?: number;
	/** Whether the element moves to the opposite side when it doesn't fit. Defaults to true. */
	flip?: boolean;
	/** Whether the element slides along its side to stay in view. Defaults to true. */
	shift?: boolean;
	/** The space kept between the element and the viewport edges, in pixels. Defaults to 8. */
	padding?: number;
	/** Whether the element is as wide as its reference, as a select menu is. Defaults to false. */
	sameWidth?: boolean;
	/** The arrow element pointing at the reference, positioned along the element's side. */
	arrow?: () => HTMLElement | null | undefined;
	/** Called after each positioning with the final placement. */
	onPlacement?: (placement: Placement) => void;
}

/**
 * Positions a floating element (a popover, menu or tooltip) next to a reference element
 * with `position: fixed`, and keeps it there while either one moves, resizes or scrolls.
 * It sets `data-placement` on the element and `--oito2-available-width`/`-height` to the
 * room left in the viewport, and the arrow's `left`/`top`.
 */
export function floating(
	reference: () => Element | null | undefined,
	options: FloatingOptions = {}
): Attachment<HTMLElement> {
	return (element) => {
		const anchor = reference();
		if (!anchor) return;
		const padding = options.padding ?? 8;
		element.style.position = 'fixed';
		element.style.left = '0';
		element.style.top = '0';

		const update = async () => {
			const arrowElement = options.arrow?.() ?? null;
			const middleware: Middleware[] = [offset(options.offset ?? 4)];
			if (options.flip ?? true) middleware.push(flip({ padding }));
			if (options.shift ?? true) middleware.push(shift({ padding }));
			middleware.push(
				size({
					padding,
					apply({ availableWidth, availableHeight, rects }) {
						element.style.setProperty('--oito2-available-width', `${availableWidth}px`);
						element.style.setProperty(
							'--oito2-available-height',
							`${availableHeight}px`
						);
						if (options.sameWidth) element.style.width = `${rects.reference.width}px`;
					}
				})
			);
			if (arrowElement) middleware.push(arrow({ element: arrowElement, padding: 4 }));
			const result = await computePosition(anchor, element, {
				placement: options.placement ?? 'bottom',
				strategy: 'fixed',
				middleware
			});
			element.style.left = `${result.x}px`;
			element.style.top = `${result.y}px`;
			element.dataset.placement = result.placement;
			const arrowData = result.middlewareData.arrow;
			if (arrowElement && arrowData) {
				arrowElement.style.left = arrowData.x == null ? '' : `${arrowData.x}px`;
				arrowElement.style.top = arrowData.y == null ? '' : `${arrowData.y}px`;
			}
			options.onPlacement?.(result.placement);
		};

		return autoUpdate(anchor, element, () => void update());
	};
}
