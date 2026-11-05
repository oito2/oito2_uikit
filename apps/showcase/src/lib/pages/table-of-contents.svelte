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
	import { TableOfContents, type TocEntry } from '@oito2/ui';

	const entries: TocEntry[] = [
		{ id: 'table-of-contents-intro', title: 'Introduction' },
		{ id: 'table-of-contents-setup', title: 'Setup' },
		{ id: 'table-of-contents-linux', title: 'Linux', depth: 1 },
		{ id: 'table-of-contents-windows', title: 'Windows', depth: 1 },
		{ id: 'table-of-contents-macos', title: 'macOS', depth: 1 },
		{ id: 'table-of-contents-usage', title: 'Usage' },
		{ id: 'table-of-contents-faq', title: 'Questions' }
	];

	let view = $state<HTMLElement | null>(null);
	let active = $state(0);
	let picked = $state('none yet');
</script>

<main class="showcase-page">
	<p>
		A table of contents lists the sections of a scrolling view, highlights the one in view and
		scrolls to a section when it is picked. Each entry points at its heading by element id, and
		<code>depth</code> indents the entries of subsections. The view is
		<code>scrollContainer</code>, or the page when it isn't given.
	</p>

	<section aria-labelledby="table-of-contents-demo">
		<h2 id="table-of-contents-demo">Following a scrolling view</h2>
		<p>Scroll the document on the right, or pick an entry on the left.</p>
		<div class="frame">
			<TableOfContents
				{entries}
				scrollContainer={view}
				bind:active
				onSelect={(index) => (picked = entries[index]?.title ?? '')}
				aria-label="Contents of the sample document"
			/>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="document"
				bind:this={view}
				tabindex="0"
				role="region"
				aria-label="Sample document"
			>
				{#each entries as entry (entry.id)}
					<h3 id={entry.id} class:sub={entry.depth}>{entry.title}</h3>
					<p>
						The {entry.title} section. Scroll this view to move the highlight in the list
						beside it.
					</p>
				{/each}
			</div>
		</div>
		<p>In view: {entries[active]?.title}. Last picked: {picked}.</p>
	</section>
</main>

<style>
	.frame {
		display: flex;
		gap: var(--oito2-space-md);
		height: 320px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.frame > :global(nav) {
		flex: none;
		width: 200px;
		padding: var(--oito2-space-md) 0;
		overflow-y: auto;
	}

	.document {
		flex: 1;
		min-width: 0;
		padding: var(--oito2-space-md);
		overflow-y: auto;
	}

	.document h3 {
		margin: 0 0 var(--oito2-space-sm);
	}

	.document h3.sub {
		font: var(--oito2-type-title-small);
	}

	.document p {
		min-height: 180px;
		margin: 0;
		color: var(--oito2-color-on-surface-variant);
	}
</style>
