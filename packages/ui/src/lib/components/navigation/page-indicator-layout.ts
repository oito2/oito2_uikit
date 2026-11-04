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

/** How a `PageIndicator` spaces its dots. */
export type PageIndicatorLayout = 'fixed' | 'stepped' | 'bounded';

/** The measures of a page indicator, in CSS pixels. */
export interface PageIndicatorMetrics {
	/** The number of pages. */
	length: number;
	/** The diameter of a dot. */
	dotSize: number;
	/** The requested space between dots. */
	spacing: number;
	/** How the dots are spaced. */
	layout: PageIndicatorLayout;
	/** Whether the dots are buttons. */
	interactive: boolean;
	/** The smallest width and height of an interactive dot's target. */
	minTargetSize: number;
	/** The width available to the indicator. */
	availableWidth: number;
}

/** The resolved geometry of a page indicator. */
export interface PageIndicatorGeometry {
	/** The width of the current page's pill. */
	selectedWidth: number;
	/** The width of the box around a dot, which takes the pointer. */
	dotBox: number;
	/** The width of the box around the current page's pill. */
	selectedBox: number;
	/** The height of every box. */
	boxHeight: number;
	/** The gap between boxes. */
	gap: number;
	/** Whether the dots fit the available width; otherwise the indicator shows text. */
	fits: boolean;
}

/**
 * Returns the geometry of a page indicator. The current page is a pill three dots wide.
 * Interactive dots sit in boxes at least `minTargetSize` wide, which the spacing absorbs
 * as far as it can. `stepped` uses the full spacing up to 5 pages, three quarters up to
 * 10 and half beyond; `bounded` uses the full spacing when it fits, otherwise as little
 * as needed to fit the width, down to half a dot.
 */
export function pageIndicatorGeometry(metrics: PageIndicatorMetrics): PageIndicatorGeometry {
	const { length, dotSize, layout, interactive, minTargetSize, availableWidth } = metrics;
	const selectedWidth = dotSize * 3;
	const box = (width: number) => (interactive ? Math.max(width, minTargetSize) : width);
	const dotBox = box(dotSize);
	const selectedBox = box(selectedWidth);
	const boxes = selectedBox + (length - 1) * dotBox;
	const absorbed = dotBox - dotSize;
	const gaps = Math.max(1, length - 1);
	let spacing = metrics.spacing;
	if (layout === 'stepped') {
		spacing = length <= 5 ? spacing : length <= 10 ? spacing * 0.75 : spacing * 0.5;
	} else if (layout === 'bounded') {
		spacing = Math.max(
			dotSize / 2,
			Math.min(spacing, (availableWidth - boxes) / gaps + absorbed)
		);
	}
	const gap = Math.max(0, spacing - absorbed);
	return {
		selectedWidth,
		dotBox,
		selectedBox,
		boxHeight: Math.max(interactive ? minTargetSize : 0, dotSize),
		gap,
		fits: availableWidth >= boxes + (length - 1) * gap
	};
}
