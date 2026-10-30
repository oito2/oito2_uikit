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

import { describe, expect, it } from 'vitest';
import parity from '../../fixtures/parity/l10n.json';
import { en } from './en.js';
import { localizationsFor } from './locale.js';
import type { Localizations, TimeUnit } from './localizations.js';
import { ptBR } from './pt-br.js';

type Method = (...args: (string | number)[]) => string;

describe.each([
	['en', en],
	['pt-BR', ptBR]
] as const)('%s strings match oito2_ui', (locale, strings) => {
	const expected = parity[locale];

	it('has every getter with the same text', () => {
		for (const [name, text] of Object.entries(expected.getters)) {
			expect(strings[name as keyof Localizations], name).toBe(text);
		}
	});

	it('formats every method the same way', () => {
		for (const { name, args, result } of expected.calls) {
			const method = strings[name as keyof Localizations] as unknown as Method;
			expect(typeof method, name).toBe('function');
			expect(
				method(...(args as (string | number | TimeUnit)[])),
				`${name}(${args.join(', ')})`
			).toBe(result);
		}
	});

	it('has no strings oito2_ui lacks', () => {
		const names = new Set([
			...Object.keys(expected.getters),
			...expected.calls.map((call) => call.name)
		]);
		const extra = Object.keys(strings).filter((name) => name !== 'locale' && !names.has(name));
		expect(extra).toEqual([]);
	});
});

describe('localizationsFor', () => {
	it('picks Portuguese for any pt locale and English otherwise', () => {
		expect(localizationsFor('pt-BR')).toBe(ptBR);
		expect(localizationsFor('pt_PT')).toBe(ptBR);
		expect(localizationsFor('PT')).toBe(ptBR);
		expect(localizationsFor('en-US')).toBe(en);
		expect(localizationsFor('de')).toBe(en);
		expect(localizationsFor('')).toBe(en);
	});
});
