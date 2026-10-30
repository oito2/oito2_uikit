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
import {
	availableCommands,
	shortcutConflicts,
	type Command,
	type CommandScope
} from './commands.js';
import { KeyChord, Shortcut } from './shortcut.js';

/** Builds the fields of a key event that `KeyChord.fromEvent` reads. */
function keyEvent(init: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		key: '',
		code: '',
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		metaKey: false,
		...init
	} as KeyboardEvent;
}

describe('Shortcut', () => {
	it('parses chords, modifiers and sequences', () => {
		const palette = Shortcut.parse('Mod+Shift+P');
		expect(palette.chords[0]?.key).toBe('p');
		expect(palette.chords[0]?.primary).toBe(true);
		expect(palette.chords[0]?.shift).toBe(true);
		expect(Shortcut.parse('G H').chords.map((c) => c.key)).toEqual(['g', 'h']);
		expect(Shortcut.parse('F5').chords[0]?.key).toBe('F5');
		expect(Shortcut.parse('Ctrl+,').chords[0]?.key).toBe(',');
		expect(Shortcut.parse('alt+return').chords[0]?.key).toBe('Enter');
		expect(() => Shortcut.parse('Hyper+K')).toThrow(SyntaxError);
		expect(() => Shortcut.parse('Ctrl+Pause')).toThrow(SyntaxError);
		expect(() => Shortcut.parse('F13')).toThrow(SyntaxError);
		expect(() => Shortcut.parse('')).toThrow(SyntaxError);
	});

	it('resolves the primary modifier per platform', () => {
		const shortcut = Shortcut.parse('Mod+K');
		expect(shortcut.matches(Shortcut.parse('Ctrl+K'), 'linux')).toBe(true);
		expect(shortcut.matches(Shortcut.parse('Cmd+K'), 'macos')).toBe(true);
		expect(shortcut.matches(Shortcut.parse('Ctrl+K'), 'macos')).toBe(false);
		expect(Shortcut.primary('k').equals(shortcut)).toBe(true);
	});

	it('labels follow the platform notation', () => {
		const shortcut = Shortcut.parse('Mod+Shift+K');
		expect(shortcut.label('linux')).toBe('Ctrl+Shift+K');
		expect(shortcut.label('windows')).toBe('Ctrl+Shift+K');
		expect(shortcut.label('macos')).toBe('⇧⌘K');
		expect(Shortcut.parse('G H').label('linux')).toBe('G H');
		expect(Shortcut.parse('Alt+Enter').label('macos')).toBe('⌥↩');
		expect(Shortcut.parse('Meta+Up').label('linux')).toBe('Super+↑');
		expect(String(Shortcut.parse('Mod+K'))).toBe('Ctrl+K');
	});

	it('reads chords from key events', () => {
		const chord = KeyChord.fromEvent(
			keyEvent({ key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true })
		);
		expect(chord.matches(Shortcut.parse('Mod+Shift+K').chords[0]!, 'linux')).toBe(true);
		// Shift changes the character of a digit, but not the key of the chord.
		expect(KeyChord.keyOf(keyEvent({ key: '!', code: 'Digit1' }))).toBe('1');
		// Option on a Mac types a symbol; the key is read from its position.
		expect(KeyChord.keyOf(keyEvent({ key: '˚', code: 'KeyK' }))).toBe('k');
		expect(KeyChord.keyOf(keyEvent({ key: '<', code: 'Comma' }))).toBe(',');
		expect(KeyChord.keyOf(keyEvent({ key: ' ', code: 'Space' }))).toBe('Space');
		expect(KeyChord.keyOf(keyEvent({ key: 'Enter', code: 'NumpadEnter' }))).toBe('Enter');
		expect(KeyChord.isModifierKey('Shift')).toBe(true);
		expect(KeyChord.isModifierKey('k')).toBe(false);
	});
});

describe('commands', () => {
	const noop = () => {};

	it('reports clashing and prefix shortcuts', () => {
		const commands: Command[] = [
			{ id: 'a', label: 'A', shortcut: Shortcut.parse('G'), onInvoke: noop },
			{ id: 'b', label: 'B', shortcut: Shortcut.parse('G H'), onInvoke: noop },
			{ id: 'c', label: 'C', shortcut: Shortcut.parse('Ctrl+K'), onInvoke: noop },
			{ id: 'd', label: 'D', shortcut: Shortcut.parse('Mod+K'), onInvoke: noop }
		];
		expect(shortcutConflicts(commands, 'linux').map(([a, b]) => a.id + b.id)).toEqual([
			'ab',
			'cd'
		]);
		expect(shortcutConflicts(commands, 'macos')).toHaveLength(1);
	});

	it('lists the enabled commands of the scopes, inner ones first', () => {
		const outer: CommandScope = {
			commands: [
				{ id: 'save', label: 'Save all', onInvoke: noop },
				{ id: 'quit', label: 'Quit', onInvoke: noop }
			],
			parent: null
		};
		const inner: CommandScope = {
			commands: [
				{ id: 'save', label: 'Save file', onInvoke: noop },
				{ id: 'off', label: 'Off', onInvoke: noop, enabled: false }
			],
			parent: outer
		};
		expect(availableCommands(inner).map((c) => c.label)).toEqual(['Save file', 'Quit']);
	});
});
