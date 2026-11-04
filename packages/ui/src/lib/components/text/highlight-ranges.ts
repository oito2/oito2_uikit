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

import { foldText, foldTextWithOffsets } from '../../collections/text-folding.js';

/** A range of a string, from `start` (included) to `end` (excluded). */
export interface TextRange {
	readonly start: number;
	readonly end: number;
}

/** The options of `highlightRanges`. */
export interface HighlightOptions {
	/** More queries matched along with the first. */
	queries?: readonly string[];
	/** Whether each word of a query matches on its own; otherwise each query is a phrase. Defaults to true. */
	splitWords?: boolean;
	/** Whether matching ignores case and accents. Defaults to true. */
	ignoreCase?: boolean;
	/** Whether a term matches only whole words. Defaults to false. */
	wholeWords?: boolean;
	/** Whether every occurrence of a term matches, not only the first. Defaults to true. */
	matchAll?: boolean;
}

const wordChar = /[\p{L}\p{N}_]/u;

/**
 * Returns the ranges of `text` that match `query` and the other queries, sorted and merged
 * where they overlap or touch. By default each word matches everywhere, ignoring case and
 * accents ("acao" matches "Ação").
 */
export function highlightRanges(
	text: string,
	query: string,
	options: HighlightOptions = {}
): TextRange[] {
	const {
		queries = [],
		splitWords = true,
		ignoreCase = true,
		wholeWords = false,
		matchAll = true
	} = options;
	let haystack = text;
	let starts: number[];
	if (ignoreCase) ({ folded: haystack, starts } = foldTextWithOffsets(text));
	else starts = Array.from({ length: text.length + 1 }, (_, i) => i);
	const terms: string[] = [];
	for (const raw of [query, ...queries]) {
		const term = ignoreCase ? foldText(raw) : raw;
		terms.push(...(splitWords ? term.split(/\s+/) : [term.trim()]));
	}
	const isWordChar = (index: number) =>
		index >= 0 && index < haystack.length && wordChar.test(haystack.charAt(index));
	const ranges: TextRange[] = [];
	for (const term of terms) {
		if (!term) continue;
		for (let i = haystack.indexOf(term); i >= 0; i = haystack.indexOf(term, i + 1)) {
			const end = i + term.length;
			if (wholeWords && (isWordChar(i - 1) || isWordChar(end))) continue;
			ranges.push({ start: starts[i] ?? 0, end: starts[end] ?? text.length });
			if (!matchAll) break;
		}
	}
	ranges.sort((a, b) => a.start - b.start);
	const merged: TextRange[] = [];
	for (const range of ranges) {
		const last = merged.at(-1);
		if (last && range.start <= last.end)
			merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, range.end) };
		else merged.push(range);
	}
	return merged;
}
