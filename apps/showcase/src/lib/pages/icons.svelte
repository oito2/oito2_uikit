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
	import { Button, SearchField, toast, type IconComponent } from '@oito2/ui';
	import { icons } from '@oito2/ui/icons';

	/** Every Lucide icon, by component name. */
	const all = Object.entries(icons as Record<string, unknown>)
		.map(([name, component]) => ({ name, component: component as IconComponent }))
		.sort((a, b) => a.name.localeCompare(b.name));
	const pageSize = 240;

	let query = $state('');
	let shown = $state(pageSize);
	let matches = $derived.by(() => {
		const needle = query.trim().toLowerCase().replace(/[\s-]/g, '');
		return needle === '' ? all : all.filter((icon) => icon.name.toLowerCase().includes(needle));
	});

	// A new search starts from the first page of results.
	$effect(() => {
		void query;
		shown = pageSize;
	});

	/** Copies the import of the icon `name` and says so. */
	async function copy(name: string): Promise<void> {
		const line = `import { ${name} } from '@oito2/ui/icons';`;
		try {
			await navigator.clipboard.writeText(line);
			toast({ title: 'Copied', description: line, type: 'success' });
		} catch {
			toast({ title: "Couldn't copy", description: line, type: 'danger' });
		}
	}
</script>

<main>
	<p>
		The {all.length} Lucide icons that <code>@oito2/ui/icons</code> re-exports. Click an icon to copy
		its import.
	</p>
	<div class="search">
		<SearchField bind:value={query} placeholder="Search icons" aria-label="Search icons" />
		<span role="status">{matches.length} icons</span>
	</div>
	<ul class="grid">
		{#each matches.slice(0, shown) as icon (icon.name)}
			<li>
				<button
					type="button"
					class="icon"
					title={icon.name}
					onclick={() => copy(icon.name)}
				>
					<icon.component aria-hidden="true" />
					<span class="name">{icon.name}</span>
				</button>
			</li>
		{/each}
	</ul>
	{#if matches.length > shown}
		<Button variant="tonal" onclick={() => (shown += pageSize)}>
			Show more ({matches.length - shown} left)
		</Button>
	{/if}
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-md);
		padding: var(--oito2-space-xl);
	}

	p {
		margin: 0;
	}

	.search {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md);
	}

	.search :global(.oito2-search-field) {
		width: min(360px, 100%);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--oito2-space-xs);
		width: 100%;
		padding: var(--oito2-space-md) var(--oito2-space-xs);
		border: none;
		border-radius: var(--oito2-radius-medium);
		background: transparent;
		color: var(--oito2-color-on-surface);
		cursor: pointer;
	}

	.icon:hover {
		background: color-mix(in srgb, var(--oito2-color-on-surface) 8%, transparent);
	}

	.icon:focus-visible {
		outline: 2px solid var(--oito2-color-primary-text);
		outline-offset: -2px;
	}

	.icon :global(svg) {
		width: 24px;
		height: 24px;
	}

	.name {
		max-width: 100%;
		overflow: hidden;
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-small);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
