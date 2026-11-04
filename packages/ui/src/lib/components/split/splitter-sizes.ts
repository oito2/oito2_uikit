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

/** The limits of one pane of a splitter. */
export interface SplitterPaneLimits {
	/** The share of the space at start, from 0 to 1; panes without one share the rest. */
	readonly initialFraction?: number;
	/** The smallest size, in pixels. */
	readonly minSize: number;
	/** The largest size, in pixels. */
	readonly maxSize: number;
	/** Whether the pane can collapse. */
	readonly collapsible: boolean;
	/** The size of the collapsed pane, in pixels. */
	readonly collapsedSize: number;
}

/** The sizes and collapsed flags of a splitter's panes. */
export interface SplitterLayout {
	/** The pane sizes, in pixels. */
	sizes: number[];
	/** Whether each pane is collapsed. */
	collapsed: boolean[];
	/** The size each collapsed pane goes back to when restored. */
	restore: (number | undefined)[];
	/** The space the sizes fill. */
	available: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** The smallest size of pane `i`: its collapsed size while collapsed. */
export function paneMin(panes: readonly SplitterPaneLimits[], layout: SplitterLayout, i: number) {
	const pane = panes[i];
	if (!pane) return 0;
	return layout.collapsed[i] ? pane.collapsedSize : pane.minSize;
}

/** The largest size of pane `i`: its collapsed size while collapsed. */
export function paneMax(panes: readonly SplitterPaneLimits[], layout: SplitterLayout, i: number) {
	const pane = panes[i];
	if (!pane) return 0;
	return layout.collapsed[i] ? pane.collapsedSize : pane.maxSize;
}

/** Clamps every pane to its limits and gives the difference to the panes that can take it. */
function balance(panes: readonly SplitterPaneLimits[], layout: SplitterLayout): void {
	const { sizes } = layout;
	for (let i = 0; i < sizes.length; i++)
		sizes[i] = clamp(sizes[i] ?? 0, paneMin(panes, layout, i), paneMax(panes, layout, i));
	let excess = layout.available - sizes.reduce((a, b) => a + b, 0);
	for (let pass = 0; pass < 2 && Math.abs(excess) > 0.01; pass++) {
		for (let i = sizes.length - 1; i >= 0 && Math.abs(excess) > 0.01; i--) {
			const size = sizes[i] ?? 0;
			const next = clamp(size + excess, paneMin(panes, layout, i), paneMax(panes, layout, i));
			excess -= next - size;
			sizes[i] = next;
		}
	}
}

/**
 * Lays the panes out in `available` pixels: keeping the proportions of `previous` when
 * it has as many panes, or else from the initial fractions, with collapsed panes at their
 * collapsed size and every pane within its limits.
 */
export function fitSplitter(
	panes: readonly SplitterPaneLimits[],
	available: number,
	previous: SplitterLayout
): SplitterLayout {
	const layout: SplitterLayout = {
		sizes: [],
		collapsed: [...previous.collapsed],
		restore: [...previous.restore],
		available
	};
	if (previous.sizes.length === panes.length && previous.available > 0) {
		const scale = available / previous.available;
		layout.sizes = previous.sizes.map((size) => size * scale);
	} else {
		const used = panes.reduce((sum, pane) => sum + (pane.initialFraction ?? 0), 0);
		const open = panes.filter((pane) => pane.initialFraction === undefined).length;
		const share = open === 0 ? 0 : clamp(1 - used, 0, 1) / open;
		layout.sizes = panes.map((pane) => (pane.initialFraction ?? share) * available);
	}
	panes.forEach((pane, i) => {
		if (layout.collapsed[i]) layout.sizes[i] = pane.collapsedSize;
	});
	balance(panes, layout);
	return layout;
}

/**
 * Moves the divider after pane `i` by `delta` pixels toward the end, keeping both of its
 * panes within their limits. Returns the new layout, or `null` when nothing moves.
 */
export function moveDivider(
	panes: readonly SplitterPaneLimits[],
	layout: SplitterLayout,
	i: number,
	delta: number
): SplitterLayout | null {
	const a = layout.sizes[i];
	const b = layout.sizes[i + 1];
	if (a === undefined || b === undefined) return null;
	const total = a + b;
	let next = clamp(a + delta, paneMin(panes, layout, i), paneMax(panes, layout, i));
	next = clamp(
		next,
		total - paneMax(panes, layout, i + 1),
		total - paneMin(panes, layout, i + 1)
	);
	if (next < paneMin(panes, layout, i) || next > paneMax(panes, layout, i) || next === a)
		return null;
	const sizes = [...layout.sizes];
	sizes[i] = next;
	sizes[i + 1] = total - next;
	return { ...layout, sizes };
}

/**
 * Collapses or restores the collapsible pane next to divider `i`, preferring the one
 * before it; the neighbor takes or gives the difference. Returns `null` when neither
 * pane is collapsible.
 */
export function toggleDivider(
	panes: readonly SplitterPaneLimits[],
	layout: SplitterLayout,
	i: number
): SplitterLayout | null {
	const target = panes[i]?.collapsible ? i : panes[i + 1]?.collapsible ? i + 1 : undefined;
	const pane = target === undefined ? undefined : panes[target];
	if (target === undefined || !pane) return null;
	const neighbor = target === i ? i + 1 : i;
	const next: SplitterLayout = {
		sizes: [...layout.sizes],
		collapsed: [...layout.collapsed],
		restore: [...layout.restore],
		available: layout.available
	};
	const size = next.sizes[target] ?? 0;
	if (next.collapsed[target]) {
		next.collapsed[target] = false;
		const restore = next.restore[target] ?? pane.minSize;
		next.sizes[target] = restore;
		next.sizes[neighbor] = (next.sizes[neighbor] ?? 0) - (restore - size);
	} else {
		next.restore[target] = size;
		next.collapsed[target] = true;
		next.sizes[target] = pane.collapsedSize;
		next.sizes[neighbor] = (next.sizes[neighbor] ?? 0) + (size - pane.collapsedSize);
	}
	balance(panes, next);
	return next;
}
