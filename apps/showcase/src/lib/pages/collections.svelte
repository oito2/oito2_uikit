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
	import { resolve } from '$app/paths';
	import {
		AsyncListController,
		Button,
		CircularProgress,
		ListCollection,
		SegmentGroup,
		SelectionController,
		TextField,
		TreeCollection,
		type AsyncListRequest,
		type SortDescriptor
	} from '@oito2/ui';
	import { onDestroy } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	interface Fruit {
		readonly name: string;
		readonly kind: string;
	}

	const fruits = new ListCollection<Fruit>(
		[
			{ name: 'Apple', kind: 'Pome' },
			{ name: 'Pêra', kind: 'Pome' },
			{ name: 'Quince', kind: 'Pome' },
			{ name: 'Apricot', kind: 'Stone fruit' },
			{ name: 'Cherry', kind: 'Stone fruit' },
			{ name: 'Plum', kind: 'Stone fruit' },
			{ name: 'Banana', kind: 'Tropical' },
			{ name: 'Mango', kind: 'Tropical' },
			{ name: 'Maçã-verde', kind: 'Tropical' }
		],
		{
			getValue: (fruit) => fruit.name,
			getGroup: (fruit) => fruit.kind,
			isDisabled: (fruit) => fruit.name === 'Banana'
		}
	);
	let query = $state('');
	let visible = $derived(fruits.filter(query));

	const single = new SelectionController(fruits);
	const multiple = new SelectionController(fruits, { mode: 'multiple' });
	let mode = $state<'single' | 'multiple'>('multiple');
	let selection = $derived(mode === 'single' ? single : multiple);

	/** Applies a click with the desktop modifiers: Shift extends, Control or Command toggles. */
	function click(value: string, event: MouseEvent) {
		selection.click(value, { extend: event.shiftKey, toggle: event.ctrlKey || event.metaKey });
	}

	const tree = TreeCollection.fromPaths([
		'src/app.ts',
		'src/widgets/button.ts',
		'src/widgets/field.ts',
		'src/widgets/índice.ts',
		'test/app.test.ts',
		'test/widgets.test.ts',
		'README.md'
	]);
	const expanded = new SvelteSet(['src']);
	let treeQuery = $state('');
	let shownTree = $derived(treeQuery.trim() ? tree.search(treeQuery.trim()) : tree);
	let shownExpanded = $derived(
		treeQuery.trim() ? new Set(shownTree.branchValues) : (expanded as ReadonlySet<string>)
	);
	let activeNode = $state<string | null>(null);

	/** Expands or collapses the branch `value`. */
	function toggle(value: string) {
		if (expanded.has(value)) expanded.delete(value);
		else expanded.add(value);
	}

	const pageSize = 20;
	const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];
	const all = Array.from({ length: 100 }, (_, index) => `Item ${index + 1} ${words[index % 5]}`);

	/** Serves a page of the hundred items after a pause, as a server would. */
	async function load(request: AsyncListRequest<number>) {
		await new Promise((done) => setTimeout(done, 600));
		const needle = request.filterText.trim().toLowerCase();
		let matches = all.filter((item) => item.toLowerCase().includes(needle));
		if (request.sort) matches = sortItems(matches, request.sort);
		const start = request.cursor ?? 0;
		const end = start + pageSize;
		return { items: matches.slice(start, end), cursor: end < matches.length ? end : null };
	}

	/** Sorts the items by name in the direction of `sort`. */
	function sortItems(items: string[], sort: SortDescriptor) {
		const sign = sort.direction === 'ascending' ? 1 : -1;
		return items.sort((a, b) => sign * a.localeCompare(b, undefined, { numeric: true }));
	}

	const remote = new AsyncListController<string, number>({ load });
	void remote.reload();
	let remoteFilter = $state('');

	onDestroy(() => remote.dispose());
</script>

<main class="showcase-page">
	<p>
		Collections are the models behind lists, selects, trees and tables: plain classes, no
		components. <code>ListCollection</code> and <code>TreeCollection</code> hold items and
		answer lookups; <code>SelectionController</code> tracks a selection with the desktop
		gestures; <code>AsyncListController</code> loads a list page by page. Components such as
		<a href={resolve('/[slug]', { slug: 'list-box' })}>ListBox</a> and
		<a href={resolve('/[slug]', { slug: 'tree-view' })}>TreeView</a> build on them.
	</p>

	<section aria-labelledby="collections-list">
		<h2 id="collections-list">List collection</h2>
		<p>
			Items with a value, a label, a disabled flag and a group. <code>filter</code> ignores case
			and accents: “maca” finds “Maçã-verde”.
		</p>
		<div class="collections-field">
			<TextField
				bind:value={query}
				aria-label="Filter fruits"
				placeholder="Filter, ignoring accents"
			/>
		</div>
		<div class="row top">
			{#each visible.groups as group (group.group)}
				<div class="column collections-group">
					<h3>{group.group}</h3>
					<ul class="collections-list">
						{#each group.items as fruit (fruit.name)}
							<li class:collections-disabled={fruits.isDisabled(fruit)}>
								{fruit.name}{fruits.isDisabled(fruit) ? ' (disabled)' : ''}
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="note">No fruit matches.</p>
			{/each}
		</div>
		<p class="note">
			{visible.length} of {fruits.length} items. First enabled: {visible.firstValue ??
				'none'}, last:
			{visible.lastValue ?? 'none'}.
		</p>
	</section>

	<section aria-labelledby="collections-selection">
		<h2 id="collections-selection">Selection controller</h2>
		<p>
			Click to select, Shift+click to extend a range from the anchor and Ctrl+click (⌘ on a
			Mac) to toggle. Disabled items are never selected.
		</p>
		<div class="row">
			<SegmentGroup.Root bind:value={mode} aria-label="Selection mode">
				<SegmentGroup.Item value="single">Single</SegmentGroup.Item>
				<SegmentGroup.Item value="multiple">Multiple</SegmentGroup.Item>
			</SegmentGroup.Root>
			<Button
				variant="outlined"
				disabled={mode === 'single'}
				onclick={() => selection.selectAll()}>Select all</Button
			>
			<Button variant="text" disabled={selection.isEmpty} onclick={() => selection.clear()}
				>Clear</Button
			>
		</div>
		<ul class="collections-list collections-choices">
			{#each fruits.items as fruit (fruit.name)}
				<li>
					<button
						aria-pressed={selection.isSelected(fruit.name)}
						disabled={fruits.isDisabled(fruit)}
						onclick={(event) => click(fruit.name, event)}>{fruit.name}</button
					>
				</li>
			{/each}
		</ul>
		<p role="status">
			Selected: {selection.selectedValues.join(', ') || 'none'}. Anchor: {selection.anchorValue ??
				'none'}.
		</p>
	</section>

	<section aria-labelledby="collections-tree">
		<h2 id="collections-tree">Tree collection</h2>
		<p>
			<code>TreeCollection.fromPaths</code> builds a tree from file paths;
			<code>visible</code>
			lists the rows under the expanded branches, and <code>search</code> keeps the matches with
			their ancestors.
		</p>
		<div class="collections-field">
			<TextField
				bind:value={treeQuery}
				aria-label="Search files"
				placeholder="Search files"
			/>
		</div>
		<ul class="collections-list collections-tree">
			{#each shownTree.visible(shownExpanded) as entry (entry.node.value)}
				<li style:padding-inline-start="{entry.depth * 20}px">
					{#if entry.node.children}
						<button
							aria-expanded={shownExpanded.has(entry.node.value)}
							disabled={treeQuery.trim() !== ''}
							onclick={() => toggle(entry.node.value)}
							>{shownExpanded.has(entry.node.value) ? '▾' : '▸'}
							{entry.node.label}</button
						>
					{:else}
						<button
							aria-pressed={activeNode === entry.node.value}
							onclick={() => (activeNode = entry.node.value)}
							>{entry.node.label}</button
						>
					{/if}
				</li>
			{/each}
		</ul>
		<p class="note">
			{#if activeNode}
				{activeNode}: depth {tree.depthOf(activeNode)}, inside {tree
					.ancestorsOf(activeNode)
					.join(' › ') || 'the top level'}.
			{:else}
				Pick a file.
			{/if}
		</p>
	</section>

	<section aria-labelledby="collections-async">
		<h2 id="collections-async">Async list controller</h2>
		<p>
			A hundred items served twenty at a time, with a delay. Typing a filter reloads; a newer
			load cancels the one still running.
		</p>
		<div class="row">
			<div class="collections-field">
				<TextField
					bind:value={remoteFilter}
					aria-label="Filter items"
					placeholder="Filter, such as echo"
					oninput={() => void remote.setFilterText(remoteFilter)}
				/>
			</div>
			<Button
				variant="outlined"
				onclick={() =>
					void remote.setSort({
						column: 'name',
						direction:
							remote.sortDescriptor?.direction === 'ascending'
								? 'descending'
								: 'ascending'
					})}
				>Sort {remote.sortDescriptor?.direction === 'ascending'
					? 'descending'
					: 'ascending'}</Button
			>
			<Button variant="text" onclick={() => void remote.reload()}>Reload</Button>
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="collections-scroll" role="region" aria-label="Loaded items" tabindex="0">
			<ul class="collections-list">
				{#each remote.items as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
		<div class="row">
			{#if remote.isLoading || remote.isLoadingMore}
				<CircularProgress label="Loading" size={20} />
			{/if}
			<span class="note" role="status">
				{remote.isLoading
					? 'Loading…'
					: `${remote.items.length} items loaded`}{remote.hasMore
					? ', more available'
					: ''}.
			</span>
			<Button
				variant="tonal"
				disabled={!remote.hasMore || remote.isLoading || remote.isLoadingMore}
				onclick={() => void remote.loadMore()}>Load more</Button
			>
		</div>
	</section>
</main>

<style>
	.collections-field {
		max-width: 320px;
	}

	.collections-group {
		min-width: 140px;
	}

	.collections-list {
		display: grid;
		gap: var(--oito2-space-xxs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.collections-disabled {
		color: var(--oito2-color-on-surface-variant);
	}

	.collections-choices,
	.collections-tree {
		max-width: 260px;
	}

	.collections-choices button,
	.collections-tree button {
		width: 100%;
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
		border: 0;
		border-radius: var(--oito2-radius-small);
		background: transparent;
		color: var(--oito2-color-on-surface);
		font: inherit;
		text-align: start;
	}

	.collections-choices button:hover:not(:disabled),
	.collections-tree button:hover:not(:disabled) {
		background: var(--oito2-color-surface-container-high);
	}

	.collections-choices button:disabled {
		color: var(--oito2-color-on-surface-variant);
	}

	.collections-choices button[aria-pressed='true'],
	.collections-tree button[aria-pressed='true'] {
		background: var(--oito2-color-selected-fill);
		color: var(--oito2-color-on-selected-fill);
	}

	.collections-choices button:focus-visible,
	.collections-tree button:focus-visible {
		outline: 2px solid var(--oito2-color-primary-text);
	}

	.collections-scroll {
		max-width: 320px;
		max-height: 240px;
		overflow: auto;
		padding: var(--oito2-space-sm);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}
</style>
