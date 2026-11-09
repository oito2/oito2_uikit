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

<!-- The API reference of the exports a showcase page documents, read from the generated api.json. -->
<script lang="ts">
	import { Button } from '@oito2/ui';

	interface Prop {
		name: string;
		kind: 'prop' | 'event' | 'snippet';
		type: string;
		optional: boolean;
		default?: string;
		bindable?: boolean;
		doc: string;
	}

	interface Part {
		kind: 'component';
		doc: string;
		extends?: string;
		props: Prop[];
	}

	type Entry =
		| Part
		| { kind: 'compound'; parts: Record<string, Part> }
		| { kind: 'function' | 'class' | 'constant' | 'type' | 'interface'; doc: string };

	interface Props {
		/** The exports, as `Name` for @oito2/ui or `@oito2/<package>:Name`. */
		names: readonly string[];
	}

	let { names }: Props = $props();

	const api = import('./../api/api.json').then(
		(module) => (module.default as { packages: Record<string, Record<string, Entry>> }).packages
	);

	/** Splits `name` into its package and export. */
	function split(name: string): [string, string] {
		const at = name.lastIndexOf(':');
		return at < 0 ? ['@oito2/ui', name] : [name.slice(0, at), name.slice(at + 1)];
	}

	/** Splits TSDoc text into paragraphs, and each into plain and `code` runs. */
	function paragraphs(text: string): { code: boolean; text: string }[][] {
		return text
			.split(/\n\s*\n/)
			.map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
			.filter((block) => block !== '' && !block.startsWith('```'))
			.map((block) =>
				block
					.split(/(`[^`]+`)/)
					.map((run) =>
						run.startsWith('`')
							? { code: true, text: run.slice(1, -1) }
							: { code: false, text: run }
					)
			);
	}

	const kinds: { kind: Prop['kind']; label: string }[] = [
		{ kind: 'prop', label: 'Props' },
		{ kind: 'snippet', label: 'Snippets' },
		{ kind: 'event', label: 'Callbacks' }
	];
</script>

{#snippet docs(text: string)}
	{#each paragraphs(text) as runs, index (index)}
		<p>
			{#each runs as run, i (i)}{#if run.code}<code>{run.text}</code
					>{:else}{run.text}{/if}{/each}
		</p>
	{/each}
{/snippet}

{#snippet component(title: string, part: Part)}
	<div class="entry">
		<h3><code>{title}</code></h3>
		{@render docs(part.doc)}
		{#if part.props.length > 0}
			<div class="table">
				<table>
					<thead>
						<tr
							><th scope="col">Name</th><th scope="col">Type</th><th scope="col"
								>Default</th
							><th scope="col">Description</th></tr
						>
					</thead>
					{#each kinds as group (group.kind)}
						{@const rows = part.props.filter((prop) => prop.kind === group.kind)}
						{#if rows.length > 0}
							<tbody>
								<tr class="group"
									><th scope="rowgroup" colspan="4">{group.label}</th></tr
								>
								{#each rows as prop (prop.name)}
									<tr>
										<th scope="row">
											<code>{prop.name}</code>
											{#if !prop.optional}<span class="flag">required</span
												>{/if}
											{#if prop.bindable}<span class="flag">bindable</span
												>{/if}
										</th>
										<td><code>{prop.type}</code></td>
										<td
											>{#if prop.default !== undefined}<code
													>{prop.default}</code
												>{/if}</td
										>
										<td>{@render docs(prop.doc)}</td>
									</tr>
								{/each}
							</tbody>
						{/if}
					{/each}
				</table>
			</div>
		{/if}
		{#if part.extends}
			<p class="extends">
				Other attributes go to the root element: <code>{part.extends}</code>.
			</p>
		{/if}
	</div>
{/snippet}

<section class="api-reference" aria-labelledby="api-reference">
	<h2 id="api-reference">API</h2>
	{#await api then packages}
		{#each names as name (name)}
			{@const [pkg, exported] = split(name)}
			{@const entry = packages[pkg]?.[exported]}
			{#if entry?.kind === 'component'}
				{@render component(exported, entry)}
			{:else if entry?.kind === 'compound'}
				{#each Object.entries(entry.parts) as [part, value] (part)}
					{@render component(`${exported}.${part}`, value)}
				{/each}
			{:else if entry}
				<div class="entry">
					<h3><code>{exported}</code> <span class="flag">{entry.kind}</span></h3>
					{@render docs(entry.doc)}
				</div>
			{/if}
		{/each}
	{:catch}
		<!-- The reference's chunk is missing, as after a deploy that renamed the hashed files. -->
		<div class="missing">
			<p>This page could not be loaded. Reload the showcase to get the latest version.</p>
			<Button variant="text" onclick={() => location.reload()}>Reload</Button>
		</div>
	{/await}
</section>

<style>
	.api-reference {
		display: grid;
		gap: var(--oito2-space-lg);
		padding: var(--oito2-space-xl);
		border-top: 1px solid var(--oito2-color-outline-variant);
	}

	h2 {
		margin: 0;
		font: var(--oito2-type-title-large);
	}

	.entry {
		display: grid;
		gap: var(--oito2-space-sm);
		min-width: 0;
	}

	h3 {
		margin: 0;
		font: var(--oito2-type-title-medium);
	}

	p {
		margin: 0;
		max-width: 80ch;
	}

	.table {
		overflow-x: auto;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font: var(--oito2-type-body-small);
	}

	th,
	td {
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
		border-bottom: 1px solid var(--oito2-color-outline-variant);
		text-align: start;
		vertical-align: top;
	}

	thead th {
		background: var(--oito2-color-surface-container);
		font-weight: 600;
	}

	.group th {
		background: var(--oito2-color-surface-container-low);
		color: var(--oito2-color-on-surface-variant);
		font-weight: 600;
	}

	tbody th {
		font-weight: 400;
		white-space: nowrap;
	}

	td p {
		margin: 0;
	}

	code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.92em;
		overflow-wrap: anywhere;
	}

	.flag {
		margin-inline-start: var(--oito2-space-xs);
		padding: 0 var(--oito2-space-xs);
		border-radius: var(--oito2-radius-small);
		background: var(--oito2-color-surface-container-highest);
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-small);
	}

	.extends {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-body-small);
	}

	.missing {
		display: grid;
		gap: var(--oito2-space-sm);
		justify-items: start;
	}
</style>
