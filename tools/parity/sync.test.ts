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

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { fixtureTargets, sourceFolder, sourceRecord, syncFixtures, targetFolder } from './sync.ts';

let base: string;
let from: string;
let root: string;

/** Writes `content` to `path`, creating its folders. */
function put(path: string, content: string): void {
	mkdirSync(join(path, '..'), { recursive: true });
	writeFileSync(path, content);
}

/** The path of a fixture's copy in the fake repository. */
function target(name: string): string {
	return join(root, fixtureTargets[name] ?? '', targetFolder, `${name}.json`);
}

beforeEach(() => {
	base = mkdtempSync(join(tmpdir(), 'oito2-parity-'));
	from = join(base, 'oito2_ui');
	root = join(base, 'uikit');
	for (const name of Object.keys(fixtureTargets)) {
		put(join(from, sourceFolder, `${name}.json`), `{"${name}": 1}\n`);
		put(target(name), `{"${name}": 1}\n`);
	}
	put(join(from, sourceFolder, 'manifest.json'), '{"flutter": "3.47.8"}\n');
	mkdirSync(join(root, 'tools', 'parity'), { recursive: true });
});

afterEach(() => {
	rmSync(base, { recursive: true, force: true });
});

describe('syncFixtures', () => {
	it('reports nothing when every copy matches', () => {
		assert.deepEqual(syncFixtures({ from, root, check: true }), { changed: [], unmapped: [] });
	});

	it('reports a differing copy in check mode without touching it', () => {
		put(target('qr'), '{"qr": 0}\n');
		const result = syncFixtures({ from, root, check: true });
		assert.deepEqual(result.changed, ['packages/ui-extras/src/fixtures/parity/qr.json']);
		assert.equal(readFileSync(target('qr'), 'utf8'), '{"qr": 0}\n');
	});

	it('compares bytes, so a reformatted copy counts as different', () => {
		put(target('tokens'), '{\n\t"tokens": 1\n}\n');
		assert.equal(syncFixtures({ from, root, check: true }).changed.length, 1);
	});

	it('overwrites differing copies and records the source', () => {
		put(target('syntax'), '{}\n');
		const result = syncFixtures({ from, root });
		assert.deepEqual(result.changed, ['packages/ui-syntax/src/fixtures/parity/syntax.json']);
		assert.equal(readFileSync(target('syntax'), 'utf8'), '{"syntax": 1}\n');
		const record = JSON.parse(readFileSync(join(root, sourceRecord), 'utf8')) as Record<
			string,
			unknown
		>;
		assert.equal(record.repository, 'oito2/oito2_ui');
		assert.equal(record.commit, null);
		assert.deepEqual(record.manifest, { flutter: '3.47.8' });
		assert.deepEqual(syncFixtures({ from, root, check: true }).changed, []);
	});

	it('creates a missing copy', () => {
		rmSync(target('format'));
		syncFixtures({ from, root });
		assert.equal(readFileSync(target('format'), 'utf8'), '{"format": 1}\n');
	});

	it('lists fixtures no package tests against', () => {
		put(join(from, sourceFolder, 'catalog.json'), '{}\n');
		assert.deepEqual(syncFixtures({ from, root, check: true }).unmapped, ['catalog']);
	});

	it('fails when oito2_ui lacks a fixture', () => {
		rmSync(join(from, sourceFolder, 'l10n.json'));
		assert.throws(() => syncFixtures({ from, root, check: true }), /no l10n\.json/);
	});

	it('fails when the folder is not an oito2_ui checkout', () => {
		assert.throws(() => syncFixtures({ from: join(base, 'nope'), root, check: true }));
	});
});
