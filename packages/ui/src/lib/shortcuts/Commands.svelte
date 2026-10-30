<script module lang="ts">
	/**
	 * The command ids of the scopes a key event has passed through, which replace the
	 * commands of the same id in the scopes it reaches next, even when disabled.
	 */
	const overriddenIds = new WeakMap<Event, Set<string>>();
</script>

<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<!--
  @component
  A command scope: runs its commands when their keyboard shortcuts are pressed while the
  focus is inside it (or anywhere in the window with `global`), and offers them to
  `useCommands()` and the command palette. Inner scopes override outer commands with the
  same id. Shortcuts without Control, Alt or Meta are ignored while typing in a text
  field, and the chords of a sequence must follow each other within `sequenceTimeout`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import type { OperatingSystem } from '../foundation/platform.js';
	import { useSystemSettings } from '../foundation/system-scope.js';
	import { isEditableTarget } from '../internal/keyboard.js';
	import {
		isCommandEnabled,
		setCommandScope,
		shortcutConflicts,
		type Command
	} from './commands.js';
	import { KeyChord, Shortcut } from './shortcut.js';

	interface Props {
		/** The commands of this scope. */
		commands: readonly Command[];
		/** The longest wait between the chords of a sequence, in milliseconds. Defaults to 1000. */
		sequenceTimeout?: number;
		/** Whether the shortcuts work anywhere in the window instead of only with the focus inside. */
		global?: boolean;
		/** The system whose primary modifier the shortcuts use. Defaults to the running one. */
		platform?: OperatingSystem;
		/** The content the commands apply to. */
		children?: Snippet;
	}

	let { commands, sequenceTimeout = 1000, global = false, platform, children }: Props = $props();

	setCommandScope(() => commands);
	const system = useSystemSettings();
	let os = $derived(platform ?? system.current.platform.os);

	let pending: KeyChord[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const [clash] = shortcutConflicts(commands, os);
		if (clash)
			console.error(
				`The shortcuts of the commands "${clash[0].id}" and "${clash[1].id}" clash.`
			);
	});

	$effect(() => () => clearTimeout(timer));

	/** Drops the pending chords of a sequence. */
	function reset() {
		clearTimeout(timer);
		pending = [];
	}

	/**
	 * Runs the command whose shortcut the pending chords plus `chord` complete, or keeps
	 * `chord` pending when it continues a longer shortcut. Returns whether it used the key.
	 */
	function match(chord: KeyChord, typing: boolean, overridden: ReadonlySet<string>): boolean {
		const sequence = new Shortcut([...pending, chord]);
		const own = commands.filter(
			(command) =>
				isCommandEnabled(command) &&
				!overridden.has(command.id) &&
				command.shortcut &&
				(!typing || command.shortcut.chords[0]?.hasCommandModifier)
		);
		const done = own.find((command) => command.shortcut?.matches(sequence, os));
		if (done) {
			reset();
			done.onInvoke();
			return true;
		}
		if (own.some((command) => command.shortcut?.startsWith(sequence, os))) {
			pending.push(chord);
			clearTimeout(timer);
			timer = setTimeout(reset, sequenceTimeout);
			return true;
		}
		return false;
	}

	function onkeydown(event: KeyboardEvent) {
		const overridden = overriddenIds.get(event) ?? new Set<string>();
		const ids = new Set([...overridden, ...commands.map((command) => command.id)]);
		overriddenIds.set(event, ids);
		if (event.defaultPrevented || event.isComposing || KeyChord.isModifierKey(event.key))
			return;
		const chord = KeyChord.fromEvent(event);
		const typing = isEditableTarget(event.target);
		let used = match(chord, typing, overridden);
		if (!used && pending.length > 0) {
			// The pending sequence doesn't continue with this key; it may start a new one.
			reset();
			used = match(chord, typing, overridden);
		}
		if (used) event.preventDefault();
	}

	function listen(node: HTMLElement) {
		return global ? on(window, 'keydown', onkeydown) : on(node, 'keydown', onkeydown);
	}
</script>

<div class="oito2-commands" {@attach listen}>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-commands {
			display: contents;
		}
	}
</style>
