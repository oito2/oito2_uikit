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

import { colorToHex, type ColorInput } from '../foundation/color.js';
import { ensureContrastColor } from '../foundation/contrast.js';

/** The token roles of a syntax-highlighted code block, in declaration order. */
export const syntaxRoles = [
	'foreground',
	'comment',
	'keyword',
	'string',
	'number',
	'function',
	'type',
	'tag',
	'attribute',
	'constant',
	'invalid'
] as const;

/**
 * A token role of a code block: plain text, comments, keywords and control flow, string
 * and numeric literals, function and type names, markup tags and attributes (also object
 * properties), constants (booleans, enum values) and invalid code.
 */
export type SyntaxRole = (typeof syntaxRoles)[number];

/** Colors for the token roles of a syntax-highlighted code block, as hex strings. */
export type SyntaxPalette = { readonly [role in SyntaxRole]: string };

/** A syntax palette whose colors can also be `ColorValue`s, as theme families define them. */
export type SyntaxPaletteInput = { readonly [role in SyntaxRole]: ColorInput };

/**
 * Returns a copy of `palette` where every role reaches `target` contrast against every
 * color in `backgrounds`, adjusting only the lightness of the roles that don't.
 */
export function ensureSyntaxContrast(
	palette: SyntaxPaletteInput,
	backgrounds: Iterable<ColorInput>,
	target: number
): SyntaxPalette {
	const list = [...backgrounds];
	const entries = syntaxRoles.map((role) => [
		role,
		colorToHex(ensureContrastColor(palette[role], list, target))
	]);
	return Object.fromEntries(entries) as SyntaxPalette;
}
