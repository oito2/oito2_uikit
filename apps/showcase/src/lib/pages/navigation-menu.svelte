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
	import { Button, Slider } from '@oito2/ui';
	import { NavigationMenu } from '@oito2/ui-extras';

	interface Destination {
		readonly section: string;
		readonly title: string;
		readonly description: string;
	}

	const components: Destination[] = [
		{ section: 'components', title: 'Buttons', description: 'Actions at every emphasis.' },
		{ section: 'components', title: 'Inputs', description: 'Text, numbers, dates and more.' },
		{ section: 'components', title: 'Overlays', description: 'Dialogs, menus and popovers.' },
		{ section: 'components', title: 'Navigation', description: 'Tabs, rails and this menu.' }
	];
	const docs: Destination[] = [
		{ section: 'docs', title: 'Getting started', description: 'Install and set up a theme.' },
		{ section: 'docs', title: 'Design tokens', description: 'Colors, spacing and type.' },
		{ section: 'docs', title: 'API reference', description: 'Every component and prop.' }
	];

	let current = $state<string | null>('home');
	let page = $state('Home');
	let open = $state<string | null>(null);
	let hoverDelay = $state(150);

	/** Records `destination` as the current page and closes the open panel. */
	function go(event: MouseEvent, section: string, title: string) {
		event.preventDefault();
		current = section;
		page = title;
		open = null;
	}
</script>

{#snippet panel(destinations: Destination[])}
	<ul class="navigation-menu-links">
		{#each destinations as destination (destination.title)}
			<li>
				<a
					href="#navigation-menu-header"
					onclick={(event) => go(event, destination.section, destination.title)}
				>
					<strong>{destination.title}</strong>
					<span class="note">{destination.description}</span>
				</a>
			</li>
		{/each}
	</ul>
{/snippet}

<main class="showcase-page">
	<p>
		<code>NavigationMenu</code> is a website-style header menu: links and triggers in a row, a line
		under the current item, and flyout panels below the triggers. A panel opens on hover, on a click
		or with the Down arrow; Tab moves between the items and Escape closes the panel.
	</p>

	<section aria-labelledby="navigation-menu-header">
		<h2 id="navigation-menu-header">Site header</h2>
		<p>Pick a page in a panel: the line under the menu moves to its item.</p>
		<div class="stage navigation-menu-stage">
			<NavigationMenu.Root {current} bind:value={open} {hoverDelay} aria-label="Product">
				<NavigationMenu.List>
					<NavigationMenu.Item value="home">
						<NavigationMenu.Link
							href="#navigation-menu-header"
							onclick={(event) => go(event, 'home', 'Home')}>Home</NavigationMenu.Link
						>
					</NavigationMenu.Item>
					<NavigationMenu.Item value="components">
						<NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
						<NavigationMenu.Content>{@render panel(components)}</NavigationMenu.Content>
					</NavigationMenu.Item>
					<NavigationMenu.Item value="docs">
						<NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
						<NavigationMenu.Content>{@render panel(docs)}</NavigationMenu.Content>
					</NavigationMenu.Item>
					<NavigationMenu.Item value="blog">
						<NavigationMenu.Link
							href="#navigation-menu-header"
							onclick={(event) => go(event, 'blog', 'Blog')}>Blog</NavigationMenu.Link
						>
					</NavigationMenu.Item>
				</NavigationMenu.List>
				<NavigationMenu.Indicator />
			</NavigationMenu.Root>
		</div>
		<p role="status">Current page: {page}</p>
	</section>

	<section aria-labelledby="navigation-menu-controlled">
		<h2 id="navigation-menu-controlled">Open panel and hover delay</h2>
		<p>
			Bind <code>value</code> to read or set the open panel, and tune how long a hovered
			trigger waits with <code>hoverDelay</code>. These controls drive the menu above.
		</p>
		<div class="row">
			<Button variant="outlined" onclick={() => (open = 'components')}>Open Components</Button
			>
			<Button variant="outlined" onclick={() => (open = 'docs')}>Open Docs</Button>
			<Button variant="text" disabled={open === null} onclick={() => (open = null)}
				>Close</Button
			>
		</div>
		<p class="note">Open panel: {open ?? 'none'}</p>
		<div class="navigation-menu-slider">
			<Slider
				bind:value={hoverDelay}
				min={0}
				max={600}
				divisions={12}
				label="Hover delay (ms)"
			/>
		</div>
	</section>
</main>

<style>
	.navigation-menu-stage {
		min-height: 260px;
	}

	.navigation-menu-links {
		display: grid;
		grid-template-columns: repeat(2, minmax(160px, 1fr));
		gap: var(--oito2-space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.navigation-menu-links a {
		display: grid;
		gap: var(--oito2-space-xxs);
		padding: var(--oito2-space-sm);
		border-radius: var(--oito2-radius-medium);
		color: var(--oito2-color-on-surface);
		text-decoration: none;
	}

	.navigation-menu-links a:hover {
		background: var(--oito2-color-surface-container-high);
	}

	.navigation-menu-slider {
		max-width: 320px;
	}
</style>
