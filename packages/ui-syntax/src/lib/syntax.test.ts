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

import {
	Contrast,
	createColorTheme,
	minContrastRatio,
	surfacesOfTheme,
	syntaxRoles
} from '@oito2/ui/theme';
import type { ColorTheme } from '@oito2/ui/theme';
import { presetColorTheme, themePresetNames } from '@oito2/ui-themes';
import lua from 'highlight.js/lib/languages/lua';
import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/parity/syntax.json' with { type: 'json' };
import { Highlighter, type SyntaxRun } from './highlighter.js';
import { HighlighterTheme, roleOfScope, scopeRoles } from './highlighter-theme.js';
import { defaultLanguages } from './languages.js';

const dart = `// A comment
@override
class Greeter extends Base {
  final int count = 42;
  String greet(String name) => 'Hello, $name';
  bool get ready => true;
}
`;

const highlighter = new Highlighter();

/** Returns the role of the first run whose text contains `text`. */
function roleOf(runs: readonly SyntaxRun[], text: string) {
	return runs.find((run) => run.text.includes(text))?.role;
}

/** Every color theme the highlighter must read well on: the base schemes and every preset, with and without high contrast. */
function allThemes(): ColorTheme[] {
	const themes: ColorTheme[] = [];
	for (const highContrast of [false, true]) {
		for (const brightness of ['light', 'dark'] as const)
			themes.push(createColorTheme({ brightness, highContrast }));
		for (const preset of themePresetNames)
			themes.push(presetColorTheme(preset, { highContrast }));
	}
	return themes;
}

describe('HighlighterTheme', () => {
	it('maps the same scopes to the same roles as oito2_ui', () => {
		expect(scopeRoles).toEqual(fixture.scopeRoles);
	});

	it('maps every scope to its role color in every scheme', () => {
		for (const theme of allThemes()) {
			const styles = HighlighterTheme.fromPalette(theme.syntax);
			for (const [scope, role] of Object.entries(scopeRoles)) {
				expect(styles[scope]?.color, scope).toBe(theme.syntax[role]);
			}
			expect(styles.comment?.fontStyle).toBe('italic');
			expect(styles.emphasis).toEqual({ fontStyle: 'italic' });
			expect(styles.strong).toEqual({ fontWeight: 700 });
		}
	});

	it('uses every role except plain text, and plain text for unknown scopes', () => {
		expect(new Set(Object.values(scopeRoles))).toEqual(
			new Set(syntaxRoles.filter((role) => role !== 'foreground'))
		);
		expect(roleOfScope('subst')).toBe('foreground');
		expect(roleOfScope(null)).toBe('foreground');
		expect(roleOfScope('toString')).toBe('foreground');
	});

	it('reaches AA contrast for every role on every surface of every scheme', () => {
		for (const theme of allThemes()) {
			const surfaces = surfacesOfTheme(theme);
			for (const role of syntaxRoles) {
				expect(minContrastRatio(theme.syntax[role], surfaces)).toBeGreaterThanOrEqual(
					Contrast.textAA
				);
			}
		}
	});
});

describe('Highlighter', () => {
	it('registers the same languages as oito2_ui', () => {
		expect([...highlighter.languages].sort()).toEqual(fixture.languages);
		expect(Object.keys(defaultLanguages).sort()).toEqual(fixture.languages);
	});

	it('tokenizes the samples like oito2_ui, except the grammar updates of highlight.js 11.12', () => {
		// The highlighter colors each character by the scope that directly holds it, so the
		// samples compare character by character. oito2_ui ports highlight.js 11.9; these
		// tokens changed in the grammars since then.
		const updates = [
			'dart: "greet" was foreground, is function',
			'java: "String" was foreground, is type',
			'java: "void" was keyword, is type',
			'sql: "NULLS " was foreground, is keyword',
			'typescript: "name" was foreground, is attribute'
		];
		const roles = (runs: readonly { text: string; role: string }[]) =>
			runs.flatMap((run) => [...run.text].map(() => run.role));
		const differences: string[] = [];
		for (const sample of fixture.samples) {
			const result = highlighter.highlight(sample.code, { language: sample.language });
			expect(result.runs.map((run) => run.text).join('')).toBe(sample.code);
			const expected = roles(
				sample.runs.map((run) => ({ text: run.text, role: roleOfScope(run.scope) }))
			);
			const actual = roles(result.runs);
			const chars = [...sample.code];
			for (let i = 0; i < chars.length;) {
				if (expected[i] === actual[i]) {
					i++;
					continue;
				}
				let end = i;
				while (end < chars.length && expected[end] !== actual[end]) end++;
				differences.push(
					`${sample.language}: "${chars.slice(i, end).join('')}" was ${expected[i]}, is ${actual[i]}`
				);
				i = end;
			}
		}
		expect(differences).toEqual(updates);
	});

	it('colors Dart tokens with the palette roles', () => {
		const { runs } = highlighter.highlight(dart, { language: 'dart' });
		expect(roleOf(runs, 'A comment')).toBe('comment');
		expect(runs.find((run) => run.text.includes('A comment'))?.italic).toBe(true);
		expect(roleOf(runs, 'class')).toBe('keyword');
		expect(roleOf(runs, 'Greeter')).toBe('function');
		expect(roleOf(runs, '42')).toBe('number');
		expect(roleOf(runs, 'Hello')).toBe('string');
		// The Dart grammar lists true, false and null as keywords.
		expect(roleOf(runs, 'true')).toBe('keyword');
		expect(roleOf(runs, '@override')).toBe('attribute');
	});

	it('colors literals as constants and keeps the code intact', () => {
		const { runs } = highlighter.highlight('ready = True\ncount = 3', { language: 'python' });
		expect(roleOf(runs, 'True')).toBe('constant');
		expect(roleOf(runs, '3')).toBe('number');
		const escaped = highlighter.highlight('a < b && c > "d" \'e\'', { language: 'javascript' });
		expect(escaped.runs.map((run) => run.text).join('')).toBe('a < b && c > "d" \'e\'');
	});

	it('accepts language aliases in any letter case', () => {
		for (const name of ['Dart', 'js', 'ts', 'sh', 'yml', 'py', 'rs', 'HTML']) {
			expect(highlighter.supports(name), name).toBe(true);
			expect(
				highlighter.highlight('x = 1', { language: name }).language,
				name
			).not.toBeNull();
		}
		expect(highlighter.supports('cobol')).toBe(false);
	});

	it('returns plain text for unknown languages and guesses only when asked', () => {
		const plain = highlighter.highlight('x = 1', { language: 'cobol' });
		expect(plain).toEqual({
			language: null,
			runs: [{ text: 'x = 1', scope: null, role: 'foreground', italic: false, bold: false }]
		});
		expect(highlighter.highlight('', {}).runs).toEqual([]);
		expect(highlighter.highlight(dart).language).toBeNull();
		const guessed = highlighter.highlight(dart, { autoDetect: true });
		expect(guessed.language).not.toBeNull();
		expect(guessed.runs.length).toBeGreaterThan(1);
	});

	it('accepts extra languages', () => {
		const custom = new Highlighter({ ...defaultLanguages, lua });
		expect(custom.languages.has('lua')).toBe(true);
		const { runs } = custom.highlight('local x = "hi"', { language: 'lua' });
		expect(roleOf(runs, 'local')).toBe('keyword');
		expect(roleOf(runs, 'hi')).toBe('string');
		expect(Highlighter.instance.supports('lua')).toBe(false);
	});
});
