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
	import { Button, ListBox, ListCollection, SearchField, SelectionController } from '@oito2/ui';

	interface Language {
		id: string;
		name: string;
		family: string;
		year: number;
		legacy?: boolean;
	}

	const all: Language[] = [
		{ id: 'rust', name: 'Rust', family: 'Systems', year: 2015 },
		{ id: 'c', name: 'C', family: 'Systems', year: 1972, legacy: true },
		{ id: 'zig', name: 'Zig', family: 'Systems', year: 2016 },
		{ id: 'ts', name: 'TypeScript', family: 'Web', year: 2012 },
		{ id: 'svelte', name: 'Svelte', family: 'Web', year: 2016 },
		{ id: 'dart', name: 'Dart', family: 'Apps', year: 2011 },
		{ id: 'kotlin', name: 'Kotlin', family: 'Apps', year: 2016 }
	];

	const languages = new ListCollection<Language>(all, {
		getValue: (language) => language.id,
		getLabel: (language) => language.name,
		getGroup: (language) => language.family,
		isDisabled: (language) => language.legacy === true
	});
	const picked = new SelectionController(languages, {
		mode: 'multiple',
		initialValues: ['rust', 'svelte']
	});
	let activated = $state('none');

	const sizes = new ListCollection(['small', 'medium', 'large', 'huge']);
	let single = $state<readonly string[]>(['medium']);

	let query = $state('');
	let filtered = $derived(
		new ListCollection<Language>(
			all.filter((language) =>
				language.name.toLowerCase().includes(query.trim().toLowerCase())
			),
			{ getValue: (language) => language.id, getLabel: (language) => language.name }
		)
	);
</script>

<main class="showcase-page">
	<p>
		<code>ListBox</code> is a list the user selects from, with the items of a
		<code>ListCollection</code> and the selection in a <code>SelectionController</code>. The
		list takes the focus as a whole: the arrows, Home and End move the active row, letters jump
		to the next matching label, and Enter or a double click activates a row. Every row is
		rendered, so it suits lists of up to a few hundred items.
	</p>

	<section aria-labelledby="list-box-multiple">
		<h2 id="list-box-multiple">Multiple selection with groups</h2>
		<p>
			Space toggles the active row, Shift with the arrows extends the selection and Control+A
			selects all. C is disabled: it can't be selected or activated.
		</p>
		<div class="row top">
			<ListBox.Root
				collection={languages}
				controller={picked}
				aria-label="Languages"
				class="list-box-panel"
				onActivate={(language) => (activated = language.name)}
			>
				{#snippet item(language, selected)}
					<span class="list-box-row">
						<span>{language.name}</span>
						<span class="note">{selected ? 'selected' : language.year}</span>
					</span>
				{/snippet}
			</ListBox.Root>
			<div class="column">
				<p class="note">
					Selected: {picked.selectedValues.join(', ') || 'none'}<br />Activated: {activated}
				</p>
				<div class="row">
					<Button variant="text" onclick={() => picked.selectAll()}>Select all</Button>
					<Button variant="text" onclick={() => picked.clear()}>Clear</Button>
				</div>
			</div>
		</div>
	</section>

	<section aria-labelledby="list-box-parts">
		<h2 id="list-box-parts">Composed from parts</h2>
		<p>
			<code>ListBox.Item</code> and <code>ListBox.Group</code> lay the rows out by hand. In single
			mode the arrows select as they move.
		</p>
		<div class="row top">
			<ListBox.Root
				collection={sizes}
				defaultValues={['medium']}
				onValuesChange={(values) => (single = values)}
				aria-label="Size"
				class="list-box-panel"
			>
				<ListBox.Group label="Common">
					<ListBox.Item value="small" label="Small" />
					<ListBox.Item value="medium" label="Medium" />
					<ListBox.Item value="large" label="Large" />
				</ListBox.Group>
				<ListBox.Group label="Rare">
					<ListBox.Item value="huge">Huge <span class="note">(slow)</span></ListBox.Item>
				</ListBox.Group>
			</ListBox.Root>
			<p class="note">Size: {single.join(', ') || 'none'}</p>
		</div>
	</section>

	<section aria-labelledby="list-box-empty">
		<h2 id="list-box-empty">Filtering and the empty state</h2>
		<div class="column">
			<SearchField bind:value={query} aria-label="Filter languages" placeholder="Filter" />
			<ListBox.Root
				collection={filtered}
				aria-label="Filtered languages"
				class="list-box-panel"
			>
				{#snippet empty()}<span class="list-box-empty">No language matches “{query}”.</span
					>{/snippet}
			</ListBox.Root>
		</div>
	</section>
</main>

<style>
	:global(.list-box-panel) {
		width: 240px;
		max-height: 320px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}

	/* The note follows the row's text color, so it stays readable on the selected fill. */
	.list-box-row .note {
		color: inherit;
	}

	.list-box-row {
		display: flex;
		flex: 1;
		justify-content: space-between;
		gap: var(--oito2-space-sm);
	}

	.list-box-empty {
		display: block;
		padding: var(--oito2-space-md);
		color: var(--oito2-color-on-surface-variant);
	}
</style>
