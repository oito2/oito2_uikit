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

<script lang="ts">
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import House from '@lucide/svelte/icons/house';
	import Moon from '@lucide/svelte/icons/moon';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import Save from '@lucide/svelte/icons/save';
	import Search from '@lucide/svelte/icons/search';
	import Sun from '@lucide/svelte/icons/sun';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Trash from '@lucide/svelte/icons/trash';
	import {
		Button,
		CommandPalette,
		Commands,
		Shortcut,
		ShortcutLabel,
		Switch,
		openCommandPalette,
		toast,
		type Command
	} from '@oito2/ui';

	const paletteShortcut = Shortcut.parse('Mod+K');

	let lastRun = $state('none');
	let hasSelection = $state(false);
	let sidebar = $state(true);
	let otherOpen = $state(false);

	/** Records `label` as the last command run. */
	function ran(label: string) {
		lastRun = label;
	}

	let commands: Command[] = $derived([
		{
			id: 'new-file',
			label: 'New file',
			group: 'File',
			icon: FilePlus,
			description: 'Creates an empty document',
			onInvoke: () => ran('New file')
		},
		{
			id: 'save',
			label: 'Save',
			group: 'File',
			icon: Save,
			shortcut: Shortcut.parse('Mod+S'),
			onInvoke: () => {
				ran('Save');
				toast({ title: 'Saved', type: 'success' });
			}
		},
		{
			id: 'find',
			label: 'Find in page',
			group: 'Edit',
			icon: Search,
			keywords: ['search', 'look up'],
			shortcut: Shortcut.parse('Mod+F'),
			onInvoke: () => ran('Find in page')
		},
		{
			id: 'delete',
			label: 'Delete selection',
			group: 'Edit',
			icon: Trash,
			shortcut: Shortcut.parse('Delete'),
			enabled: hasSelection,
			onInvoke: () => ran('Delete selection')
		},
		{
			id: 'sidebar',
			label: sidebar ? 'Hide sidebar' : 'Show sidebar',
			group: 'View',
			icon: PanelLeft,
			shortcut: Shortcut.parse('Mod+B'),
			onInvoke: () => {
				sidebar = !sidebar;
				ran('Toggle sidebar');
			}
		},
		{
			id: 'home',
			label: 'Go home',
			group: 'Navigation',
			icon: House,
			shortcut: Shortcut.parse('G H'),
			onInvoke: () => ran('Go home')
		},
		{
			id: 'palette',
			label: 'Show all commands',
			icon: Terminal,
			shortcut: paletteShortcut,
			onInvoke: () => openCommandPalette()
		}
	]);

	const themeCommands: Command[] = [
		{
			id: 'light',
			label: 'Light theme',
			icon: Sun,
			onInvoke: () => toast('Light theme chosen')
		},
		{
			id: 'dark',
			label: 'Dark theme',
			icon: Moon,
			onInvoke: () => toast('Dark theme chosen')
		}
	];
</script>

<main class="showcase-page">
	<p>
		<code>Commands</code> is a scope of named actions: it runs each command when its shortcut is
		pressed while the focus is inside it, and offers them to <code>CommandPalette</code>. The
		palette is a searchable dialog: every typed word must match the label, description, group or
		keywords; Up and Down move, Enter runs, Escape closes. <code>openCommandPalette()</code> opens
		it from code.
	</p>

	<Commands {commands}>
		<section aria-labelledby="command-palette-scope">
			<h2 id="command-palette-scope">A command scope</h2>
			<p>
				Focus a control in this section, then press a shortcut, or open the palette and
				search.
				<kbd>G</kbd> then <kbd>H</kbd> is a sequence: the second key must follow within a second.
			</p>
			<div class="row">
				<Button onclick={() => openCommandPalette()}>Open the palette</Button>
				<ShortcutLabel shortcut={paletteShortcut} />
				<label class="row">Something selected <Switch bind:checked={hasSelection} /></label>
			</div>
			<p class="note">
				Last command: {lastRun} · Sidebar: {sidebar ? 'shown' : 'hidden'} · “Delete selection”
				is {hasSelection ? 'enabled' : 'disabled, so the palette leaves it out'}.
			</p>
		</section>
		<CommandPalette />
	</Commands>

	<section aria-labelledby="command-palette-bound">
		<h2 id="command-palette-bound">A palette with its own commands</h2>
		<p>
			With <code>commands</code> the palette lists exactly those, wherever it is placed; with
			a bound <code>open</code> it opens only from that state.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (otherOpen = true)}>Choose a theme</Button>
		</div>
		<CommandPalette bind:open={otherOpen} commands={themeCommands} />
	</section>
</main>

<style>
	kbd {
		padding: 0 var(--oito2-space-xs);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-small);
		font: inherit;
	}
</style>
