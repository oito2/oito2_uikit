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

// Copies the parity fixtures exported by oito2_ui (tools/parity/fixtures/*.json) into
// the packages that test against them, byte for byte, and records where they came from
// in tools/parity/source.json.
//
//   node tools/parity/sync.ts [--from <dir>]           copies the fixtures and writes
//                                                       source.json
//   node tools/parity/sync.ts [--from <dir>] --check   copies nothing; exits with an
//                                                       error when a fixture differs
//
// <dir> is a checkout of oito2_ui (default: .references/oito2_ui).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The package that tests against each fixture, by fixture name. */
export const fixtureTargets: Readonly<Record<string, string>> = {
	tokens: 'packages/ui',
	schemes: 'packages/ui',
	foundation: 'packages/ui',
	l10n: 'packages/ui',
	format: 'packages/ui',
	syntax: 'packages/ui-syntax',
	qr: 'packages/ui-extras'
};

/** The folder of oito2_ui that holds the fixtures, relative to its root. */
export const sourceFolder = join('tools', 'parity', 'fixtures');

/** The folder inside a package that holds its fixtures, relative to the package. */
export const targetFolder = join('src', 'fixtures', 'parity');

/** The file that records where the fixtures came from, relative to the repository root. */
export const sourceRecord = join('tools', 'parity', 'source.json');

/** What `syncFixtures` found or did. */
export interface SyncResult {
	/** Fixture paths, relative to the repository root, whose content differs from oito2_ui. */
	readonly changed: string[];
	/** Fixture names exported by oito2_ui that no package tests against. */
	readonly unmapped: string[];
}

/** Returns the commit checked out in `dir`, or `null` when it is not a git checkout. */
export function headCommit(dir: string): string | null {
	try {
		return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim();
	} catch {
		return null;
	}
}

/**
 * Compares every fixture of `from` (an oito2_ui checkout) with its copy under `root`
 * (this repository). Unless `check` is set, it overwrites the copies that differ and
 * writes `source.json` with the commit of `from` and the content of its `manifest.json`.
 * Throws when a fixture listed in `fixtureTargets` is missing from `from`.
 */
export function syncFixtures(options: { from: string; root: string; check?: boolean }): SyncResult {
	const sourceDir = join(options.from, sourceFolder);
	if (!existsSync(sourceDir)) throw new Error(`${sourceDir} does not exist`);
	const exported = readdirSync(sourceDir)
		.filter((file) => file.endsWith('.json') && file !== 'manifest.json')
		.map((file) => file.slice(0, -'.json'.length));
	const unmapped = exported.filter((name) => !(name in fixtureTargets)).sort();
	const changed: string[] = [];
	for (const [name, pkg] of Object.entries(fixtureTargets)) {
		const source = join(sourceDir, `${name}.json`);
		if (!existsSync(source)) throw new Error(`oito2_ui exports no ${name}.json`);
		const target = join(pkg, targetFolder, `${name}.json`);
		const content = readFileSync(source);
		const absolute = join(options.root, target);
		if (existsSync(absolute) && readFileSync(absolute).equals(content)) continue;
		changed.push(target.split('\\').join('/'));
		if (!options.check) writeFileSync(absolute, content);
	}
	if (!options.check) {
		const manifestPath = join(sourceDir, 'manifest.json');
		const record = {
			repository: 'oito2/oito2_ui',
			commit: headCommit(options.from),
			manifest: existsSync(manifestPath)
				? (JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown)
				: null
		};
		writeFileSync(join(options.root, sourceRecord), `${JSON.stringify(record, null, '\t')}\n`);
	}
	return { changed, unmapped };
}

/** Runs the command line described at the top of this file. */
function main(args: string[]): void {
	const root = join(import.meta.dirname, '..', '..');
	const fromIndex = args.indexOf('--from');
	const fromArg = fromIndex === -1 ? undefined : args[fromIndex + 1];
	if (fromIndex !== -1 && fromArg === undefined) {
		console.error('--from needs a folder');
		process.exit(2);
	}
	const from = resolve(fromArg ?? join(root, '.references', 'oito2_ui'));
	const check = args.includes('--check');
	const { changed, unmapped } = syncFixtures({ from, root, check });
	for (const name of unmapped) {
		console.warn(`oito2_ui exports ${name}.json, which no package tests against.`);
	}
	if (check) {
		if (changed.length > 0) {
			for (const path of changed) console.error(`${path} differs from oito2_ui.`);
			console.error('Run `pnpm parity:sync`, port the change and commit the new JSON.');
			process.exit(1);
		}
		console.log('Every parity fixture matches oito2_ui.');
		return;
	}
	for (const path of changed) console.log(`Updated ${path}.`);
	console.log(
		`${changed.length === 0 ? 'Every parity fixture already matched' : 'Synced the parity fixtures with'} oito2_ui at ${headCommit(from) ?? 'an unknown commit'}.`
	);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2));
}
