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

import bashLanguage from 'highlight.js/lib/languages/bash';
import cLanguage from 'highlight.js/lib/languages/c';
import cppLanguage from 'highlight.js/lib/languages/cpp';
import csharpLanguage from 'highlight.js/lib/languages/csharp';
import cssLanguage from 'highlight.js/lib/languages/css';
import dartLanguage from 'highlight.js/lib/languages/dart';
import diffLanguage from 'highlight.js/lib/languages/diff';
import dockerfileLanguage from 'highlight.js/lib/languages/dockerfile';
import goLanguage from 'highlight.js/lib/languages/go';
import iniLanguage from 'highlight.js/lib/languages/ini';
import javaLanguage from 'highlight.js/lib/languages/java';
import javascriptLanguage from 'highlight.js/lib/languages/javascript';
import jsonLanguage from 'highlight.js/lib/languages/json';
import kotlinLanguage from 'highlight.js/lib/languages/kotlin';
import markdownLanguage from 'highlight.js/lib/languages/markdown';
import phpLanguage from 'highlight.js/lib/languages/php';
import plaintextLanguage from 'highlight.js/lib/languages/plaintext';
import pythonLanguage from 'highlight.js/lib/languages/python';
import rustLanguage from 'highlight.js/lib/languages/rust';
import scssLanguage from 'highlight.js/lib/languages/scss';
import shellLanguage from 'highlight.js/lib/languages/shell';
import sqlLanguage from 'highlight.js/lib/languages/sql';
import swiftLanguage from 'highlight.js/lib/languages/swift';
import typescriptLanguage from 'highlight.js/lib/languages/typescript';
import xmlLanguage from 'highlight.js/lib/languages/xml';
import yamlLanguage from 'highlight.js/lib/languages/yaml';
import type { LanguageFn } from 'highlight.js';

/**
 * The languages a `Highlighter` registers by default, keyed by name: the same 27 as
 * oito2_ui. highlight.js ships about 190 more grammars under
 * `highlight.js/lib/languages/`; pass them to a `Highlighter` to add them. Only the
 * grammars imported end up in the app.
 */
export const defaultLanguages: Readonly<Record<string, LanguageFn>> = Object.freeze({
	bash: bashLanguage,
	c: cLanguage,
	cpp: cppLanguage,
	csharp: csharpLanguage,
	css: cssLanguage,
	dart: dartLanguage,
	diff: diffLanguage,
	dockerfile: dockerfileLanguage,
	go: goLanguage,
	html: xmlLanguage,
	ini: iniLanguage,
	java: javaLanguage,
	javascript: javascriptLanguage,
	json: jsonLanguage,
	kotlin: kotlinLanguage,
	markdown: markdownLanguage,
	php: phpLanguage,
	plaintext: plaintextLanguage,
	python: pythonLanguage,
	rust: rustLanguage,
	scss: scssLanguage,
	shell: shellLanguage,
	sql: sqlLanguage,
	swift: swiftLanguage,
	typescript: typescriptLanguage,
	xml: xmlLanguage,
	yaml: yamlLanguage
});
