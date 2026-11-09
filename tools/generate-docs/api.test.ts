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
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { kindOf, posixRelative, readComponent, readOther, readPackage } from './api.ts';
import type { ApiComponent, ApiCompound, ApiOther } from './api.ts';

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url));
const lib = join(fixtures, 'pkg/src/lib');

describe('kindOf', () => {
	it('tells snippets, events and plain props apart', () => {
		assert.equal(kindOf('children', 'Snippet'), 'snippet');
		assert.equal(kindOf('header', 'string | Snippet<[number]>'), 'snippet');
		assert.equal(kindOf('onToggle', '(open: boolean) => void'), 'event');
		assert.equal(kindOf('online', 'boolean'), 'prop');
		assert.equal(kindOf('onToggle', 'boolean'), 'prop');
	});
});

describe('posixRelative', () => {
	it('returns the path relative to the root with forward slashes', () => {
		assert.equal(
			posixRelative(fixtures, join(lib, 'theme', 'theme.ts')),
			'pkg/src/lib/theme/theme.ts'
		);
	});
});

describe('readComponent', () => {
	const widget = readComponent(join(lib, 'Widget.svelte'), fixtures);

	it('reads the @component comment, the source and the attributes Props extends', () => {
		assert.equal(widget.kind, 'component');
		assert.equal(widget.source, 'pkg/src/lib/Widget.svelte');
		assert.equal(widget.doc, 'A widget with a `label`, rendered in a `mode`.');
		assert.equal(widget.extends, "Omit<HTMLAttributes<HTMLDivElement>, 'children'>");
	});

	it('reads the props with their kind, type, TSDoc, default and $bindable', () => {
		assert.deepEqual(widget.props, [
			{
				name: 'label',
				kind: 'prop',
				type: 'string',
				optional: false,
				doc: 'The text shown.'
			},
			{
				name: 'mode',
				kind: 'prop',
				type: 'Mode',
				optional: true,
				doc: 'How dense the widget is.',
				default: "'compact'"
			},
			{
				name: 'open',
				kind: 'prop',
				type: 'boolean',
				optional: true,
				doc: 'Whether the widget is open.',
				default: 'false',
				bindable: true
			},
			{
				name: 'onToggle',
				kind: 'event',
				type: '(open: boolean) => void',
				optional: true,
				doc: 'Called when the widget toggles.'
			},
			{
				name: 'children',
				kind: 'snippet',
				type: 'Snippet',
				optional: true,
				doc: 'Extra content.'
			}
		]);
	});
});

describe('readOther', () => {
	it('reads a declaration of the module', () => {
		assert.deepEqual(readOther(join(lib, 'css.ts'), 'modes', fixtures), {
			kind: 'constant',
			source: 'pkg/src/lib/css.ts',
			doc: 'The modes a widget renders in.'
		});
	});

	it('follows named re-exports to the declaring module', () => {
		assert.deepEqual(readOther(join(lib, 'mode.ts'), 'Mode', fixtures), {
			kind: 'type',
			source: 'pkg/src/lib/css.ts',
			doc: 'A mode a widget renders in.'
		});
	});

	it('follows renamed and star re-exports', () => {
		const index = join(lib, 'theme/index.ts');
		assert.equal(
			readOther(index, 'Mode', fixtures).doc,
			'Shadowed by the `Mode` the package index exports first.'
		);
		assert.deepEqual(readOther(index, 'roles', fixtures), {
			kind: 'constant',
			source: 'pkg/src/lib/theme/roles.ts',
			doc: 'The color roles of a theme.'
		});
		assert.equal(readOther(index, 'Theme', fixtures).kind, 'class');
		assert.equal(readOther(index, 'ThemeOptions', fixtures).kind, 'interface');
	});

	it('reports an export without declaration, also through cyclic re-exports', () => {
		const unresolved: string[] = [];
		const entry = readOther(
			join(fixtures, 'broken/src/lib/values.ts'),
			'missing',
			fixtures,
			unresolved
		);
		assert.deepEqual(entry, { kind: 'constant', source: 'broken/src/lib/values.ts', doc: '' });
		assert.deepEqual(unresolved, ['missing (exported from broken/src/lib/values.ts)']);
	});
});

describe('readPackage', () => {
	const unresolved: string[] = [];
	const entries = readPackage(join(lib, 'index.ts'), fixtures, unresolved);

	it('resolves every export of the fixture package', () => {
		assert.deepEqual(unresolved, []);
		assert.deepEqual(Object.keys(entries).sort(), [
			'Menu',
			'Mode',
			'Theme',
			'ThemeOptions',
			'Widget',
			'createTheme',
			'modes',
			'roles'
		]);
	});

	it('reads components and compound components', () => {
		assert.equal((entries.Widget as ApiComponent).source, 'pkg/src/lib/Widget.svelte');
		const menu = entries.Menu as ApiCompound;
		assert.equal(menu.kind, 'compound');
		assert.deepEqual(Object.keys(menu.parts), ['Root', 'Item']);
		assert.equal(menu.parts.Root?.doc, 'The root of a menu.');
		assert.equal(menu.parts.Item?.props[0]?.name, 'label');
	});

	it('merges star re-exports without overriding earlier names', () => {
		assert.equal((entries.createTheme as ApiOther).kind, 'function');
		assert.equal((entries.createTheme as ApiOther).doc, 'Returns a theme for `options`.');
		assert.equal((entries.roles as ApiOther).source, 'pkg/src/lib/theme/roles.ts');
		assert.deepEqual(entries.Mode, {
			kind: 'type',
			source: 'pkg/src/lib/css.ts',
			doc: 'A mode a widget renders in.'
		});
	});

	it('reports exports whose declaration or component file is missing', () => {
		const problems: string[] = [];
		const broken = readPackage(join(fixtures, 'broken/src/lib/index.ts'), fixtures, problems);
		assert.deepEqual(Object.keys(broken), ['missing']);
		assert.deepEqual(problems, [
			'missing (exported from broken/src/lib/values.ts)',
			'Ghost (exported from broken/src/lib/index.ts)'
		]);
	});
});
