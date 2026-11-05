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
	import Archive from '@lucide/svelte/icons/archive';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import Send from '@lucide/svelte/icons/send';
	import Star from '@lucide/svelte/icons/star';
	import { ChoiceChipBar } from '@oito2/ui';

	const folders = ['All', 'Unread', 'Starred', 'Drafts', 'Sent', 'Archived', 'Spam', 'Trash'];
	const cuisines = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Greek', 'Brazilian'];

	let folder = $state<readonly string[]>(['All']);
	let selectedCuisines = $state<readonly string[]>(['Japanese', 'Brazilian']);
	let mailbox = $state<readonly string[]>(['inbox']);
</script>

<main class="showcase-page">
	<p>
		<code>ChoiceChipBar</code> is a bar of filter chips for picking one or more options. In the
		<code>row</code> layout the chips scroll sideways and arrow buttons appear on the sides with
		hidden chips; in the <code>wrap</code> layout they wrap onto several rows.
	</p>

	<section aria-labelledby="choice-chip-bar-single">
		<h2 id="choice-chip-bar-single">Single choice in a row</h2>
		<p>
			Unless <code>multiple</code>, selecting a chip unselects the others. The bar below is
			narrower than its chips, so it scrolls.
		</p>
		<div class="narrow">
			<ChoiceChipBar.Root bind:value={folder} aria-label="Folders">
				{#each folders as each (each)}
					<ChoiceChipBar.Item value={each}>{each}</ChoiceChipBar.Item>
				{/each}
			</ChoiceChipBar.Root>
		</div>
		<p class="note">Folder: {folder.join(', ') || 'none'}</p>
	</section>

	<section aria-labelledby="choice-chip-bar-multiple">
		<h2 id="choice-chip-bar-multiple">Multiple choice that wraps</h2>
		<p>
			With <code>multiple</code> each chip turns on and off by itself;
			<code>layout="wrap"</code>
			breaks the chips onto rows and <code>showCheckmark</code> marks the selected ones.
		</p>
		<div class="narrow">
			<ChoiceChipBar.Root
				bind:value={selectedCuisines}
				multiple
				layout="wrap"
				showCheckmark
				aria-label="Cuisines"
			>
				{#each cuisines as each (each)}
					<ChoiceChipBar.Item value={each}>{each}</ChoiceChipBar.Item>
				{/each}
			</ChoiceChipBar.Root>
		</div>
		<p class="note">Cuisines: {selectedCuisines.join(', ') || 'none'}</p>
	</section>

	<section aria-labelledby="choice-chip-bar-icons">
		<h2 id="choice-chip-bar-icons">Icons and pill shape</h2>
		<p>
			Items take an <code>icon</code> before their label; <code>pill</code> rounds the chips.
		</p>
		<ChoiceChipBar.Root bind:value={mailbox} pill aria-label="Mailbox">
			<ChoiceChipBar.Item value="inbox" icon={Inbox}>Inbox</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="starred" icon={Star}>Starred</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="sent" icon={Send}>Sent</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="archive" icon={Archive}>Archive</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="all" icon={Mail}>All mail</ChoiceChipBar.Item>
		</ChoiceChipBar.Root>
	</section>

	<section aria-labelledby="choice-chip-bar-disabled">
		<h2 id="choice-chip-bar-disabled">Disabled</h2>
		<p>A single item, or the whole bar, can be disabled.</p>
		<div class="column">
			<ChoiceChipBar.Root defaultValue={['day']} aria-label="Period with a disabled item">
				<ChoiceChipBar.Item value="day">Today</ChoiceChipBar.Item>
				<ChoiceChipBar.Item value="week">This week</ChoiceChipBar.Item>
				<ChoiceChipBar.Item value="year" disabled>This year</ChoiceChipBar.Item>
			</ChoiceChipBar.Root>
			<ChoiceChipBar.Root defaultValue={['day']} disabled aria-label="Disabled period">
				<ChoiceChipBar.Item value="day">Today</ChoiceChipBar.Item>
				<ChoiceChipBar.Item value="week">This week</ChoiceChipBar.Item>
				<ChoiceChipBar.Item value="year">This year</ChoiceChipBar.Item>
			</ChoiceChipBar.Root>
		</div>
	</section>
</main>

<style>
	.narrow {
		max-width: 420px;
	}
</style>
