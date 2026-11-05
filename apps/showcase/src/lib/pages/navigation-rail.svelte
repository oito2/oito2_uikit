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
	import FileText from '@lucide/svelte/icons/file-text';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import MailOpen from '@lucide/svelte/icons/mail-open';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Send from '@lucide/svelte/icons/send';
	import Settings from '@lucide/svelte/icons/settings';
	import Trash from '@lucide/svelte/icons/trash';
	import {
		Button,
		IconButton,
		NavigationRail,
		type IconComponent,
		type NavigationRailStyle
	} from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const folders = [
		{ value: 'inbox', label: 'Inbox', icon: icon(Inbox) },
		{ value: 'sent', label: 'Sent', icon: icon(Send) },
		{ value: 'drafts', label: 'Drafts', icon: icon(FileText) },
		{ value: 'archive', label: 'Archive', icon: icon(Archive) },
		{ value: 'trash', label: 'Trash', icon: icon(Trash) }
	];
	const railStyles: { style: NavigationRailStyle; name: string }[] = [
		{ style: 'compact', name: 'Compact' },
		{ style: 'labelled', name: 'Labelled' },
		{ style: 'labelledExtended', name: 'Extended' }
	];

	let railStyle = $state<NavigationRailStyle>('labelled');
	let folder = $state('inbox');
	let mail = $state('mail');
	let composed = $state(0);
</script>

<main class="showcase-page">
	<p>
		A navigation rail lists the top-level destinations along the start side of a window. It
		comes in three styles: <code>compact</code> shows only the icons, with the labels as
		tooltips;
		<code>labelled</code> puts the labels below the icons; <code>labelledExtended</code> puts them
		beside the icons in a wider rail. The arrow keys move between the destinations.
	</p>

	<section aria-labelledby="navigation-rail-styles">
		<h2 id="navigation-rail-styles">Styles</h2>
		<div class="row" role="group" aria-label="Rail style">
			{#each railStyles as item (item.style)}
				<Button
					variant={railStyle === item.style ? 'tonal' : 'text'}
					aria-pressed={railStyle === item.style}
					onclick={() => (railStyle = item.style)}>{item.name}</Button
				>
			{/each}
		</div>
		<div class="frame">
			<NavigationRail.Root {railStyle} bind:value={folder} aria-label="Mail folders">
				{#each folders as item (item.value)}
					<NavigationRail.Item {...item} />
				{/each}
			</NavigationRail.Root>
			<div class="page">
				{folders.find((item) => item.value === folder)?.label} — the {railStyle} rail.
			</div>
		</div>
	</section>

	<section aria-labelledby="navigation-rail-parts">
		<h2 id="navigation-rail-parts">Header, footer and selected icons</h2>
		<p>
			The <code>header</code> holds an action above the destinations, such as composing a
			message, and the <code>footer</code> one at the bottom. A <code>selectedIcon</code>
			replaces the icon while its destination is selected, and <code>tooltip</code> adds a hint.
		</p>
		<div class="frame">
			<NavigationRail.Root bind:value={mail} aria-label="Mail app">
				{#snippet header()}
					<IconButton icon={PenLine} label="Compose" onclick={() => composed++} />
				{/snippet}
				<NavigationRail.Item
					value="mail"
					label="Mail"
					icon={icon(Mail)}
					selectedIcon={icon(MailOpen)}
					tooltip="Your messages"
				/>
				<NavigationRail.Item value="sent" label="Sent" icon={icon(Send)} />
				<NavigationRail.Item
					value="archive"
					label="Archive"
					icon={icon(Archive)}
					disabled
				/>
				{#snippet footer()}
					<IconButton icon={Settings} label="Mail settings" />
				{/snippet}
			</NavigationRail.Root>
			<div class="page">
				<span>Selected: {mail}.</span>
				<span>Messages composed: {composed}.</span>
			</div>
		</div>
	</section>
</main>

<style>
	.frame {
		display: flex;
		height: 380px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.page {
		display: grid;
		flex: 1;
		align-content: start;
		gap: var(--oito2-space-sm);
		min-width: 0;
		padding: var(--oito2-space-lg);
	}
</style>
