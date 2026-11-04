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

/** The rules a tags field applies to new tags. */
export interface TagRules {
	/** Whether the same tag can be added twice. */
	allowDuplicates?: boolean;
	/** The largest number of tags; unlimited when unset. */
	maxTags?: number;
	/** Decides whether a trimmed, non-empty tag is accepted. */
	validator?: (tag: string) => boolean;
}

/**
 * Appends the accepted texts of `raw` to `tags`, trimmed, and returns the new list and the
 * refused non-empty texts. A tag is refused when it is empty, repeated (unless
 * `allowDuplicates`), past `maxTags` or rejected by `validator`.
 */
export function addTags(
	tags: readonly string[],
	raw: Iterable<string>,
	rules: TagRules = {}
): { tags: string[]; refused: string[] } {
	const next = [...tags];
	const refused: string[] = [];
	for (const text of raw) {
		const tag = text.trim();
		const accepted =
			tag !== '' &&
			(rules.allowDuplicates || !next.includes(tag)) &&
			(rules.maxTags === undefined || next.length < rules.maxTags) &&
			(rules.validator?.(tag) ?? true);
		if (accepted) next.push(tag);
		else if (tag) refused.push(tag);
	}
	return { tags: next, refused };
}

/**
 * Splits typed or pasted `text` on `delimiters`: returns the complete parts (to add as
 * tags) and the text after the last delimiter (to keep in the input), or `null` when it
 * has no delimiter.
 */
export function splitTags(
	text: string,
	delimiters: readonly string[]
): { parts: string[]; rest: string } | null {
	if (delimiters.length === 0 || !delimiters.some((d) => d && text.includes(d))) return null;
	const pattern = new RegExp(
		delimiters
			.filter(Boolean)
			.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.join('|')
	);
	const pieces = text.split(pattern);
	return { parts: pieces.slice(0, -1), rest: pieces.at(-1) ?? '' };
}
