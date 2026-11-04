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
import { KeyChord, Shortcut } from '../shortcuts/shortcut.js';
import type { Command } from '../shortcuts/commands.js';
import { addMonths, firstDayOfWeek, isoWeekNumber, monthWeeks } from './calendar/calendar-math.js';
import {
	formatHexColor,
	hslToRgb,
	hsvKeepingHue,
	hsvToRgb,
	parseHexColor,
	rgbToHsl,
	rgbToHsv
} from './color-picker/color-math.js';
import { popoverPlacement } from './popover/popover-state.svelte.js';
import { rankCommands } from './shortcuts/command-palette.svelte.js';
import { settleSnap } from './sheet/sheet-state.svelte.js';
import { ToasterStore } from './toast/toaster.svelte.js';
import { TourController } from './tour/tour-controller.svelte.js';

describe('popoverPlacement', () => {
	it('maps logical sides and alignments to floating placements', () => {
		expect(popoverPlacement('bottom', 'start', 'ltr')).toBe('bottom-start');
		expect(popoverPlacement('top', 'center', 'ltr')).toBe('top');
		expect(popoverPlacement('start', 'end', 'ltr')).toBe('left-end');
		expect(popoverPlacement('start', 'center', 'rtl')).toBe('right');
		expect(popoverPlacement('end', 'start', 'rtl')).toBe('left-start');
	});
});

describe('calendar math', () => {
	it('numbers ISO weeks as the Dart cases do', () => {
		expect(isoWeekNumber(new Date(2026, 0, 1))).toBe(1);
		expect(isoWeekNumber(new Date(2027, 0, 1))).toBe(53);
		expect(isoWeekNumber(new Date(2024, 11, 30))).toBe(1);
		expect(isoWeekNumber(new Date(2026, 9, 20))).toBe(43);
		expect(isoWeekNumber(new Date(2026, 2, 12))).toBe(11);
		expect(isoWeekNumber(new Date(2026, 6, 1))).toBe(27);
	});

	it('lays the month out from the locale week start', () => {
		expect(firstDayOfWeek('en')).toBe(0);
		expect(firstDayOfWeek('pt-BR')).toBe(0);
		// November 2026 starts on a Sunday.
		const sunday = monthWeeks(new Date(2026, 10, 1), 0);
		expect(sunday[0]?.[0]).toEqual(new Date(2026, 10, 1));
		expect(sunday).toHaveLength(5);
		const monday = monthWeeks(new Date(2026, 10, 1), 1);
		expect(monday[0]?.slice(0, 6)).toEqual([null, null, null, null, null, null]);
		expect(monday[0]?.[6]).toEqual(new Date(2026, 10, 1));
	});

	it('keeps the day within the target month', () => {
		expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
		expect(addMonths(new Date(2026, 2, 15), -12)).toEqual(new Date(2025, 2, 15));
	});
});

describe('color math', () => {
	it('formats and parses hex as the Dart cases do', () => {
		const blue = { r: 0x35 / 255, g: 0x84 / 255, b: 0xe4 / 255, a: 1 };
		expect(formatHexColor(blue)).toBe('#3584E4');
		expect(formatHexColor({ ...blue, a: 0x80 / 255 })).toBe('#3584E480');
		expect(formatHexColor({ ...blue, a: 0x80 / 255 }, false)).toBe('#3584E4');
		expect(formatHexColor(parseHexColor('#3584e4')!)).toBe('#3584E4');
		expect(formatHexColor(parseHexColor('f00')!)).toBe('#FF0000');
		expect(formatHexColor(parseHexColor('#3584E480')!)).toBe('#3584E480');
		for (const bad of ['#12345', 'zzz', '12#3456', '##123456'])
			expect(parseHexColor(bad), bad).toBeNull();
	});

	it('converts between RGB, HSV and HSL', () => {
		const red = { r: 1, g: 0, b: 0, a: 1 };
		expect(rgbToHsv(red)).toEqual({ h: 0, s: 1, v: 1, a: 1 });
		expect(rgbToHsl(red)).toEqual({ h: 0, s: 1, l: 0.5, a: 1 });
		const teal = parseHexColor('#2190A4')!;
		expect(formatHexColor(hsvToRgb(rgbToHsv(teal)))).toBe('#2190A4');
		expect(formatHexColor(hslToRgb(rgbToHsl(teal)))).toBe('#2190A4');
		expect(hsvKeepingHue({ r: 0.5, g: 0.5, b: 0.5, a: 1 }, 210).h).toBe(210);
	});
});

describe('settleSnap', () => {
	const snaps = [0.3, 0.6, 0.9];

	it('rests at the closest snap point and steps on a fling', () => {
		expect(settleSnap(snaps, 2, 290, 1000, 0, true)).toBe(1);
		expect(settleSnap(snaps, 2, 50, 1000, 800, true)).toBe(1);
		expect(settleSnap(snaps, 0, 590, 1000, -800, true)).toBe(1);
	});

	it('dismisses past half the lowest point when dismissible', () => {
		expect(settleSnap(snaps, 0, 800, 1000, 0, true)).toBe(-1);
		expect(settleSnap(snaps, 0, 800, 1000, 0, false)).toBe(0);
	});
});

describe('ToasterStore', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('closes after the duration, pausing while hovered', () => {
		const store = new ToasterStore();
		store.show({ title: 'Saved', duration: 1000 });
		vi.advanceTimersByTime(600);
		store.setPaused(true);
		vi.advanceTimersByTime(5000);
		expect(store.entries[0]?.closing).toBe(false);
		store.setPaused(false);
		vi.advanceTimersByTime(399);
		expect(store.entries[0]?.closing).toBe(false);
		vi.advanceTimersByTime(2);
		expect(store.entries[0]?.closing).toBe(true);
	});

	it('queues past the visible count and keeps loading toasts', () => {
		const store = new ToasterStore();
		store.maxVisible = 1;
		const first = store.show({ title: 'Loading', loading: true });
		store.show({ title: 'Next', duration: 100 });
		vi.advanceTimersByTime(1000);
		expect(store.visible.map((e) => e.toast.title)).toEqual(['Loading']);
		first.update({ title: 'Done', duration: 100 });
		vi.advanceTimersByTime(101);
		expect(first.isActive).toBe(false);
		store.removed(store.entries[0]!.id);
		expect(store.visible.map((e) => e.toast.title)).toEqual(['Next']);
	});

	it('replaces a promise toast with its outcome', async () => {
		vi.useRealTimers();
		const store = new ToasterStore();
		await store.promise(Promise.resolve(3), {
			loading: { title: 'Working' },
			success: (n) => ({ title: `Done ${n}` }),
			error: () => ({ title: 'Failed' })
		});
		await Promise.resolve();
		expect(store.entries[0]?.toast.title).toBe('Done 3');
	});
});

describe('TourController', () => {
	it('goes through the steps and reports how it ended', () => {
		const tour = new TourController([{ title: 'A' }, { title: 'B' }]);
		tour.start();
		expect(tour.step?.title).toBe('A');
		tour.previous();
		expect(tour.index).toBe(0);
		tour.next();
		tour.next();
		expect(tour.isActive).toBe(false);
		expect(tour.completed).toBe(true);
		tour.start(1);
		tour.skip();
		expect(tour.completed).toBe(false);
		expect(() => new TourController([])).toThrow(RangeError);
	});
});

describe('command palette', () => {
	const command = (id: string, label: string, extra: Partial<Command> = {}): Command => ({
		id,
		label,
		onInvoke: () => {},
		...extra
	});
	const commands = [
		command('open', 'Abrir arquivo', { keywords: ['file'] }),
		command('find', 'Localizar no arquivo'),
		command('save', 'Salvar', { group: 'Arquivo' }),
		command('hidden', 'Arquivo oculto', { enabled: false })
	];

	it('ranks label prefixes first and skips disabled commands', () => {
		expect(rankCommands(commands, 'arquivo').map((c) => c.id)).toEqual([
			'open',
			'find',
			'save'
		]);
		expect(rankCommands(commands, 'abr').map((c) => c.id)).toEqual(['open']);
		expect(rankCommands(commands, 'file').map((c) => c.id)).toEqual(['open']);
		expect(rankCommands(commands, '').map((c) => c.id)).toEqual(['open', 'find', 'save']);
	});

	it('labels shortcuts per platform', () => {
		const shortcut = new Shortcut([new KeyChord('k', { primary: true })]);
		expect(shortcut.label('macos')).toBe('⌘K');
		expect(shortcut.label('linux')).toBe('Ctrl+K');
		expect(shortcut.label('windows')).toBe('Ctrl+K');
	});
});
