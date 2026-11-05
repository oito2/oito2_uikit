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
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import Folder from '@lucide/svelte/icons/folder';
	import Image from '@lucide/svelte/icons/image';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Send from '@lucide/svelte/icons/send';
	import Star from '@lucide/svelte/icons/star';
	import Trash from '@lucide/svelte/icons/trash';
	import User from '@lucide/svelte/icons/user';
	import { ListTile, Separator } from '@oito2/ui';

	const mailboxes = [
		{ id: 'inbox', title: 'Inbox', icon: Inbox, count: 24 },
		{ id: 'starred', title: 'Starred', icon: Star, count: 3 },
		{ id: 'sent', title: 'Sent', icon: Send, count: 0 },
		{ id: 'trash', title: 'Trash', icon: Trash, count: 0 }
	];

	let mailbox = $state('inbox');
	let opened = $state('nothing');
</script>

<main class="showcase-page">
	<p>
		<code>ListTile</code> is a row of a list: optional <code>leading</code> and
		<code>trailing</code> content around a <code>title</code> and an optional
		<code>subtitle</code>. With <code>onclick</code> it is a button, with <code>href</code> a link,
		and otherwise static text.
	</p>

	<section aria-labelledby="list-tile-content">
		<h2 id="list-tile-content">Content</h2>
		<div class="list">
			<ListTile title="Title only" />
			<ListTile title="With a subtitle" subtitle="A secondary line under the title" />
			<ListTile title="Documents" subtitle="12 files">
				{#snippet leading()}<Folder size={20} aria-hidden="true" />{/snippet}
				{#snippet trailing()}<span class="note">2.4 MB</span>{/snippet}
			</ListTile>
			<ListTile title="Centered title" centerTitle />
		</div>
	</section>

	<section aria-labelledby="list-tile-selection">
		<h2 id="list-tile-selection">Selection</h2>
		<p><code>selected</code> fills the row with the secondary container color.</p>
		<div class="list">
			{#each mailboxes as box (box.id)}
				<ListTile
					title={box.title}
					selected={mailbox === box.id}
					aria-current={mailbox === box.id ? 'true' : undefined}
					onclick={() => (mailbox = box.id)}
				>
					{#snippet leading()}<box.icon size={20} aria-hidden="true" />{/snippet}
					{#snippet trailing()}
						{#if box.count}<span class="note">{box.count}</span>{/if}
					{/snippet}
				</ListTile>
			{/each}
		</div>
		<p>Mailbox: {mailbox}.</p>
	</section>

	<section aria-labelledby="list-tile-actions">
		<h2 id="list-tile-actions">Buttons, links and disabled rows</h2>
		<div class="list">
			<ListTile
				title="Report.pdf"
				subtitle="Opened yesterday"
				onclick={() => (opened = 'Report.pdf')}
			>
				{#snippet leading()}<FileText size={20} aria-hidden="true" />{/snippet}
			</ListTile>
			<ListTile
				title="Holiday.jpg"
				subtitle="Opened last week"
				onclick={() => (opened = 'Holiday.jpg')}
			>
				{#snippet leading()}<Image size={20} aria-hidden="true" />{/snippet}
			</ListTile>
			<Separator />
			<ListTile
				title="Buttons"
				subtitle="A link to another page"
				href={resolve('/[slug]', { slug: 'button' })}
			>
				{#snippet trailing()}<ChevronRight size={20} aria-hidden="true" />{/snippet}
			</ListTile>
			<ListTile title="Account" subtitle="Not available offline" disabled onclick={() => {}}>
				{#snippet leading()}<User size={20} aria-hidden="true" />{/snippet}
			</ListTile>
		</div>
		<p>Opened: {opened}.</p>
	</section>

	<section aria-labelledby="list-tile-square">
		<h2 id="list-tile-square">Square corners</h2>
		<p><code>square</code> drops the rounded corners for lists that run edge to edge.</p>
		<div class="list framed">
			<ListTile square title="First row" onclick={() => {}} />
			<Separator />
			<ListTile square title="Second row" onclick={() => {}} />
			<Separator />
			<ListTile square title="Third row" selected onclick={() => {}} />
		</div>
	</section>
</main>

<style>
	.list {
		display: grid;
		max-width: 400px;
	}

	.framed {
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}
</style>
