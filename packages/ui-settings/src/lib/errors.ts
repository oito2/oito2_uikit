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

/** The kinds of error `tauri-plugin-oito2-settings` rejects a command with. */
export type CommandErrorKind = 'unsupported' | 'internal';

/** The value a command of `tauri-plugin-oito2-settings` rejects with. */
export interface CommandError {
	kind: CommandErrorKind;
	message: string;
}

const kinds: readonly string[] = ['unsupported', 'internal'];

/** Whether `value` is a `CommandError`: an object with a known `kind` and a string `message`. */
export function isCommandError(value: unknown): value is CommandError {
	if (typeof value !== 'object' || value === null) return false;
	const { kind, message } = value as { kind?: unknown; message?: unknown };
	return typeof kind === 'string' && kinds.includes(kind) && typeof message === 'string';
}
