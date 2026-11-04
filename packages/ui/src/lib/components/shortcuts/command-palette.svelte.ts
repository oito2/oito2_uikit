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

import { foldText } from '../../collections/text-folding.js';
import { isCommandEnabled, type Command } from '../../shortcuts/commands.js';

/**
 * Returns the commands that match `query`, best first: every word must appear in the
 * label, description, group or keywords (ignoring case and accents); labels that start
 * with the first word come first, then labels holding every word, then the rest, each in
 * their original order. Disabled commands never match.
 */
export function rankCommands(commands: readonly Command[], query: string): Command[] {
	const words = foldText(query)
		.split(/\s+/)
		.filter((word) => word);
	const scored: { score: number; index: number; command: Command }[] = [];
	commands.forEach((command, index) => {
		if (!isCommandEnabled(command)) return;
		const label = foldText(command.label);
		const text = foldText(
			[
				command.label,
				command.description ?? '',
				command.group ?? '',
				...(command.keywords ?? [])
			].join(' ')
		);
		if (!words.every((word) => text.includes(word))) return;
		const first = words[0];
		const score =
			first === undefined
				? 1
				: label.startsWith(first)
					? 0
					: words.every((word) => label.includes(word))
						? 1
						: 2;
		scored.push({ score, index, command });
	});
	scored.sort((a, b) => a.score - b.score || a.index - b.index);
	return scored.map((entry) => entry.command);
}

/** Whether the app's `CommandPalette` is open, for `openCommandPalette()`. */
export const commandPalette = $state({ open: false });

/** Opens the app's `CommandPalette`. */
export function openCommandPalette(): void {
	commandPalette.open = true;
}
