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

import hljs from 'highlight.js/lib/core';
import type { HLJSApi, Language, LanguageFn } from 'highlight.js';
import type { SyntaxRole } from '@oito2/ui/theme';
import { roleOfScope } from './highlighter-theme.js';
import { defaultLanguages } from './languages.js';

/** A run of highlighted code: text that shares one token scope and role. */
export interface SyntaxRun {
	/** The code text. */
	readonly text: string;
	/** The highlight.js scope of the token that directly holds the text, or `null` for plain text. */
	readonly scope: string | null;
	/** The palette role that colors the text. */
	readonly role: SyntaxRole;
	/** Whether the text is in italics: comments and emphasis. */
	readonly italic: boolean;
	/** Whether the text is bold: strong markup. */
	readonly bold: boolean;
}

/** Code split into colored runs by a `Highlighter`. */
export interface HighlightedCode {
	/** The registered name of the language used, such as `typescript` for `ts`, or `null` when the code stayed plain text. */
	readonly language: string | null;
	/** The runs, which joined give back the code. */
	readonly runs: readonly SyntaxRun[];
}

/** The options of `Highlighter.highlight`. */
export interface HighlightOptions {
	/** The language name or alias, such as `ts` or `yml`, in any letter case. */
	language?: string | null;
	/** Whether a missing `language` is guessed among the registered ones. Defaults to false. */
	autoDetect?: boolean;
}

const entities: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#x27;': "'",
	'&#39;': "'"
};

/** Returns `text` with the HTML entities highlight.js escapes turned back into characters. */
function unescape(text: string): string {
	return text.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => entities[entity] ?? entity);
}

/**
 * Returns the highlight.js scope of a token from the classes of its HTML span: `hljs-title
 * function_` is `title.function`. A sub-language span, such as `language-css`, has none.
 */
function scopeOfClasses(classes: string): string | null {
	const [first, ...rest] = classes.trim().split(/\s+/);
	if (!first?.startsWith('hljs-')) return null;
	return [first.slice(5), ...rest.map((part) => part.replace(/_+$/, ''))].join('.');
}

/**
 * Splits the HTML highlight.js renders into runs, each colored by the scope of the token
 * that directly holds it, as oito2_ui colors them: text in an unlisted scope keeps the
 * foreground even inside a colored token.
 */
function runsOfHtml(html: string): SyntaxRun[] {
	const runs: SyntaxRun[] = [];
	const scopes: (string | null)[] = [];
	const tag = /<span class="([^"]*)">|<\/span>/g;
	let position = 0;
	const add = (text: string) => {
		if (text === '') return;
		const scope = scopes.at(-1) ?? null;
		const run: SyntaxRun = {
			text: unescape(text),
			scope,
			role: roleOfScope(scope),
			italic: scope === 'comment' || scope === 'quote' || scope === 'emphasis',
			bold: scope === 'strong'
		};
		const last = runs.at(-1);
		if (last && last.scope === run.scope)
			runs[runs.length - 1] = { ...last, text: last.text + run.text };
		else runs.push(run);
	};
	for (let match = tag.exec(html); match; match = tag.exec(html)) {
		add(html.slice(position, match.index));
		if (match[1] === undefined) scopes.pop();
		else scopes.push(scopeOfClasses(match[1]));
		position = tag.lastIndex;
	}
	add(html.slice(position));
	return runs;
}

/**
 * Splits source code into runs colored with the roles of a syntax palette, through
 * highlight.js grammars. Tokenizing runs synchronously in JavaScript, with no native code.
 *
 * ```ts
 * const { runs } = Highlighter.instance.highlight('let x = 1', { language: 'ts' });
 * ```
 */
export class Highlighter {
	/** A shared highlighter with the default languages. */
	static readonly instance = new Highlighter();

	/** The names of the registered languages. */
	readonly languages: ReadonlySet<string>;

	readonly #hljs: HLJSApi;
	readonly #names = new Map<Language, string>();

	/** Creates a highlighter that knows `languages`, by default `defaultLanguages`. */
	constructor(languages: Readonly<Record<string, LanguageFn>> = defaultLanguages) {
		this.#hljs = hljs.newInstance();
		this.#hljs.configure({ classPrefix: 'hljs-' });
		for (const [name, grammar] of Object.entries(languages))
			this.#hljs.registerLanguage(name, grammar);
		for (const name of Object.keys(languages)) {
			const language = this.#hljs.getLanguage(name);
			if (language && !this.#names.has(language)) this.#names.set(language, name);
		}
		this.languages = new Set(Object.keys(languages));
	}

	/** Whether `language` is registered, by name or by one of its aliases (such as `js` or `yml`), in any letter case. */
	supports(language: string): boolean {
		return this.#hljs.getLanguage(language.toLowerCase()) !== undefined;
	}

	/** Returns the registered name of the language `alias` points to, such as `typescript` for `ts`. */
	#nameOf(alias: string): string {
		const language = this.#hljs.getLanguage(alias);
		return (language && this.#names.get(language)) ?? alias;
	}

	/**
	 * Returns `code` split into runs. When `language` isn't registered, or is missing and
	 * `autoDetect` is off, the code comes back as one plain run.
	 */
	highlight(code: string, options: HighlightOptions = {}): HighlightedCode {
		const { language, autoDetect = false } = options;
		if (language != null && this.supports(language)) {
			const name = language.toLowerCase();
			const result = this.#hljs.highlight(code, { language: name, ignoreIllegals: true });
			return { language: this.#nameOf(name), runs: runsOfHtml(result.value) };
		}
		if (language == null && autoDetect) {
			const result = this.#hljs.highlightAuto(code);
			if (result.language)
				return { language: this.#nameOf(result.language), runs: runsOfHtml(result.value) };
		}
		return {
			language: null,
			runs:
				code === ''
					? []
					: [{ text: code, scope: null, role: 'foreground', italic: false, bold: false }]
		};
	}
}
