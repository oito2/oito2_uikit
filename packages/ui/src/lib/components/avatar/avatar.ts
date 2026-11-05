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

import { colorToHex } from '../../foundation/color.js';
import { foregroundColorFor } from '../../foundation/contrast.js';
import type { Localizations } from '../../l10n/localizations.js';
import { accentColors } from '../../tokens/values.js';

/** A presence status shown as a dot on an `Avatar`. */
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

/** The outline of an `Avatar`: a circle or a rounded square. */
export type AvatarShape = 'circle' | 'square';

/** Returns the first user-perceived character of `word`, keeping accents and emoji sequences whole. */
function firstGrapheme(word: string): string {
	const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
	for (const { segment } of segments) return segment;
	return '';
}

/**
 * Returns the initials of `name`: the first letters of its first and last words, in upper
 * case, or an empty string when `name` is blank. A letter is a whole user-perceived
 * character, so decomposed accents and emoji sequences stay intact.
 */
export function initials(name: string): string {
	const words = name
		.trim()
		.split(/\s+/)
		.filter((word) => word !== '');
	const first = words[0];
	if (first === undefined) return '';
	const last = words.length > 1 ? words[words.length - 1] : undefined;
	return (firstGrapheme(first) + (last === undefined ? '' : firstGrapheme(last))).toUpperCase();
}

/**
 * Returns the accent color an avatar without a picture uses for `name`, picked by a stable
 * hash of its UTF-16 code units, or `null` when `name` is blank.
 */
export function avatarColor(name: string | null | undefined): string | null {
	if (!name || name.trim() === '') return null;
	const accents = Object.values(accentColors);
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
	return accents[hash % accents.length] ?? null;
}

/** Returns black or white as a hex color, whichever contrasts more with `background`. */
export function avatarForeground(background: string): string {
	return colorToHex(foregroundColorFor(background));
}

/** Returns the localized name of `status`. */
export function avatarStatusLabel(status: AvatarStatus, strings: Localizations): string {
	switch (status) {
		case 'online':
			return strings.statusOnline;
		case 'away':
			return strings.statusAway;
		case 'busy':
			return strings.statusBusy;
		case 'offline':
			return strings.statusOffline;
	}
}
