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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import CommandsHarness from '../../tests/CommandsHarness.svelte';
import type { Command } from './commands.js';
import { Shortcut } from './shortcut.js';

/** Returns the commands of the default scope, recording their runs in `runs`. */
function commands(runs: string[]): Command[] {
	return [
		{
			id: 'palette',
			label: 'Open the command palette',
			shortcut: Shortcut.parse('Mod+K'),
			onInvoke: () => runs.push('palette')
		},
		{
			id: 'home',
			label: 'Go home',
			shortcut: Shortcut.parse('G H'),
			onInvoke: () => runs.push('home')
		},
		{
			id: 'off',
			label: 'Disabled',
			shortcut: Shortcut.parse('Mod+D'),
			enabled: false,
			onInvoke: () => runs.push('off')
		}
	];
}

/** Focuses the element with `testId`. */
function focus(testId: string) {
	(page.getByTestId(testId).element() as HTMLElement).focus();
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Commands', () => {
	it('runs a command from its shortcut', async () => {
		const runs: string[] = [];
		render(CommandsHarness, { commands: commands(runs), platform: 'linux' });
		focus('target');
		await userEvent.keyboard('{Control>}k{/Control}');
		await userEvent.keyboard('{Control>}d{/Control}');
		expect(runs).toEqual(['palette']);
	});

	it('resolves the primary modifier for the platform', async () => {
		const runs: string[] = [];
		render(CommandsHarness, { commands: commands(runs), platform: 'macos' });
		focus('target');
		await userEvent.keyboard('{Control>}k{/Control}');
		expect(runs).toEqual([]);
		await userEvent.keyboard('{Meta>}k{/Meta}');
		expect(runs).toEqual(['palette']);
	});

	it('runs a sequence pressed in time and drops it after the timeout', async () => {
		const runs: string[] = [];
		render(CommandsHarness, { commands: commands(runs), platform: 'linux' });
		focus('target');
		await userEvent.keyboard('gh');
		expect(runs).toEqual(['home']);
		await userEvent.keyboard('g');
		await new Promise((resolve) => setTimeout(resolve, 1100));
		await userEvent.keyboard('h');
		expect(runs).toEqual(['home']);
	});

	it('restarts a sequence with a key that does not continue it', async () => {
		const runs: string[] = [];
		render(CommandsHarness, { commands: commands(runs), platform: 'linux' });
		focus('target');
		await userEvent.keyboard('ggh');
		expect(runs).toEqual(['home']);
	});

	it('skips shortcuts without a command modifier in text fields', async () => {
		const runs: string[] = [];
		render(CommandsHarness, { commands: commands(runs), platform: 'linux' });
		focus('field');
		await userEvent.keyboard('gh');
		await userEvent.keyboard('{Control>}k{/Control}');
		expect(runs).toEqual(['palette']);
		await expect.element(page.getByTestId('field')).toHaveValue('gh');
	});

	it('works outside the scope only when global', async () => {
		const runs: string[] = [];
		const props = $state({
			commands: commands(runs),
			platform: 'linux' as const,
			global: false
		});
		render(CommandsHarness, props);
		focus('outside');
		await userEvent.keyboard('{Control>}k{/Control}');
		expect(runs).toEqual([]);
		props.global = true;
		await expect
			.poll(async () => {
				focus('outside');
				await userEvent.keyboard('{Control>}k{/Control}');
				return runs.length;
			})
			.toBeGreaterThan(0);
		expect(runs[0]).toBe('palette');
	});

	it('lets inner scopes override outer commands by id', async () => {
		const runs: string[] = [];
		const noop = () => {};
		render(CommandsHarness, {
			platform: 'linux',
			commands: [
				{
					id: 'save',
					label: 'Save all',
					shortcut: Shortcut.parse('Ctrl+Shift+S'),
					onInvoke: () => runs.push('outer')
				},
				{ id: 'quit', label: 'Quit', onInvoke: noop }
			],
			inner: [
				{
					id: 'save',
					label: 'Save file',
					shortcut: Shortcut.parse('Ctrl+S'),
					enabled: false,
					onInvoke: () => runs.push('inner')
				},
				{ id: 'find', label: 'Find', onInvoke: noop }
			]
		});
		await expect
			.element(page.getByTestId('available'))
			.toHaveTextContent('Find, Save all, Quit');
		focus('target');
		await userEvent.keyboard('{Control>}{Shift>}s{/Shift}{/Control}');
		expect(runs).toEqual([]);
	});

	it('reports clashing shortcuts', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const noop = () => {};
		render(CommandsHarness, {
			platform: 'linux',
			commands: [
				{ id: 'a', label: 'A', shortcut: Shortcut.parse('Mod+K'), onInvoke: noop },
				{ id: 'b', label: 'B', shortcut: Shortcut.parse('Ctrl+K'), onInvoke: noop }
			]
		});
		await expect.poll(() => error.mock.calls.length).toBe(1);
		expect(String(error.mock.calls[0]?.[0])).toContain('"a" and "b"');
	});
});
