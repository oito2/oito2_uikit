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
	import Funnel from '@lucide/svelte/icons/funnel';
	import { HeaderBar, HighlightedText, SearchField, SearchTitleField } from '@oito2/ui';

	const documents = [
		'Budget 2026.ods',
		'Meeting notes.txt',
		'Holiday photos',
		'Invoice March.pdf'
	];

	let query = $state('');
	let event = $state('none');
	let filter = $state('');
	let titleSearch = $state(false);
	let titleQuery = $state('');
	let found = $derived(
		documents.filter((each) => each.toLowerCase().includes(titleQuery.trim().toLowerCase()))
	);
</script>

<main class="showcase-page">
	<p>
		<code>SearchField</code> is a search text field with a search icon and a clear button that
		shows while it has text. <code>SearchTitleField</code> is a title bar element that switches between
		a title and a search field, as in GNOME apps.
	</p>

	<section aria-labelledby="search-field-basic">
		<h2 id="search-field-basic">Search field</h2>
		<p>
			Escape clears the text; Escape again on the empty field calls <code>onEscape</code>.
			<code>onSubmit</code> runs on Enter and <code>onClear</code> when the clear button or Escape
			empties the field. The hint and the clear button label follow the active locale.
		</p>
		<div class="field">
			<SearchField
				bind:value={query}
				onSubmit={(value) => (event = `submitted "${value}"`)}
				onClear={() => (event = 'cleared')}
				onEscape={() => (event = 'escape on the empty field')}
				aria-label="Search the documentation"
			/>
		</div>
		<p class="note">Text: {query || '(empty)'} · Last event: {event}</p>
	</section>

	<section aria-labelledby="search-field-icon">
		<h2 id="search-field-icon">Custom icon and states</h2>
		<p>
			The <code>icon</code> snippet replaces the search icon; a disabled field can't be used.
		</p>
		<div class="fields">
			<SearchField bind:value={filter} placeholder="Filter files" aria-label="Filter files">
				{#snippet icon()}<Funnel size={18} aria-hidden="true" />{/snippet}
			</SearchField>
			<SearchField value="Not now" disabled aria-label="Search (disabled)" />
		</div>
	</section>

	<section aria-labelledby="search-field-title">
		<h2 id="search-field-title">Search in the title</h2>
		<p>
			<code>SearchTitleField</code> keeps the same size in both states. Press the search
			button to open the field; Escape on the empty field closes it and returns focus to the
			button. Bind
			<code>searchActive</code> and <code>value</code>.
		</p>
		<HeaderBar>
			{#snippet title()}
				<SearchTitleField
					title="Documents"
					bind:searchActive={titleSearch}
					bind:value={titleQuery}
					placeholder="Search documents"
					toggleLabel="Search documents"
				/>
			{/snippet}
		</HeaderBar>
		<ul class="results">
			{#each found as each (each)}
				<li><HighlightedText text={each} query={titleQuery} /></li>
			{:else}
				<li class="note">No document matches.</li>
			{/each}
		</ul>
		<p class="note">Search {titleSearch ? 'open' : 'closed'}</p>
	</section>
</main>

<style>
	.field {
		max-width: 320px;
	}

	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 300px));
		gap: var(--oito2-space-md);
	}

	.results {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
