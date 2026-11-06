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

// Keeps every version of the repository equal to the version Changesets gave the
// npm packages (one fixed version, read from @oito2/ui).
//
//   node tools/release/sync-versions.ts             writes the version into the Cargo
//                                                    workspace, Cargo.lock, the showcase
//                                                    package.json and tauri.conf.json
//   node tools/release/sync-versions.ts --check v1.2.3
//                                                    exits with an error unless every
//                                                    version equals the given tag

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const cargoToml = join(root, 'Cargo.toml');
const tauriConf = join(root, 'apps', 'showcase', 'src-tauri', 'tauri.conf.json');
const showcasePackage = join(root, 'apps', 'showcase', 'package.json');
const workspaceVersion = /(\[workspace\.package\]\s*\nversion = ")([^"]+)(")/;

/** Reads a JSON file. */
function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

/** Writes a JSON file with tabs and a final newline, like the repository's Prettier setup. */
function writeJson(path: string, value: Record<string, unknown>): void {
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`);
}

/** Returns name and version of every package under packages/ that is published to npm. */
function publicPackages(): { name: string; version: string }[] {
	const dir = join(root, 'packages');
	return readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => readJson(join(dir, entry.name, 'package.json')))
		.filter((pkg) => pkg.private !== true)
		.map((pkg) => ({ name: String(pkg.name), version: String(pkg.version) }));
}

/** Returns the version in [workspace.package] of the root Cargo.toml. */
function cargoVersion(): string {
	const match = workspaceVersion.exec(readFileSync(cargoToml, 'utf8'));
	if (!match) throw new Error('Cargo.toml has no [workspace.package] version');
	return match[2];
}

/** Lists every place that holds a version, with the version it holds. */
function allVersions(): { source: string; version: string }[] {
	return [
		...publicPackages().map((pkg) => ({ source: pkg.name, version: pkg.version })),
		{ source: 'Cargo.toml [workspace.package]', version: cargoVersion() },
		{
			source: 'apps/showcase/package.json',
			version: String(readJson(showcasePackage).version)
		},
		{
			source: 'apps/showcase/src-tauri/tauri.conf.json',
			version: String(readJson(tauriConf).version)
		}
	];
}

const args = process.argv.slice(2);

if (args[0] === '--check') {
	const tag = args[1] ?? '';
	const expected = tag.replace(/^v/, '');
	if (!/^\d+\.\d+\.\d+$/.test(expected)) {
		console.error(`"${tag}" is not a vX.Y.Z tag`);
		process.exit(1);
	}
	const wrong = allVersions().filter((entry) => entry.version !== expected);
	for (const entry of wrong)
		console.error(`${entry.source} is ${entry.version}, the tag is ${tag}`);
	if (wrong.length > 0) process.exit(1);
	console.log(`Every version is ${expected}.`);
} else {
	const versions = new Set(publicPackages().map((pkg) => pkg.version));
	if (versions.size !== 1) {
		console.error(`The npm packages disagree on the version: ${[...versions].join(', ')}`);
		process.exit(1);
	}
	const [version] = versions;

	writeFileSync(
		cargoToml,
		readFileSync(cargoToml, 'utf8').replace(workspaceVersion, `$1${version}$3`)
	);
	for (const path of [showcasePackage, tauriConf])
		writeJson(path, { ...readJson(path), version });
	// Updates only the workspace crates' entries in Cargo.lock.
	execFileSync('cargo', ['update', '--workspace'], { cwd: root, stdio: 'inherit' });
	console.log(`Every version is now ${version}.`);
}
