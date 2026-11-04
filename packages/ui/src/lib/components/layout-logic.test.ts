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

import { describe, expect, it } from 'vitest';
import { Contrast } from '../foundation/contrast.js';
import { createColorTheme } from '../theme/color-theme.js';
import { infoColors, infoTypes } from '../theme/css.js';
import { navigationLayout } from './navigation/navigation-state.svelte.js';
import { PageController } from './navigation/page-controller.svelte.js';
import { pageIndicatorGeometry } from './navigation/page-indicator-layout.js';
import { paginationItems } from './pagination/pagination-items.js';
import { fitSplitter, moveDivider, toggleDivider } from './split/splitter-sizes.js';
import { stepState } from './steps/steps-state.svelte.js';
import { tocActiveIndex } from './toc/toc-active.js';

describe('paginationItems', () => {
	it('matches the Dart cases', () => {
		expect(paginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
		expect(paginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, null, 10]);
		expect(paginationItems(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
		expect(paginationItems(10, 10)).toEqual([1, null, 6, 7, 8, 9, 10]);
		expect(paginationItems(4, 10)).toEqual([1, 2, 3, 4, 5, null, 10]);
		expect(paginationItems(1, 1)).toEqual([1]);
		expect(paginationItems(1, 0)).toEqual([]);
	});

	it('keeps the same number of items on every page', () => {
		const lengths = new Set(
			Array.from({ length: 20 }, (_, i) => paginationItems(i + 1, 20).length)
		);
		expect(lengths.size).toBe(1);
	});
});

describe('pageIndicatorGeometry', () => {
	const base = {
		length: 5,
		dotSize: 8,
		spacing: 8,
		layout: 'fixed' as const,
		interactive: false,
		minTargetSize: 24,
		availableWidth: 1000
	};

	it('makes the current page a pill three dots wide', () => {
		const geometry = pageIndicatorGeometry(base);
		expect(geometry.selectedWidth).toBe(24);
		expect(geometry.gap).toBe(8);
		expect(geometry.fits).toBe(true);
	});

	it('lets interactive targets absorb the spacing', () => {
		const geometry = pageIndicatorGeometry({ ...base, interactive: true });
		expect(geometry.dotBox).toBe(24);
		expect(geometry.gap).toBe(0);
		expect(geometry.boxHeight).toBe(24);
	});

	it('steps the spacing down with more pages', () => {
		expect(pageIndicatorGeometry({ ...base, layout: 'stepped', length: 8 }).gap).toBe(6);
		expect(pageIndicatorGeometry({ ...base, layout: 'stepped', length: 12 }).gap).toBe(4);
	});

	it('bounds the spacing by the width and falls back to text', () => {
		const tight = pageIndicatorGeometry({ ...base, layout: 'bounded', availableWidth: 80 });
		expect(tight.gap).toBe(6);
		expect(tight.fits).toBe(true);
		expect(pageIndicatorGeometry({ ...base, availableWidth: 40 }).fits).toBe(false);
	});
});

describe('navigationLayout', () => {
	const options = { width: 800, touch: false, compactBreakpoint: 600 };

	it('picks the rail style by width', () => {
		expect(navigationLayout({ ...options, width: 500 })).toEqual({
			kind: 'rail',
			style: 'compact'
		});
		expect(navigationLayout(options)).toEqual({ kind: 'rail', style: 'labelled' });
		expect(navigationLayout({ ...options, extendedBreakpoint: 800 })).toEqual({
			kind: 'rail',
			style: 'labelledExtended'
		});
	});

	it('uses a bottom bar for narrow touch layouts unless a rail style is forced', () => {
		expect(navigationLayout({ ...options, width: 500, touch: true })).toEqual({ kind: 'bar' });
		expect(
			navigationLayout({ ...options, width: 500, touch: true, railStyle: 'labelled' })
		).toEqual({ kind: 'rail', style: 'labelled' });
	});
});

describe('PageController', () => {
	it('clears the selection when the length shrinks below it', () => {
		const controller = new PageController(5, 3);
		expect(controller.hasSelection).toBe(true);
		controller.length = 3;
		expect(controller.index).toBe(-1);
		expect(() => (controller.index = 3)).toThrow(RangeError);
		expect(() => new PageController(-1)).toThrow(RangeError);
	});
});

describe('stepState', () => {
	it('puts an error first, then the position', () => {
		expect(stepState(0, 1, false)).toBe('completed');
		expect(stepState(1, 1, false)).toBe('current');
		expect(stepState(2, 1, false)).toBe('upcoming');
		expect(stepState(0, 1, true)).toBe('error');
	});
});

describe('tocActiveIndex', () => {
	const measure = { activationOffset: 32, atEnd: false, previous: 0 };

	it('takes the last heading above the activation line', () => {
		expect(tocActiveIndex({ ...measure, headings: [-200, 10, 300] })).toBe(1);
	});

	it('takes the section before the first heading below the line', () => {
		expect(tocActiveIndex({ ...measure, headings: [null, 100, 400] })).toBe(0);
		expect(tocActiveIndex({ ...measure, headings: [null, null, 400] })).toBe(1);
	});

	it('takes the last section at the end and keeps the previous one without headings', () => {
		expect(tocActiveIndex({ ...measure, headings: [-200, 10, 300], atEnd: true })).toBe(2);
		expect(tocActiveIndex({ ...measure, headings: [null, null], previous: 1 })).toBe(1);
	});
});

describe('splitter sizes', () => {
	const pane = { minSize: 48, maxSize: Infinity, collapsible: false, collapsedSize: 0 };
	const empty = { sizes: [], collapsed: [false, false, false], restore: [], available: 0 };

	it('shares the space by the initial fractions', () => {
		const layout = fitSplitter([{ ...pane, initialFraction: 0.5 }, pane, pane], 400, empty);
		expect(layout.sizes).toEqual([200, 100, 100]);
	});

	it('keeps the proportions when the space changes', () => {
		const panes = [pane, pane];
		const first = fitSplitter(panes, 400, { ...empty, collapsed: [false, false] });
		const moved = moveDivider(panes, first, 0, 100);
		expect(moved?.sizes).toEqual([300, 100]);
		expect(fitSplitter(panes, 200, moved!).sizes).toEqual([150, 50]);
	});

	it('keeps both panes of a divider within their limits', () => {
		const panes = [pane, pane];
		const layout = fitSplitter(panes, 400, { ...empty, collapsed: [false, false] });
		expect(moveDivider(panes, layout, 0, 1000)?.sizes).toEqual([352, 48]);
	});

	it('collapses and restores a collapsible pane', () => {
		const panes = [{ ...pane, collapsible: true }, pane];
		const layout = fitSplitter(panes, 400, { ...empty, collapsed: [false, false] });
		const collapsed = toggleDivider(panes, layout, 0);
		expect(collapsed?.sizes).toEqual([0, 400]);
		expect(collapsed?.collapsed).toEqual([true, false]);
		expect(toggleDivider(panes, collapsed!, 0)?.sizes).toEqual([200, 200]);
		expect(toggleDivider([pane, pane], layout, 0)).toBeNull();
	});
});

describe('infoColors', () => {
	it('gives every kind readable text on its box and badge', () => {
		for (const brightness of ['light', 'dark'] as const) {
			const colors = infoColors(createColorTheme({ brightness }));
			for (const type of infoTypes) {
				const { box, boxText, badge, badgeText } = colors[type];
				expect(Contrast.ratio(boxText, box)).toBeGreaterThanOrEqual(Contrast.textAA);
				expect(Contrast.ratio(badgeText, badge)).toBeGreaterThanOrEqual(Contrast.textAA);
			}
		}
	});
});
