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
	import Calendar from '@lucide/svelte/icons/calendar';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { Button, Chip } from '@oito2/ui';

	const initialTags = ['Svelte', 'Tauri', 'Rust', 'TypeScript'];

	let lastAction = $state('none');
	let filters = $state([
		{ id: 'images', label: 'Images', selected: true },
		{ id: 'documents', label: 'Documents', selected: false },
		{ id: 'videos', label: 'Videos', selected: false }
	]);
	let shared = $state(false);
	let tags = $state([...initialTags]);
	let reply = $state('');

	let activeFilters = $derived(filters.filter((f) => f.selected).map((f) => f.label));
</script>

<main class="showcase-page">
	<p>
		<code>Chip</code> is a compact element as high as a button. Its <code>variant</code> says
		what it does: <code>assist</code> runs an action, <code>filter</code> toggles a filter,
		<code>input</code> stands for an entry such as a tag, and <code>suggestion</code> offers a reply
		or a query.
	</p>

	<section aria-labelledby="chip-assist">
		<h2 id="chip-assist">Assist</h2>
		<div class="row">
			<Chip icon={Calendar} onclick={() => (lastAction = 'add to calendar')}
				>Add to calendar</Chip
			>
			<Chip icon={MapPin} onclick={() => (lastAction = 'show on map')}>Show on map</Chip>
			<Chip onclick={() => (lastAction = 'plain chip')}>No icon</Chip>
			<Chip icon={Share2} disabled>Disabled</Chip>
		</div>
		<p>Last action: {lastAction}.</p>
	</section>

	<section aria-labelledby="chip-filter">
		<h2 id="chip-filter">Filter</h2>
		<p>
			A filter chip is a toggle; while <code>selected</code> it fills and shows a check mark,
			unless
			<code>showCheckmark</code> is false.
		</p>
		<div class="row">
			{#each filters as filter (filter.id)}
				<Chip variant="filter" bind:selected={filter.selected}>{filter.label}</Chip>
			{/each}
			<Chip variant="filter" bind:selected={shared} showCheckmark={false}>Shared with me</Chip
			>
			<Chip variant="filter" defaultSelected disabled>Disabled</Chip>
		</div>
		<p>
			Showing: {activeFilters.length ? activeFilters.join(', ') : 'everything'}{shared
				? ', shared with me only'
				: ''}.
		</p>
	</section>

	<section aria-labelledby="chip-input">
		<h2 id="chip-input">Input</h2>
		<p>
			With <code>onRemove</code> an input chip shows a remove button, named by
			<code>removeLabel</code>.
		</p>
		<div class="row">
			{#each tags as tag (tag)}
				<Chip
					variant="input"
					removeLabel="Remove {tag}"
					onRemove={() => (tags = tags.filter((t) => t !== tag))}>{tag}</Chip
				>
			{/each}
			{#if tags.length === 0}<span class="note">No tags left.</span>{/if}
			<Button variant="text" onclick={() => (tags = [...initialTags])}>Reset tags</Button>
		</div>
	</section>

	<section aria-labelledby="chip-suggestion">
		<h2 id="chip-suggestion">Suggestion</h2>
		<div class="row">
			{#each ['Sounds good!', 'On my way', 'Can we talk later?'] as text (text)}
				<Chip variant="suggestion" onclick={() => (reply = text)}>{text}</Chip>
			{/each}
			<Chip variant="suggestion" disabled>Disabled</Chip>
		</div>
		<p>Reply: {reply || 'pick a suggestion'}.</p>
	</section>
</main>
