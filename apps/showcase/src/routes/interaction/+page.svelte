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
	import {
		Commands,
		ListCollection,
		SelectionController,
		Shortcut,
		TreeCollection,
		edgeFocus,
		focusBorder,
		type Command
	} from '@oito2/ui';
	import { SvelteSet } from 'svelte/reactivity';
	import CommandList from './CommandList.svelte';

	let log: string[] = $state([]);
	const run = (name: string) => () => (log = [name, ...log].slice(0, 5));

	const commands: Command[] = [
		{
			id: 'palette',
			label: 'Open the command palette',
			shortcut: Shortcut.parse('Mod+K'),
			onInvoke: run('Command palette')
		},
		{ id: 'home', label: 'Go home', shortcut: Shortcut.parse('G H'), onInvoke: run('Go home') },
		{
			id: 'theme',
			label: 'Toggle dark style',
			shortcut: Shortcut.parse('Mod+Shift+L'),
			onInvoke: run('Toggle dark style')
		}
	];

	const fruits = new ListCollection(['Apple', 'Banana', 'Cherry', 'Pêra', 'Plum', 'Quince'], {
		isDisabled: (fruit) => fruit === 'Banana'
	});
	let query = $state('');
	let visible = $derived(fruits.filter(query));
	const selection = new SelectionController(fruits, { mode: 'multiple' });

	const tree = TreeCollection.fromPaths([
		'src/app.ts',
		'src/widgets/button.ts',
		'src/widgets/field.ts',
		'test/app.test.ts',
		'README.md'
	]);
	const expanded = new SvelteSet(['src']);

	function click(value: string, event: MouseEvent) {
		selection.click(value, { extend: event.shiftKey, toggle: event.ctrlKey || event.metaKey });
	}

	function toggle(value: string) {
		if (expanded.has(value)) expanded.delete(value);
		else expanded.add(value);
	}
</script>

<main>
	<h1>Interaction</h1>
	<p>
		Phase F3 adds the interaction infrastructure: keyboard shortcuts and command scopes, focus
		helpers, and the list and tree collections the components build on.
	</p>

	<section>
		<h2>Commands and shortcuts</h2>
		<p>
			Focus a control on this page and press a shortcut. Sequences such as G H need both keys
			within a second.
		</p>
		<Commands {commands} global>
			<CommandList />
		</Commands>
		<p class="log" aria-live="polite">
			{log.length ? `Ran: ${log.join(' · ')}` : 'Nothing ran yet.'}
		</p>
	</section>

	<section>
		<h2>Focus border and edge focus</h2>
		<p>
			Tab into the grid, then move with the arrow keys: focus stops at the edges, and the ring
			shows only for the keyboard.
		</p>
		<div class="grid" {@attach edgeFocus()} {@attach focusBorder({ radius: 'large' })}>
			{#each Array.from({ length: 9 }, (_, i) => i + 1) as n (n)}
				<button>{n}</button>
			{/each}
		</div>
	</section>

	<section>
		<h2>List collection and selection</h2>
		<p>
			Click to select, Shift+click for a range and Ctrl+click (⌘ on a Mac) to toggle. Banana
			is disabled.
		</p>
		<input placeholder="Filter, ignoring accents" bind:value={query} />
		<ul class="list">
			{#each visible.items as fruit (fruit)}
				<li>
					<button
						class:selected={selection.isSelected(fruit)}
						disabled={fruits.isDisabled(fruit)}
						onclick={(event) => click(fruit, event)}>{fruit}</button
					>
				</li>
			{/each}
		</ul>
		<p>Selected: {selection.selectedValues.join(', ') || 'none'}</p>
	</section>

	<section>
		<h2>Tree collection</h2>
		<ul class="tree">
			{#each tree.visible(expanded) as entry (entry.node.value)}
				<li style:padding-inline-start="{entry.depth * 16}px">
					{#if entry.node.children}
						<button onclick={() => toggle(entry.node.value)}
							>{expanded.has(entry.node.value) ? '▾' : '▸'} {entry.node.label}</button
						>
					{:else}
						<span>{entry.node.label}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-lg);
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	.log {
		color: var(--oito2-color-on-surface-variant);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 48px);
		gap: var(--oito2-space-sm);
		width: max-content;
		padding: var(--oito2-space-sm);
	}

	.list,
	.tree {
		display: grid;
		gap: var(--oito2-space-xxs);
		margin: var(--oito2-space-sm) 0;
		padding: 0;
		list-style: none;
		max-width: 240px;
	}

	.list button {
		width: 100%;
		text-align: start;
	}

	.selected {
		background: var(--oito2-color-primary);
		color: var(--oito2-color-on-primary);
	}
</style>
