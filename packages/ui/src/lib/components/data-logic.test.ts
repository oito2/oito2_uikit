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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TreeCollection } from '../collections/tree-collection.js';
import { en } from '../l10n/en.js';
import { animatedIcons } from '../icons/animated-icons.js';
import { freedesktopIcon, freedesktopIcons } from '../icons/freedesktop-icons.js';
import { accentColors } from '../tokens/values.js';
import { avatarColor, avatarStatusLabel, initials } from './avatar/avatar.js';
import { formatDuration, TimerController } from './timer/timer-controller.svelte.js';
import { jsonTree, jsonValueText } from './tree/json-tree.js';
import { treeCheckStates } from './tree/tree-check.js';
import { TreeController } from './tree/tree-controller.svelte.js';

describe('Avatar helpers', () => {
	it('takes the initials of the first and last words', () => {
		expect(initials('Ana Maria Souza')).toBe('AS');
		expect(initials('  joão ')).toBe('J');
		expect(initials('')).toBe('');
		// Decomposed accents and emoji sequences stay whole.
		expect(initials('élise')).toBe('É');
		expect(initials('\u{1F469}‍\u{1F4BB} dev')).toBe('\u{1F469}‍\u{1F4BB}D');
	});

	it('picks a stable accent color from the name', () => {
		const color = avatarColor('Ana Souza');
		expect(Object.values(accentColors)).toContain(color);
		expect(avatarColor('Ana Souza')).toBe(color);
		expect(avatarColor('   ')).toBeNull();
		expect(avatarColor(null)).toBeNull();
		expect(avatarStatusLabel('busy', en)).toBe(en.statusBusy);
	});
});

describe('TimerController', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('formats durations', () => {
		expect(formatDuration(5000)).toBe('0:05');
		expect(formatDuration((61 * 60 + 2) * 1000)).toBe('1:01:02');
		expect(formatDuration(1250, { tenths: true })).toBe('0:01.2');
		expect(formatDuration(-5000)).toBe('-0:05');
	});

	it('counts down, pauses and completes', () => {
		let completed = 0;
		const ticks: number[] = [];
		const timer = new TimerController({
			countdown: 5000,
			now: () => Date.now(),
			onTick: (elapsed) => ticks.push(elapsed),
			onComplete: () => completed++
		});
		expect(timer.remaining).toBe(5000);
		timer.start();
		vi.advanceTimersByTime(2000);
		expect(timer.remaining).toBe(3000);
		timer.pause();
		vi.advanceTimersByTime(3000);
		expect(timer.remaining).toBe(3000);
		timer.start();
		vi.advanceTimersByTime(4000);
		expect(timer.remaining).toBe(0);
		expect(timer.isCompleted).toBe(true);
		expect(timer.isRunning).toBe(false);
		expect(completed).toBe(1);
		expect(ticks.at(-1)).toBe(5000);
		timer.reset();
		expect(timer.remaining).toBe(5000);
		expect(timer.isCompleted).toBe(false);
		timer.dispose();
	});

	it('counts up as a stopwatch and completes a countdown between ticks', () => {
		const stopwatch = new TimerController({ now: () => Date.now() });
		stopwatch.start();
		vi.advanceTimersByTime(65_000);
		expect(formatDuration(stopwatch.elapsed)).toBe('1:05');
		expect(stopwatch.remaining).toBeNull();
		stopwatch.dispose();

		let completed = 0;
		const countdown = new TimerController({
			countdown: 1500,
			now: () => Date.now(),
			onComplete: () => completed++
		});
		countdown.start();
		vi.advanceTimersByTime(1500);
		expect(completed).toBe(1);
		expect(countdown.remaining).toBe(0);
	});

	it('does nothing once disposed and rejects a bad interval', () => {
		const timer = new TimerController({ now: () => Date.now() });
		timer.start();
		timer.dispose();
		timer.pause();
		timer.reset();
		expect(timer.isRunning).toBe(true);
		const disposed = new TimerController({ now: () => Date.now() });
		disposed.dispose();
		disposed.start();
		expect(disposed.isRunning).toBe(false);
		expect(() => new TimerController({ interval: 0 })).toThrow(RangeError);
	});
});

describe('TreeController', () => {
	const tree = new TreeCollection([
		{
			value: 'src',
			children: [
				{ value: 'a.ts' },
				{ value: 'b.ts' },
				{ value: 'lib', children: [{ value: 'c.ts' }] },
				{ value: 'empty', children: [] }
			]
		},
		{ value: 'README.md' }
	]);

	it('cascades check boxes and reports the mixed state', () => {
		const controller = new TreeController();
		expect(controller.checkStateOf(tree, 'src')).toBe(false);
		controller.toggleChecked(tree, 'lib');
		expect([...controller.checked]).toEqual(['c.ts']);
		expect(controller.checkStateOf(tree, 'src')).toBe('mixed');
		expect(controller.checkStateOf(tree, 'lib')).toBe(true);
		controller.toggleChecked(tree, 'src');
		expect(controller.checkStateOf(tree, 'src')).toBe(true);
		expect(controller.checkStateOf(tree, 'empty')).toBe(false);
		controller.toggleChecked(tree, 'src');
		expect(controller.checked.size).toBe(0);
		controller.toggleChecked(tree, 'missing');
		expect(controller.checked.size).toBe(0);
	});

	it('computes every check state in one pass', () => {
		const states = treeCheckStates(tree, new Set(['a.ts', 'c.ts']));
		expect(states.get('src')).toBe('mixed');
		expect(states.get('lib')).toBe(true);
		expect(states.get('empty')).toBe(false);
		expect(states.get('b.ts')).toBe(false);
	});

	it('keeps the selection to its mode and opens and closes branches', () => {
		const single = new TreeController({ selected: ['a.ts', 'b.ts'] });
		expect([...single.selected]).toEqual(['a.ts']);
		single.toggleSelected('b.ts');
		expect([...single.selected]).toEqual(['b.ts']);
		const none = new TreeController({ selectionMode: 'none', selected: ['a.ts'] });
		none.setSelected(['b.ts']);
		expect(none.selected.size).toBe(0);
		const multiple = new TreeController({ selectionMode: 'multiple' });
		multiple.toggleSelected('a.ts');
		multiple.toggleSelected('b.ts');
		multiple.toggleSelected('a.ts');
		expect([...multiple.selected]).toEqual(['b.ts']);

		const expanded = single.expanded;
		single.setExpanded('src', true);
		expect(single.isExpanded('src')).toBe(true);
		expect(single.expanded).not.toBe(expanded);
		const same = single.expanded;
		single.setExpandedValues(['src']);
		expect(single.expanded).toBe(same);
		single.expandAll(tree);
		expect([...single.expanded].sort()).toEqual(['empty', 'lib', 'src']);
		single.collapseAll();
		expect(single.expanded.size).toBe(0);
	});
});

describe('jsonTree', () => {
	it('uses JSON paths for keys and indexes', () => {
		const tree = jsonTree({ name: 'oito2', tags: ['ui', 'svelte'], 'a b': null });
		expect(tree.values).toEqual([
			'$',
			'$.name',
			'$.tags',
			'$.tags[0]',
			'$.tags[1]',
			'$["a b"]'
		]);
		expect(tree.find('$.name')?.label).toBe('name: "oito2"');
		expect(tree.find('$["a b"]')?.label).toBe('a b: null');
		expect(tree.find('$')?.label).toBe('$');
	});

	it('shows values JSON cannot encode', () => {
		const tree = jsonTree({ ratio: Number.NaN, when: new Date(Date.UTC(2026, 0, 1)) }, 'root');
		expect(tree.find('$.ratio')?.label).toBe('ratio: NaN');
		expect(tree.find('$.when')?.label).toBe('when: 2026-01-01T00:00:00.000Z');
		expect(tree.find('$.when')?.children).toBeUndefined();
		expect(jsonValueText(undefined)).toBe('undefined');
		expect(jsonValueText(42)).toBe('42');
	});
});

describe('freedesktopIcon', () => {
	it('finds icons by name, ignoring suffixes and falling back to shorter names', () => {
		const open = freedesktopIcons['document-open'];
		expect(open).toBeDefined();
		expect(freedesktopIcon('document-open')).toBe(open);
		expect(freedesktopIcon('document-open-symbolic')).toBe(open);
		expect(freedesktopIcon('no-such-icon')).toBeNull();
		expect(freedesktopIcon('go-next-rtl-symbolic')).toBe(freedesktopIcon('go-next'));
		expect(freedesktopIcon('document-save-as-template')).toBe(
			freedesktopIcons['document-save-as']
		);
		expect(freedesktopIcon('toString')).toBeNull();
		for (const name of Object.keys(freedesktopIcons)) {
			expect(freedesktopIcon(name)).toBe(freedesktopIcons[name]);
		}
	});
});

describe('animatedIcons', () => {
	it('draws nothing of a stroke at the start and the whole icon at the end', () => {
		const text = (shapes: unknown) => JSON.stringify(shapes);
		expect(animatedIcons.ok.frame(0, 'x')).toEqual([]);
		expect(text(animatedIcons.ok.frame(1, 'x'))).toContain('M7.5 12.5L10.5 15.5L16.5 9');
		expect(text(animatedIcons.ok.frame(1, 'x'))).not.toContain('stroke-dasharray');
		expect(animatedIcons.ok.frame(0.3, 'x')[0]?.attributes['stroke-dasharray']).toBe('0.5 2');
		expect(text(animatedIcons.okFilled.frame(1, 'icon'))).toContain('url(#icon-check)');
		expect(text(animatedIcons.compass.frame(1, 'c'))).toContain('rotate(0 12 12)');
		for (const icon of Object.values(animatedIcons)) {
			expect(icon.duration).toBeGreaterThan(0);
			expect(icon.frame(1, 'id').length).toBeGreaterThan(0);
		}
	});
});
