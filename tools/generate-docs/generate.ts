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

// Generates the API reference of the @oito2 packages as JSON for the showcase:
// apps/showcase/src/lib/api/api.json.
//
// For each package it reads the public exports of src/lib/index.ts with api.ts. Exports
// whose declaration cannot be found are reported on stderr and make the script exit with
// status 1 after the file is written. With --check nothing is written, and the script
// exits with status 1 when the file on disk differs.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { posixRelative, readPackage, type ApiEntry } from './api.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = join(root, 'apps/showcase/src/lib/api/api.json');

/** The packages documented, by name and folder. */
const packages: [string, string][] = [
	['@oito2/ui', 'packages/ui'],
	['@oito2/ui-syntax', 'packages/ui-syntax'],
	['@oito2/ui-extras', 'packages/ui-extras'],
	['@oito2/ui-files', 'packages/ui-files'],
	['@oito2/ui-window', 'packages/ui-window'],
	['@oito2/ui-settings', 'packages/ui-settings'],
	['@oito2/ui-themes', 'packages/ui-themes']
];

const api: Record<string, Record<string, ApiEntry>> = {};
const unresolved: string[] = [];
for (const [name, folder] of packages) {
	const index = join(root, folder, 'src/lib/index.ts');
	if (existsSync(index)) api[name] = readPackage(index, root, unresolved);
}
const json = `${JSON.stringify({ packages: api }, null, '\t')}\n`;
for (const message of unresolved) console.error(`Warning: no declaration found for ${message}`);

let failed = unresolved.length > 0;
if (process.argv.includes('--check')) {
	const current = existsSync(output) ? readFileSync(output, 'utf8') : '';
	if (current !== json) {
		console.error(`${posixRelative(root, output)} is out of date; run pnpm docs:generate.`);
		failed = true;
	} else console.log('The API reference is up to date.');
} else {
	writeFileSync(output, json);
	console.log(`Wrote ${posixRelative(root, output)}.`);
}
if (failed) {
	if (unresolved.length > 0)
		console.error(
			`${unresolved.length} export(s) could not be resolved; see the warnings above.`
		);
	process.exit(1);
}
