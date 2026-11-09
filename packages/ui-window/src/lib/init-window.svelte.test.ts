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

import { Platform } from '@oito2/ui';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';
import { initWindow, type InitWindowOptions } from './init-window.js';
import type { NativeWindowController } from './native-window-controller.svelte.js';

/** What the mocked plugin and window answer; `plugin.failure` makes `decoration_mode` reject. */
interface Answers {
	failure: unknown;
	/** While set, `is_focused` answers only after it resolves. */
	gate: Promise<void> | null;
}

/** Mocks a Tauri main window in `gtk-headerless` mode, recording every command. */
function mockTauri() {
	(globalThis as { isTauri?: boolean }).isTauri = true;
	const answers: Answers = { failure: null, gate: null };
	const calls: { cmd: string; args: unknown }[] = [];
	mockWindows('main');
	mockIPC(
		(cmd, args) => {
			calls.push({ cmd, args });
			if (cmd === 'plugin:oito2-window|decoration_mode') {
				return answers.failure ? Promise.reject(answers.failure) : 'gtk-headerless';
			}
			if (cmd === 'plugin:window|is_focused') {
				return answers.gate ? answers.gate.then(() => true) : true;
			}
			if (cmd.startsWith('plugin:window|is_')) return false;
			return null;
		},
		{ shouldMockEvents: true }
	);
	return { calls, answers };
}

const commands = (calls: { cmd: string }[]) => calls.map((call) => call.cmd);

/** The controllers a test created, disposed after it so no live one leaks into the next. */
let created: (NativeWindowController | null)[] = [];

/** Calls `initWindow` and remembers its controller for the cleanup. */
async function init(options?: InitWindowOptions) {
	const controller = await initWindow(options);
	created.push(controller);
	return controller;
}

afterEach(() => {
	for (const controller of created) controller?.dispose();
	created = [];
	clearMocks();
	delete (globalThis as { isTauri?: unknown }).isTauri;
});

describe('initWindow', () => {
	it('resolves null outside Tauri', async () => {
		await expect(initWindow()).resolves.toBeNull();
	});

	it('connects the current window with its decoration mode', async () => {
		const { calls } = mockTauri();
		const controller = await init({ show: false });
		expect(controller).not.toBeNull();
		expect(controller?.decorations).toBe('gtk-headerless');
		const platform = Platform.current();
		expect(controller?.state.canShowMenu).toBe(platform.isLinux || platform.isWindows);
		expect(commands(calls)).not.toContain('plugin:window|show');
		expect(commands(calls)).not.toContain('plugin:oito2-window|set_decoration_mode');
		controller?.dispose();
	});

	it('applies the frame, shows and focuses the window by default', async () => {
		const { calls } = mockTauri();
		const controller = await init({ decorations: 'undecorated', title: 'Test' });
		expect(controller?.decorations).toBe('undecorated');
		expect(calls).toContainEqual({
			cmd: 'plugin:oito2-window|set_decoration_mode',
			args: { mode: 'undecorated' }
		});
		expect(commands(calls)).toEqual(
			expect.arrayContaining([
				'plugin:window|set_title',
				'plugin:window|show',
				'plugin:window|set_focus'
			])
		);
		expect(commands(calls)).not.toContain('plugin:oito2-window|decoration_mode');
		controller?.dispose();
	});

	it('returns the same controller while the first one is alive', async () => {
		const { calls } = mockTauri();
		const [first, concurrent] = await Promise.all([
			init({ show: false }),
			init({ show: false })
		]);
		expect(concurrent).toBe(first);
		const later = await init({ show: false, decorations: 'undecorated' });
		expect(later).toBe(first);
		expect(commands(calls)).not.toContain('plugin:oito2-window|set_decoration_mode');
		first?.dispose();
		const next = await init({ show: false });
		expect(next).not.toBeNull();
		expect(next).not.toBe(first);
		next?.dispose();
	});

	it('resolves null and disposes the controller once the signal aborts', async () => {
		const { calls, answers } = mockTauri();
		const aborted = new AbortController();
		aborted.abort();
		await expect(initWindow({ show: false, signal: aborted.signal })).resolves.toBeNull();
		expect(calls).toEqual([]);
		let release: () => void = () => {};
		answers.gate = new Promise((resolve) => (release = resolve));
		const abort = new AbortController();
		const pending = init({ show: false, signal: abort.signal });
		await expect.poll(() => commands(calls)).toContain('plugin:window|is_focused');
		abort.abort();
		release();
		await expect(pending).resolves.toBeNull();
		expect(document.documentElement.hasAttribute('data-oito2-decorations')).toBe(false);
		answers.gate = null;
		const next = await init({ show: false });
		expect(next).not.toBeNull();
		next?.dispose();
	});

	it('rejects with a clear message when the plugin does not answer', async () => {
		const { answers } = mockTauri();
		answers.failure = { kind: 'tauri', message: 'plugin oito2-window not found' };
		const error: unknown = await initWindow({ show: false }).catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe(
			'oito2: tauri-plugin-oito2-window is not registered or the capability does not allow it'
		);
		expect((error as Error).cause).toEqual(answers.failure);
		answers.failure = null;
		const controller = await init({ show: false });
		expect(controller).not.toBeNull();
		controller?.dispose();
	});
});
