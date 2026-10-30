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

import { getContext, hasContext, setContext, type Component } from 'svelte';
import type { OperatingSystem } from '../foundation/platform.js';
import type { Shortcut } from './shortcut.js';

/**
 * An action an app offers: run from its keyboard shortcut inside a `Commands` scope, or
 * from the command palette.
 */
export interface Command {
	/** A unique identifier; an inner `Commands` scope overrides an outer command with the same id. */
	readonly id: string;
	/** The name shown in the command palette. */
	readonly label: string;
	/** Called when the command runs, from its shortcut or the command palette. */
	readonly onInvoke: () => void;
	/** The keyboard shortcut, if any. */
	readonly shortcut?: Shortcut;
	/** A longer explanation shown in the command palette. */
	readonly description?: string;
	/** The palette group, such as "Navigation" or "View". */
	readonly group?: string;
	/** An icon component shown in the command palette. */
	readonly icon?: Component;
	/** Extra words the palette search matches. */
	readonly keywords?: readonly string[];
	/**
	 * Whether the command can run now; disabled commands neither react to their shortcut
	 * nor appear in the command palette. Defaults to true.
	 */
	readonly enabled?: boolean;
}

/** Whether `command` can run now. */
export function isCommandEnabled(command: Command): boolean {
	return command.enabled ?? true;
}

/**
 * Returns the pairs of `commands` whose shortcuts clash on `os`: the same shortcut, or
 * one that is a prefix of another (the longer one could never run).
 */
export function shortcutConflicts(
	commands: readonly Command[],
	os: OperatingSystem
): [Command, Command][] {
	const result: [Command, Command][] = [];
	commands.forEach((a, i) => {
		for (const b of commands.slice(i + 1)) {
			if (!a.shortcut || !b.shortcut) continue;
			if (a.shortcut.startsWith(b.shortcut, os) || b.shortcut.startsWith(a.shortcut, os)) {
				result.push([a, b]);
			}
		}
	});
	return result;
}

/** A `Commands` scope as seen by the scopes and components below it. */
export interface CommandScope {
	/** The commands of the scope. */
	readonly commands: readonly Command[];
	/** The enclosing scope, or `null` at the top. */
	readonly parent: CommandScope | null;
}

const key = Symbol('oito2.commands');

/**
 * Publishes a command scope to the components below the calling one and returns it.
 * `get` is called on every read, so a getter over a prop keeps it reactive. Must be called
 * during component initialization.
 */
export function setCommandScope(get: () => readonly Command[]): CommandScope {
	const parent = hasContext(key) ? getContext<CommandScope>(key) : null;
	const scope: CommandScope = {
		get commands() {
			return get();
		},
		parent
	};
	setContext(key, scope);
	return scope;
}

/** A live view of the commands available at a component. */
export interface CommandsRef {
	/**
	 * The enabled commands of every enclosing `Commands` scope, the innermost first, with
	 * inner commands replacing outer ones of the same id.
	 */
	readonly available: Command[];
}

/**
 * Returns the commands available at the calling component, as the command palette lists
 * them; empty outside every `Commands` scope. Must be called during component
 * initialization.
 */
export function useCommands(): CommandsRef {
	const scope = hasContext(key) ? getContext<CommandScope>(key) : null;
	return {
		get available() {
			return availableCommands(scope);
		}
	};
}

/**
 * Returns the enabled commands of `scope` and its parents, inner ones first; an enabled
 * inner command replaces the outer ones with its id.
 */
export function availableCommands(scope: CommandScope | null): Command[] {
	const result: Command[] = [];
	const ids = new Set<string>();
	for (let s = scope; s; s = s.parent) {
		for (const command of s.commands) {
			if (!isCommandEnabled(command) || ids.has(command.id)) continue;
			ids.add(command.id);
			result.push(command);
		}
	}
	return result;
}
