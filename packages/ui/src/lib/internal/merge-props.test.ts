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
import { mergeProps } from './merge-props.js';

type Handler = (event: Event) => void;

describe('mergeProps', () => {
	it('runs both handlers, the first one first', () => {
		const calls: string[] = [];
		const merged = mergeProps(
			{ onclick: () => calls.push('consumer') },
			{ onclick: () => calls.push('component') }
		);
		(merged.onclick as Handler)(new Event('click', { cancelable: true }));
		expect(calls).toEqual(['consumer', 'component']);
	});

	it('skips the second handler when the first prevents the default', () => {
		const calls: string[] = [];
		const merged = mergeProps(
			{ onclick: (event: Event) => event.preventDefault() },
			{ onclick: () => calls.push('component') }
		);
		(merged.onclick as Handler)(new Event('click', { cancelable: true }));
		expect(calls).toEqual([]);
	});

	it('joins class, style and id lists, and lets other props of b win', () => {
		const b: Record<string, unknown> = {
			class: 'b',
			style: 'top: 0',
			'aria-describedby': 'y',
			id: 'two',
			title: undefined
		};
		const merged = mergeProps(
			{ class: 'a', style: 'color: red', 'aria-describedby': 'x', id: 'one', title: 't' },
			b
		);
		expect(merged.class).toEqual(['a', 'b']);
		expect(merged.style).toBe('color: red; top: 0');
		expect(merged['aria-describedby']).toBe('x y');
		expect(merged.id).toBe('two');
		expect(merged.title).toBe('t');
	});

	it('copies symbol keys, such as attachments', () => {
		const attachment = Symbol('attachment');
		const merged = mergeProps({}, { [attachment]: 'attach' });
		expect((merged as Record<symbol, unknown>)[attachment]).toBe('attach');
	});

	it('keeps a lone handler as it is', () => {
		const handler = () => {};
		expect(mergeProps({}, { onclick: handler }).onclick).toBe(handler);
		expect(mergeProps({ onclick: handler }, {}).onclick).toBe(handler);
	});
});
