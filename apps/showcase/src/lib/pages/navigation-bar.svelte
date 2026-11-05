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
	import Bell from '@lucide/svelte/icons/bell';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import House from '@lucide/svelte/icons/house';
	import Mail from '@lucide/svelte/icons/mail';
	import MailOpen from '@lucide/svelte/icons/mail-open';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import { NavigationBar, type IconComponent } from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const destinations = [
		{ value: 'home', label: 'Home', icon: icon(House) },
		{ value: 'search', label: 'Search', icon: icon(Search) },
		{ value: 'alerts', label: 'Alerts', icon: icon(Bell), selectedIcon: icon(BellRing) },
		{ value: 'settings', label: 'Settings', icon: icon(Settings) }
	];

	let destination = $state('home');
	let mailbox = $state('inbox');
</script>

<main class="showcase-page">
	<p>
		A navigation bar holds the top-level destinations of a touch layout along the bottom of the
		screen: icons on a pill indicator with their labels below. <code>NavigationPage</code> switches
		to it on narrow touch screens. The arrow keys move between the destinations.
	</p>

	<section aria-labelledby="navigation-bar-basic">
		<h2 id="navigation-bar-basic">Destinations</h2>
		<p>
			A <code>selectedIcon</code> replaces the icon while its destination is selected, as the alerts
			bell does here.
		</p>
		<div class="phone">
			<div class="screen">
				{destinations.find((item) => item.value === destination)?.label} page
			</div>
			<NavigationBar.Root bind:value={destination} aria-label="Sample app">
				{#each destinations as item (item.value)}
					<NavigationBar.Item {...item} />
				{/each}
			</NavigationBar.Root>
		</div>
		<p>Selected: {destination}.</p>
	</section>

	<section aria-labelledby="navigation-bar-states">
		<h2 id="navigation-bar-states">Disabled destination</h2>
		<div class="phone">
			<div class="screen">{mailbox}</div>
			<NavigationBar.Root bind:value={mailbox} aria-label="Mail">
				<NavigationBar.Item
					value="inbox"
					label="Inbox"
					icon={icon(Mail)}
					selectedIcon={icon(MailOpen)}
				/>
				<NavigationBar.Item
					value="folders"
					label="Folders"
					icon={icon(Folder)}
					selectedIcon={icon(FolderOpen)}
				/>
				<NavigationBar.Item value="offline" label="Offline" icon={icon(Bell)} disabled />
			</NavigationBar.Root>
		</div>
	</section>

	<section aria-labelledby="navigation-bar-links">
		<h2 id="navigation-bar-links">Links</h2>
		<p>
			With <code>href</code> a destination is a link; these open other pages of the showcase.
		</p>
		<div class="phone short">
			<NavigationBar.Root defaultValue="bar" aria-label="Navigation components">
				<NavigationBar.Item
					value="bar"
					label="Bar"
					icon={icon(PanelLeft)}
					href={resolve('/[slug]', { slug: 'navigation-bar' })}
				/>
				<NavigationBar.Item
					value="rail"
					label="Rail"
					icon={icon(PanelLeft)}
					href={resolve('/[slug]', { slug: 'navigation-rail' })}
				/>
				<NavigationBar.Item
					value="page"
					label="Page"
					icon={icon(House)}
					href={resolve('/[slug]', { slug: 'navigation-page' })}
				/>
			</NavigationBar.Root>
		</div>
	</section>
</main>

<style>
	.phone {
		display: flex;
		flex-direction: column;
		width: min(100%, 360px);
		height: 240px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.phone.short {
		height: auto;
	}

	.screen {
		display: grid;
		flex: 1;
		place-items: center;
		color: var(--oito2-color-on-surface-variant);
		text-transform: capitalize;
	}
</style>
