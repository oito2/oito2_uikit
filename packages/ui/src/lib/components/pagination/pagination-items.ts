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

/** The options of `paginationItems`. */
export interface PaginationItemsOptions {
	/** The pages shown on each side of the current one. Defaults to 1. */
	siblingCount?: number;
	/** The pages always shown at each end. Defaults to 1. */
	boundaryCount?: number;
}

/**
 * Returns the page numbers a pagination shows for `page` of `count`, with `null` for an
 * ellipsis. It keeps `boundaryCount` pages at each end and `siblingCount` pages on each
 * side of `page`, and always returns the same number of items for a given `count`, so the
 * buttons don't shift as the page changes. An ellipsis never stands for a single page.
 * Pages count from 1, and a `count` of zero or less gives an empty list.
 */
export function paginationItems(
	page: number,
	count: number,
	options: PaginationItemsOptions = {}
): (number | null)[] {
	const siblingCount = Math.max(0, options.siblingCount ?? 1);
	const boundaryCount = Math.max(0, options.boundaryCount ?? 1);
	if (count <= 0) return [];
	const range = (start: number, end: number) => {
		const pages: number[] = [];
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	};
	const startPages = range(1, Math.min(boundaryCount, count));
	const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
	const siblingsStart = Math.max(
		Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
		boundaryCount + 2
	);
	const siblingsEnd = Math.min(
		Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
		(endPages[0] ?? count + 1) - 2
	);
	const items: (number | null)[] = [...startPages];
	if (siblingsStart > boundaryCount + 2) items.push(null);
	else if (boundaryCount + 1 < count - boundaryCount) items.push(boundaryCount + 1);
	items.push(...range(siblingsStart, siblingsEnd));
	if (siblingsEnd < count - boundaryCount - 1) items.push(null);
	else if (count - boundaryCount > boundaryCount) items.push(count - boundaryCount);
	items.push(...endPages);
	return items;
}
