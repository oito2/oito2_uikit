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
	import Bell from '@lucide/svelte/icons/bell';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { Badge, Button, IconButton } from '@oito2/ui';

	let unread = $state(4);
</script>

<main class="showcase-page">
	<p>
		<code>Badge</code> is a small status mark in the error color: a dot that says "something is new",
		or a pill with a short text or a count. Around an icon or a button it sits on their top end corner.
	</p>

	<section aria-labelledby="badge-kinds">
		<h2 id="badge-kinds">Dot and count</h2>
		<p>
			Without <code>content</code> the badge is a dot. Counts above <code>max</code> show as
			<code>max+</code>.
		</p>
		<div class="row">
			<Badge><IconButton icon={Bell} label="Notifications, some new" /></Badge>
			<Badge content={3}><IconButton icon={Mail} label="Mail, 3 unread" /></Badge>
			<Badge content={120} max={99}>
				<IconButton icon={MessageSquare} label="Messages, more than 99 unread" />
			</Badge>
			<Badge content={2500}
				><IconButton icon={Inbox} label="Inbox, more than 999 items" /></Badge
			>
		</div>
	</section>

	<section aria-labelledby="badge-standalone">
		<h2 id="badge-standalone">On its own</h2>
		<p>Without children the badge flows with the text, for example next to a label.</p>
		<div class="row">
			<span class="labelled">Updates <Badge /></span>
			<span class="labelled">Inbox <Badge content={12} /></span>
			<span class="labelled">Release notes <Badge content="New" /></span>
		</div>
	</section>

	<section aria-labelledby="badge-live">
		<h2 id="badge-live">Live count</h2>
		<p>
			<code>visible</code> hides the badge without removing it from the layout code; here it hides
			when nothing is unread.
		</p>
		<div class="row">
			<Badge content={unread} visible={unread > 0}>
				<IconButton icon={Bell} label="Notifications, {unread} unread" />
			</Badge>
			<Button variant="tonal" onclick={() => unread++}>New notification</Button>
			<Button variant="text" disabled={unread === 0} onclick={() => (unread = 0)}>
				Mark all as read
			</Button>
		</div>
		<p>{unread} unread.</p>
	</section>
</main>

<style>
	.labelled {
		display: inline-flex;
		align-items: center;
		gap: var(--oito2-space-xs);
	}
</style>
