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
  A tree view of decoded JSON `data`, with keys, strings, numbers, booleans and null in the
  theme's syntax colors, and the size of each object and array.

  Branches up to `expandDepth` levels deep start open, and open to it again when `data`,
  `rootLabel` or `expandDepth` change. It has the keyboard and filtering of `TreeView`;
  `query` filters by key and value. Give it a height.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { jsonTree, jsonValueText } from './json-tree.js';
	import { TreeController } from './tree-controller.svelte.js';
	import TreeView from './TreeView.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The decoded JSON: objects, arrays, strings, numbers, booleans and null. */
		data: unknown;
		/** The depth up to which branches start open; 0 keeps every branch closed. Defaults to 1. */
		expandDepth?: number;
		/** The label of the top node. Defaults to `root`. */
		rootLabel?: string;
		/** The text that filters the nodes. */
		query?: string;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		data,
		expandDepth = 1,
		rootLabel = 'root',
		query = '',
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const controller = new TreeController();
	let tree = $derived(jsonTree(data, rootLabel));

	// Opens the branches shallower than `expandDepth` whenever the tree or the depth change.
	$effect(() => {
		const depth = expandDepth;
		const open = tree
			.flatten()
			.filter((entry) => entry.node.children !== undefined && entry.depth < depth)
			.map((entry) => entry.node.value);
		untrack(() => controller.setExpandedValues(open));
	});

	/**
	 * Returns the summary of `value` and the syntax role that colors it; `children` is the
	 * number of children of a branch node, or `undefined` for a leaf, and `circular` marks
	 * an object or array that contains the node.
	 */
	function describe(
		value: unknown,
		children: number | undefined,
		circular = false
	): { text: string; role: string } {
		if (circular) return { text: '[Circular]', role: 'comment' };
		if (Array.isArray(value)) return { text: `[${value.length}]`, role: 'comment' };
		if (children !== undefined) return { text: `{${children}}`, role: 'comment' };
		if (value === null) return { text: 'null', role: 'constant' };
		if (typeof value === 'string') return { text: JSON.stringify(value), role: 'string' };
		if (typeof value === 'number' || typeof value === 'bigint')
			return { text: String(value), role: 'number' };
		if (typeof value === 'boolean') return { text: String(value), role: 'keyword' };
		return { text: jsonValueText(value), role: 'foreground' };
	}
</script>

<TreeView
	bind:ref
	collection={tree}
	{controller}
	{query}
	class={['oito2-json-tree-view', className]}
	{...rest}
>
	{#snippet item(node)}
		{@const entry = node.data}
		{#if entry}
			{@const summary = describe(entry.value, node.children?.length, entry.circular)}
			{@const branch = node.children !== undefined}
			<span class="key">{entry.key}</span><span class="punctuation"
				>{branch ? ' ' : ': '}</span
			><span style:color="var(--oito2-syntax-{summary.role})">{summary.text}</span>
		{/if}
	{/snippet}
</TreeView>

<style>
	@layer oito2 {
		.key {
			color: var(--oito2-syntax-attribute);
		}

		.punctuation {
			color: var(--oito2-syntax-foreground);
		}
	}
</style>
