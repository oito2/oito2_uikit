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

import type { SyntaxPalette, SyntaxRole } from '@oito2/ui/theme';

/**
 * The palette role of every highlight.js scope the highlighter colors, such as `keyword`,
 * `title.function` or `selector-tag`. Scopes not listed render in the foreground color.
 */
export const scopeRoles: Readonly<Record<string, Exclude<SyntaxRole, 'foreground'>>> =
	Object.freeze({
		comment: 'comment',
		quote: 'comment',
		keyword: 'keyword',
		doctag: 'keyword',
		'template-tag': 'keyword',
		bullet: 'keyword',
		string: 'string',
		regexp: 'string',
		regex: 'string',
		character: 'string',
		code: 'string',
		addition: 'string',
		number: 'number',
		title: 'function',
		'title.function': 'function',
		'title.function.invoke': 'function',
		function: 'function',
		'function.dispatch': 'function',
		type: 'type',
		built_in: 'type',
		'title.class': 'type',
		'title.class.inherited': 'type',
		tag: 'tag',
		name: 'tag',
		'selector-tag': 'tag',
		section: 'tag',
		attr: 'attribute',
		attribute: 'attribute',
		property: 'attribute',
		meta: 'attribute',
		'selector-attr': 'attribute',
		'selector-class': 'attribute',
		'selector-id': 'attribute',
		'selector-pseudo': 'attribute',
		'template-variable': 'attribute',
		variable: 'attribute',
		literal: 'constant',
		symbol: 'constant',
		'char.escape': 'constant',
		'variable.constant': 'constant',
		'variable.language': 'constant',
		link: 'constant',
		label: 'constant',
		deletion: 'invalid',
		delete: 'invalid'
	});

/** Returns the palette role of the highlight.js `scope`, or `foreground` for plain text and unlisted scopes. */
export function roleOfScope(scope: string | null | undefined): SyntaxRole {
	return (
		(scope != null && Object.hasOwn(scopeRoles, scope) ? scopeRoles[scope] : undefined) ??
		'foreground'
	);
}

/** The style of a highlight.js scope: its color, and italics or bold. */
export interface ScopeStyle {
	/** The color, as a hex string; absent when the scope keeps the foreground. */
	readonly color?: string;
	/** `italic` for comments and emphasis. */
	readonly fontStyle?: 'italic';
	/** `700` for strong text. */
	readonly fontWeight?: 700;
}

/** Builds highlight.js scope styles from a syntax palette. */
export const HighlighterTheme = {
	/**
	 * Returns the scope styles for `palette`: every scope of `scopeRoles` in its role
	 * color, comments in italics, plus italic `emphasis` and bold `strong` for markup.
	 */
	fromPalette(palette: SyntaxPalette): Readonly<Record<string, ScopeStyle>> {
		const styles: Record<string, ScopeStyle> = {};
		for (const [scope, role] of Object.entries(scopeRoles)) {
			styles[scope] =
				role === 'comment'
					? { color: palette[role], fontStyle: 'italic' }
					: { color: palette[role] };
		}
		styles.emphasis = { fontStyle: 'italic' };
		styles.strong = { fontWeight: 700 };
		return Object.freeze(styles);
	}
} as const;
