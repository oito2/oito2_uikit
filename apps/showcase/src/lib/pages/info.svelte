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
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { Button, CloseButton, InfoBadge, InfoBox, infoTypes } from '@oito2/ui';

	const messages = {
		information: 'A new version is available and will install on the next restart.',
		success: 'Your changes were saved.',
		warning: 'The disk is almost full.',
		danger: 'The connection to the server was lost.',
		important: 'This project is shared with your whole team.'
	};

	let dismissed = $state(false);
	let unread = $state(3);
</script>

<main class="showcase-page">
	<p>
		<code>InfoBox</code> shows a message tinted by its kind (information, success, warning,
		danger or important), with an icon that names the kind for assistive technologies.
		<code>InfoBadge</code> is the small pill version, for statuses and counters.
	</p>

	<section aria-labelledby="info-badges">
		<h2 id="info-badges">Badges</h2>
		<div class="row">
			{#each infoTypes as type (type)}<InfoBadge {type} label={type} />{/each}
		</div>
		<div class="row">
			<span>Inbox</span>
			<InfoBadge type="danger" label="{unread} new" />
			<Button variant="text" onclick={() => unread++}>Receive a message</Button>
			<Button variant="text" disabled={unread === 0} onclick={() => (unread = 0)}>
				Mark all as read
			</Button>
		</div>
	</section>

	<section aria-labelledby="info-boxes">
		<h2 id="info-boxes">Boxes</h2>
		<div class="column">
			{#each infoTypes as type (type)}
				<InfoBox {type} title={type} subtitle={messages[type]} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="info-trailing">
		<h2 id="info-trailing">Actions and dismissal</h2>
		<p>The <code>trailing</code> snippet holds actions at the end, such as a close button.</p>
		{#if dismissed}
			<div class="row">
				<Button variant="tonal" onclick={() => (dismissed = false)}>Show again</Button>
			</div>
		{:else}
			<InfoBox
				type="warning"
				title="Backup overdue"
				subtitle="Your files haven't been backed up for 12 days."
			>
				{#snippet trailing()}
					<Button variant="text">Back up now</Button>
					<CloseButton label="Dismiss" onclick={() => (dismissed = true)} />
				{/snippet}
			</InfoBox>
		{/if}
	</section>

	<section aria-labelledby="info-custom">
		<h2 id="info-custom">Custom icon and extra content</h2>
		<p>
			An <code>icon</code> snippet replaces the kind icon; children add content below the subtitle.
		</p>
		<InfoBox type="important" title="What's new" subtitle="Highlights of version 2.0.">
			{#snippet icon()}<Sparkles aria-hidden="true" />{/snippet}
			<ul>
				<li>A redesigned sidebar.</li>
				<li>Search across every project.</li>
			</ul>
		</InfoBox>
	</section>
</main>

<style>
	ul {
		margin: 0;
		padding-inline-start: var(--oito2-space-lg);
	}
</style>
