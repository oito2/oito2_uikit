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
	import CircleUser from '@lucide/svelte/icons/circle-user';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash';
	import { Button, IconButton, MasterDetail, SearchField } from '@oito2/ui';

	const team = [
		{ name: 'Ana Souza', role: 'Designer' },
		{ name: 'Bruno Lima', role: 'Developer' },
		{ name: 'Carla Dias', role: 'Product manager' },
		{ name: 'Diego Reis', role: 'Developer' },
		{ name: 'Elisa Prado', role: 'Researcher' }
	];
	const folders = ['Inbox', 'Sent', 'Drafts', 'Archive'];

	let selected = $state<string | null>('Ana Souza');
	let paneSize = $state(260);
	let people = $state(team.map((person) => person.name));
	let query = $state('');
	let filtered = $derived(
		people.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
	);

	/** Returns the role of a team member. */
	const roleOf = (name: string) => team.find((person) => person.name === name)?.role ?? 'Guest';

	/** Adds a guest with the next free number. */
	function addGuest() {
		const name = `Guest ${people.length - team.length + 1}`;
		people = [...people, name];
	}
</script>

<main class="showcase-page">
	<p>
		A master-detail view lists items beside the page of the selected one, as in settings and
		mail apps. From <code>breakpoint</code> pixels wide the list is a resizable pane next to the detail
		and an item is always selected; narrower, the list fills the area and selecting an item shows
		its page, with a back button in the detail header. Drag the corner of each frame to resize it.
	</p>

	<section aria-labelledby="master-detail-basic">
		<h2 id="master-detail-basic">Selection and pane size</h2>
		<div class="frame">
			<MasterDetail.Root bind:value={selected} bind:paneSize class="fill">
				<MasterDetail.Master>
					<MasterDetail.List aria-label="Team">
						{#each team as person (person.name)}
							<MasterDetail.Tile
								value={person.name}
								title={person.name}
								subtitle={person.role}
							>
								{#snippet leading()}<CircleUser aria-hidden="true" />{/snippet}
							</MasterDetail.Tile>
						{/each}
					</MasterDetail.List>
				</MasterDetail.Master>
				<MasterDetail.Detail>
					{#snippet children(name)}
						<MasterDetail.DetailHeader title={name} level={3} />
						<div class="padded">{name} works as {roleOf(name).toLowerCase()}.</div>
					{/snippet}
				</MasterDetail.Detail>
			</MasterDetail.Root>
		</div>
		<p>Selected: {selected ?? 'none'}. Pane width: {Math.round(paneSize)} pixels.</p>
	</section>

	<section aria-labelledby="master-detail-parts">
		<h2 id="master-detail-parts">Header, footer and empty states</h2>
		<p>
			The master header holds a search field and the footer an action. When the search matches
			nothing the list shows its <code>empty</code> snippet; the detail shows its own when nothing
			is selected.
		</p>
		<div class="frame">
			<MasterDetail.Root class="fill">
				<MasterDetail.Master>
					<MasterDetail.MasterHeader>
						<SearchField bind:value={query} aria-label="Filter people" />
					</MasterDetail.MasterHeader>
					<MasterDetail.List aria-label="People">
						{#each filtered as name (name)}
							<MasterDetail.Tile value={name} title={name} subtitle={roleOf(name)} />
						{/each}
						{#snippet empty()}<div class="padded note">
								No one matches “{query}”.
							</div>{/snippet}
					</MasterDetail.List>
					<MasterDetail.MasterFooter>
						<Button variant="tonal" icon={Plus} onclick={addGuest}>Add guest</Button>
					</MasterDetail.MasterFooter>
				</MasterDetail.Master>
				<MasterDetail.Detail>
					{#snippet children(name)}
						<MasterDetail.DetailHeader title={name} level={3}>
							{#snippet actions()}
								<IconButton
									icon={Trash}
									label="Remove {name}"
									onclick={() =>
										(people = people.filter((each) => each !== name))}
								/>
							{/snippet}
						</MasterDetail.DetailHeader>
						<div class="padded">The profile of {name}.</div>
					{/snippet}
					{#snippet empty()}<div class="padded note">
							Pick someone from the list.
						</div>{/snippet}
				</MasterDetail.Detail>
			</MasterDetail.Root>
		</div>
	</section>

	<section aria-labelledby="master-detail-fixed">
		<h2 id="master-detail-fixed">Fixed pane, earlier breakpoint</h2>
		<p>
			With <code>resizable</code> off the pane keeps its size. Here the layout splits from 480 pixels.
		</p>
		<div class="frame">
			<MasterDetail.Root
				resizable={false}
				breakpoint={480}
				defaultPaneSize={200}
				defaultValue="Inbox"
				class="fill"
			>
				<MasterDetail.Master>
					<MasterDetail.List aria-label="Folders">
						{#each folders as folder (folder)}
							<MasterDetail.Tile value={folder} title={folder} />
						{/each}
					</MasterDetail.List>
				</MasterDetail.Master>
				<MasterDetail.Detail>
					{#snippet children(folder)}
						<MasterDetail.DetailHeader title={folder} level={3} />
						<div class="padded">No messages in {folder}.</div>
					{/snippet}
				</MasterDetail.Detail>
			</MasterDetail.Root>
		</div>
	</section>
</main>

<style>
	.frame {
		display: flex;
		height: 340px;
		min-width: 280px;
		max-width: 100%;
		overflow: hidden;
		resize: horizontal;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.frame > :global(.fill) {
		flex: 1;
		min-width: 0;
	}

	.padded {
		padding: var(--oito2-space-lg);
	}
</style>
