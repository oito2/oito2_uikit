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

// Checks that every hand-written source file starts with the license notice of
// tools/templates: header.txt for .ts, .js, .rs and .dart, header.css.txt for .css,
// header.html.txt for .svelte and .html, header.sharp.txt for .yaml, .yml, .toml and .sh.
// Lines are compared after trimming trailing whitespace. Lists the files without the
// notice and exits with status 1 when there is any.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const templates = join(root, 'tools', 'templates');

/** The template of each checked file extension. */
const templateOf: Record<string, string> = {
	'.ts': 'header.txt',
	'.js': 'header.txt',
	'.rs': 'header.txt',
	'.dart': 'header.txt',
	'.css': 'header.css.txt',
	'.svelte': 'header.html.txt',
	'.html': 'header.html.txt',
	'.yaml': 'header.sharp.txt',
	'.yml': 'header.sharp.txt',
	'.toml': 'header.sharp.txt',
	'.sh': 'header.sharp.txt'
};

/** The folders walked, relative to the repository root, with the extensions checked in each. */
const scopes: { dir: string; extensions?: string[] }[] = [
	{ dir: 'packages/ui/src' },
	{ dir: 'packages/ui-syntax/src' },
	{ dir: 'packages/ui-extras/src' },
	{ dir: 'packages/ui-files/src' },
	{ dir: 'packages/ui-window/src' },
	{ dir: 'packages/ui-settings/src' },
	{ dir: 'packages/ui-themes/src' },
	{ dir: 'apps/showcase/src' },
	{ dir: 'apps/showcase/smoke' },
	{ dir: 'apps/showcase/tests' },
	{ dir: 'tools', extensions: ['.ts'] },
	{ dir: 'plugins/tauri-plugin-oito2-window/src', extensions: ['.rs'] },
	{ dir: 'plugins/tauri-plugin-oito2-settings/src', extensions: ['.rs'] },
	{ dir: 'apps/showcase/src-tauri/src', extensions: ['.rs'] },
	{ dir: 'tools/parity/lib', extensions: ['.dart'] },
	{ dir: 'tools/parity/test', extensions: ['.dart'] }
];

/** Folder names never walked. */
const skippedDirs = new Set([
	'node_modules',
	'dist',
	'build',
	'.svelte-kit',
	'__screenshots__',
	'fixtures',
	'target'
]);

/** Files without a notice: generated, or a document without a comment of its own. */
const skippedFiles = new Set([
	'apps/showcase/src/app.html',
	'packages/ui/src/lib/styles/tokens.css',
	'packages/ui/src/lib/styles/schemes.css',
	'packages/ui-themes/src/lib/presets.css'
]);

/** Returns the lines of `text` without trailing whitespace, dropping the trailing empty lines. */
function lines(text: string): string[] {
	const all = text.split('\n').map((line) => line.trimEnd());
	while (all.length > 0 && all.at(-1) === '') all.pop();
	return all;
}

const headers = new Map<string, string[]>();
for (const name of new Set(Object.values(templateOf)))
	headers.set(name, lines(readFileSync(join(templates, name), 'utf8')));

/** Returns the files under `dir` whose extension is checked, skipping the folders never walked. */
function walk(dir: string, extensions: string[] | undefined, found: string[]): string[] {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return found;
	}
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!skippedDirs.has(entry.name)) walk(path, extensions, found);
			continue;
		}
		if (!entry.isFile()) continue;
		const extension = extname(entry.name);
		if (!(extension in templateOf)) continue;
		if (extensions && !extensions.includes(extension)) continue;
		found.push(path);
	}
	return found;
}

/** Returns whether the file at `path` starts with the notice of its template. */
function hasHeader(path: string): boolean {
	const expected = headers.get(templateOf[extname(path)] ?? '') ?? [];
	const actual = lines(readFileSync(path, 'utf8')).slice(0, expected.length);
	return expected.every((line, index) => actual[index] === line);
}

const files = new Set<string>();
for (const scope of scopes) {
	const dir = join(root, scope.dir);
	if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) continue;
	for (const file of walk(dir, scope.extensions, [])) files.add(file);
}

const missing: string[] = [];
let checked = 0;
for (const file of [...files].sort()) {
	const path = relative(root, file).split(sep).join('/');
	if (skippedFiles.has(path)) continue;
	checked += 1;
	if (!hasHeader(file)) missing.push(path);
}

if (missing.length > 0) {
	console.error(`${missing.length} file(s) do not start with the license notice:`);
	for (const path of missing) console.error(`  ${path}`);
	process.exit(1);
}
console.log(`Every one of the ${checked} source files starts with the license notice.`);
