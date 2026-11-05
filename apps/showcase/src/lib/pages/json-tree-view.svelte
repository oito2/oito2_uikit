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
	import { JsonTreeView, SearchField, Slider } from '@oito2/ui';

	const manifest = {
		name: '@oito2/ui',
		version: '0.0.0',
		private: false,
		keywords: ['svelte', 'tauri', 'design-system'],
		exports: { '.': './dist/index.js', './icons': './dist/icons/index.js' },
		engines: { node: '>=24' },
		sideEffects: ['**/*.css'],
		funding: null
	};

	const releases = [
		{ tag: 'v0.1.0', date: '2026-06-01', assets: 4, notes: { added: 12, fixed: 3 } },
		{ tag: 'v0.2.0', date: '2026-08-15', assets: 6, notes: { added: 8, fixed: 11 } },
		{ tag: 'v0.3.0', date: '2026-10-30', assets: 6, notes: { added: 5, fixed: 7 } }
	];

	let query = $state('');
	let depth = $state(1);
</script>

<main class="showcase-page">
	<p>
		<code>JsonTreeView</code> shows decoded JSON as a tree: keys, strings, numbers, booleans and
		null in the theme's syntax colors, with the size of each object and array. It has the
		keyboard of <code>TreeView</code>, and <code>query</code> filters by key and value.
	</p>

	<section aria-labelledby="json-tree-view-filter">
		<h2 id="json-tree-view-filter">Filtering</h2>
		<p>Try <code>dist</code>, <code>svelte</code> or <code>null</code>.</p>
		<SearchField bind:value={query} aria-label="Filter keys and values" placeholder="Filter" />
		<JsonTreeView
			data={manifest}
			{query}
			expandDepth={2}
			rootLabel="package.json"
			aria-label="package.json"
			class="json-tree-view-panel"
		/>
	</section>

	<section aria-labelledby="json-tree-view-depth">
		<h2 id="json-tree-view-depth">Open depth</h2>
		<p>
			Branches up to <code>expandDepth</code> levels deep start open, and open to it again when
			it changes. The root here is an array.
		</p>
		<div class="row">
			<Slider bind:value={depth} min={0} max={3} divisions={3} label="Open depth" />
			<span class="note">{depth} levels</span>
		</div>
		<JsonTreeView
			data={releases}
			expandDepth={depth}
			rootLabel="releases"
			aria-label="Releases"
			class="json-tree-view-panel"
		/>
	</section>
</main>

<style>
	:global(.json-tree-view-panel) {
		width: min(480px, 100%);
		height: 320px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}
</style>
