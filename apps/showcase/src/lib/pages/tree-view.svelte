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
		Button,
		SearchField,
		Switch,
		TreeCollection,
		TreeController,
		TreeView,
		type TreeNode
	} from '@oito2/ui';
	import { freedesktopIcon } from '@oito2/ui/icons';

	let files = $state(
		TreeCollection.fromPaths<unknown>([
			'apps/showcase/src/routes/+layout.svelte',
			'apps/showcase/src/routes/[slug]/+page.svelte',
			'packages/ui/src/lib/index.ts',
			'packages/ui/src/lib/components/tree/TreeView.svelte',
			'packages/ui/package.json',
			'README.md',
			'LICENSE'
		]).insert(null, [{ value: 'remote', label: 'remote (loads on open)', children: [] }])
	);
	const fileTree = new TreeController({
		selectionMode: 'multiple',
		expanded: ['packages', 'packages/ui']
	});
	let checkable = $state(false);
	let query = $state('');
	let activated = $state('none');

	/** Adds three children to the branch `node` after a short wait. */
	async function loadChildren(node: TreeNode<unknown>) {
		await new Promise((resolve) => setTimeout(resolve, 900));
		files = files.insert(
			node.value,
			[1, 2, 3].map((n) => ({ value: `${node.value}/item-${n}`, label: `Item ${n}` }))
		);
	}

	/** Gives `node` its new label. */
	function rename(node: TreeNode<unknown>, label: string) {
		files = files.replace(node.value, { ...node, label });
	}

	const big = new TreeCollection(
		Array.from({ length: 100 }, (_, b) => ({
			value: `b${b}`,
			label: `Folder ${b + 1}`,
			children: Array.from({ length: 99 }, (_, l) => ({
				value: `b${b}/f${l}`,
				label: `File ${b + 1}.${l + 1}`
			}))
		}))
	);
	const bigTree = new TreeController({ expanded: ['b0', 'b1'] });
</script>

<main class="showcase-page">
	<p>
		<code>TreeView</code> shows a <code>TreeCollection</code> of nested nodes, with the open,
		selected and checked nodes kept in a <code>TreeController</code>. Up and Down move, Right
		and Left open, close and move between levels, F2 renames and Enter activates. Only the rows
		in view are rendered, so it handles thousands of nodes.
	</p>

	<section aria-labelledby="tree-view-files">
		<h2 id="tree-view-files">A file tree</h2>
		<p>
			The “remote” folder loads its children when it opens. Filtering shows the matches with
			their folders; check boxes check a folder with everything in it.
		</p>
		<div class="row">
			<SearchField bind:value={query} aria-label="Filter files" placeholder="Filter files" />
			<label class="row">Check boxes <Switch bind:checked={checkable} /></label>
			<Button variant="text" onclick={() => fileTree.expandAll(files)}>Expand all</Button>
			<Button variant="text" onclick={() => fileTree.collapseAll()}>Collapse all</Button>
		</div>
		<div class="row top">
			<TreeView
				collection={files}
				controller={fileTree}
				{checkable}
				{query}
				aria-label="Files"
				class="tree-view-panel"
				onLoadChildren={loadChildren}
				onRename={rename}
				onActivate={(node) => (activated = node.label ?? node.value)}
			>
				{#snippet icon(node, open)}
					{@const Glyph = freedesktopIcon(
						node.children ? (open ? 'folder-open' : 'folder') : 'text-x-generic'
					)}
					{#if Glyph}<Glyph aria-hidden="true" />{/if}
				{/snippet}
			</TreeView>
			<p class="note">
				Selected: {[...fileTree.selected].join(', ') || 'none'}<br />
				Checked: {fileTree.checked.size} nodes<br />
				Activated: {activated}
			</p>
		</div>
	</section>

	<section aria-labelledby="tree-view-big">
		<h2 id="tree-view-big">Ten thousand nodes</h2>
		<p>One hundred folders of 99 files each, in single selection.</p>
		<TreeView
			collection={big}
			controller={bigTree}
			aria-label="Ten thousand files"
			class="tree-view-panel"
		/>
	</section>
</main>

<style>
	:global(.tree-view-panel) {
		width: min(360px, 100%);
		height: 320px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}
</style>
