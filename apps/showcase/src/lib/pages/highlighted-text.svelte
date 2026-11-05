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
	import { HighlightedText, SearchField, highlightRanges } from '@oito2/ui';

	const settings = [
		'Configurações de ação e configuração de acesso',
		'Appearance: accent color, dark style and fonts',
		'Notifications and do not disturb',
		'Keyboard shortcuts for actions',
		'Privacy and access to the camera'
	];

	let query = $state('acao config');
	let matches = $derived(
		query.trim() === ''
			? settings
			: settings.filter((each) => highlightRanges(each, query).length > 0)
	);
</script>

<main class="showcase-page">
	<p>
		<code>HighlightedText</code> shows text with the matches of a search <code>query</code>
		emphasized, such as search results that show why each item matched. Matches are
		<code>mark</code> elements in bold text-safe primary, without a fill.
	</p>

	<section aria-labelledby="highlighted-text-search">
		<h2 id="highlighted-text-search">Search results</h2>
		<p>
			Each word of the query matches separately, ignoring case and accents, so "acao" finds
			"ação"; overlapping matches merge. The list keeps the settings for which the exported
			<code>highlightRanges</code> finds a match.
		</p>
		<div class="search">
			<SearchField bind:value={query} aria-label="Search settings" />
		</div>
		<ul class="results">
			{#each matches as each (each)}
				<li><HighlightedText text={each} {query} /></li>
			{:else}
				<li class="note">No setting matches.</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="highlighted-text-options">
		<h2 id="highlighted-text-options">Matching options</h2>
		<p>
			<code>queries</code> adds more terms, <code>splitWords=&#123;false&#125;</code> matches
			the query as one phrase, <code>wholeWords</code> skips matches inside words,
			<code>matchAll=&#123;false&#125;</code> keeps only the first match and
			<code>ignoreCase=&#123;false&#125;</code> respects case and accents.
		</p>
		<dl class="options">
			<dt>Default</dt>
			<dd><HighlightedText text="The cat sat on the category mat" query="cat mat" /></dd>
			<dt><code>queries</code></dt>
			<dd>
				<HighlightedText
					text="The cat sat on the category mat"
					query="cat"
					queries={['sat']}
				/>
			</dd>
			<dt><code>splitWords=&#123;false&#125;</code></dt>
			<dd>
				<HighlightedText
					text="The cat sat on the category mat"
					query="cat sat"
					splitWords={false}
				/>
			</dd>
			<dt><code>wholeWords</code></dt>
			<dd>
				<HighlightedText text="The cat sat on the category mat" query="cat" wholeWords />
			</dd>
			<dt><code>matchAll=&#123;false&#125;</code></dt>
			<dd>
				<HighlightedText
					text="The cat sat on the category mat"
					query="cat"
					matchAll={false}
				/>
			</dd>
			<dt><code>ignoreCase=&#123;false&#125;</code></dt>
			<dd>
				<HighlightedText text="Ação, acao e AÇÃO" query="ação" ignoreCase={false} />
			</dd>
		</dl>
	</section>
</main>

<style>
	.search {
		max-width: 320px;
	}

	.results {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.options {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--oito2-space-sm) var(--oito2-space-lg);
		margin: 0;
	}

	.options dt {
		color: var(--oito2-color-on-surface-variant);
	}

	.options dd {
		margin: 0;
	}
</style>
