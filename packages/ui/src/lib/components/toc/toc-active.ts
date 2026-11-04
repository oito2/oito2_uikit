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

/** A section listed by a `TableOfContents`. */
export interface TocEntry {
	/** The section name. */
	readonly title: string;
	/** The id of the section heading. */
	readonly id: string;
	/** The nesting level, from 0; each level indents the entry further. */
	readonly depth?: number;
}

/** The inputs of `tocActiveIndex`. */
export interface TocMeasure {
	/**
	 * The distance from the top of the viewport to each section heading, in pixels, in
	 * document order; `null` for a heading that isn't in the document.
	 */
	headings: readonly (number | null)[];
	/** How far below the top of the viewport a heading makes its section current. */
	activationOffset: number;
	/** Whether the view is scrolled to the end. */
	atEnd: boolean;
	/** The current section before this measure. */
	previous: number;
}

/**
 * Returns the current section of a table of contents: the last section whose heading has
 * reached `activationOffset` below the top of the viewport, or the last section at the
 * end of the view. Without a heading above that line, the section before the first one
 * below it is current; without any measured heading, the previous section stays.
 */
export function tocActiveIndex(measure: TocMeasure): number {
	const { headings, activationOffset, atEnd, previous } = measure;
	if (headings.length === 0) return -1;
	if (atEnd) return headings.length - 1;
	let active = -1;
	let firstBelow = -1;
	headings.forEach((top, index) => {
		if (top === null) return;
		if (top <= activationOffset) active = index;
		else if (firstBelow < 0) firstBelow = index;
	});
	if (active >= 0) return active;
	return firstBelow < 0 ? previous : Math.max(firstBelow - 1, 0);
}
