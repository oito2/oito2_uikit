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
	import House from '@lucide/svelte/icons/house';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Library from '@lucide/svelte/icons/library';
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings';
	import { IconButton, NavigationPage, type IconComponent, type NavigationItem } from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const destinations: NavigationItem[] = [
		{ value: 'home', label: 'Home', icon: icon(House) },
		{ value: 'inbox', label: 'Inbox', icon: icon(Inbox) },
		{ value: 'alerts', label: 'Alerts', icon: icon(Bell) },
		{ value: 'settings', label: 'Settings', icon: icon(Settings) }
	];
	const library: NavigationItem[] = [
		{ value: 'home', label: 'Home', icon: icon(House) },
		{ value: 'library', label: 'Library', icon: icon(Library) },
		{ value: 'settings', label: 'Settings', icon: icon(Settings) }
	];

	let destination = $state('home');
	let created = $state(0);
</script>

<main class="showcase-page">
	<p>
		A navigation page switches between the top-level pages of an app and adapts its navigation
		to the width and the input. With a mouse it is a rail at the start side: compact below
		<code>compactBreakpoint</code>, labelled up to <code>extendedBreakpoint</code> and extended
		from there. On a touch screen narrower than <code>compactBreakpoint</code> it becomes a bottom
		navigation bar. Drag the corner of each frame to resize it.
	</p>

	<section aria-labelledby="navigation-page-adaptive">
		<h2 id="navigation-page-adaptive">Adaptive layout</h2>
		<p class="note">Compact rail below 600 pixels, labels beside the icons from 900.</p>
		<div class="frame">
			<NavigationPage.Root
				items={destinations}
				bind:value={destination}
				extendedBreakpoint={900}
				navigationLabel="Sample app"
				class="fill"
			>
				{#each destinations as item (item.value)}
					<NavigationPage.Content value={item.value}>
						<div class="padded">The {item.label} page.</div>
					</NavigationPage.Content>
				{/each}
			</NavigationPage.Root>
		</div>
		<p>Selected: {destination}.</p>
	</section>

	<section aria-labelledby="navigation-page-parts">
		<h2 id="navigation-page-parts">Fixed style, header and footer</h2>
		<p>
			<code>railStyle</code> keeps one rail style at every width, <code>header</code> and
			<code>footer</code> add content above and below the destinations, and
			<code>separator</code> turns off the line between the navigation and the page.
		</p>
		<div class="frame">
			<NavigationPage.Root
				items={library}
				defaultValue="library"
				railStyle="compact"
				separator={false}
				navigationLabel="Library app"
				class="fill"
			>
				{#snippet header()}
					<IconButton icon={Plus} label="New collection" onclick={() => created++} />
				{/snippet}
				{#snippet footer()}<span class="note">v1.4</span>{/snippet}
				{#each library as item (item.value)}
					<NavigationPage.Content value={item.value}>
						<div class="padded">
							The {item.label} page. Collections created: {created}.
						</div>
					</NavigationPage.Content>
				{/each}
			</NavigationPage.Root>
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
