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
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import {
		BackButton,
		HeaderBar,
		HighlightedText,
		IconButton,
		Menu,
		SegmentGroup,
		SystemScope,
		Tabs,
		WindowScope,
		type IconComponent
	} from '@oito2/ui';
	import { SimulatedWindowController, simulatedSettings } from '#lib/simulated-window.svelte.js';

	const icon = (component: unknown) => component as IconComponent;

	const desktops = ['gnome', 'kde', 'xfce', 'cosmic', 'windows', 'macos'] as const;
	type Desktop = (typeof desktops)[number];
	let desktop = $state<Desktop>('gnome');
	let settings = $derived(simulatedSettings(desktop));
	const simulated = new SimulatedWindowController();

	let last = $state('');

	const fruits = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Plum'];
	let query = $state('');
	let searching = $state(false);
	let found = $derived(
		fruits.filter((fruit) => fruit.toLowerCase().includes(query.trim().toLowerCase()))
	);

	let view = $state('albums');
	const views = [
		{ value: 'albums', label: 'Albums', text: 'Twelve albums, newest first.' },
		{ value: 'artists', label: 'Artists', text: 'Five artists you follow.' },
		{ value: 'playlists', label: 'Playlists', text: 'Three playlists, one shared.' }
	];
</script>

<main class="showcase-page">
	<p>
		<code>HeaderBar</code> is a GNOME-style header bar: a window title bar with controls at the start
		and the end, a title, and an optional search or view switcher. It takes the window controls of
		the desktop; pick one to see the bars below follow it.
	</p>

	<SegmentGroup.Root bind:value={desktop} aria-label="Desktop">
		{#each desktops as option (option)}
			<SegmentGroup.Item value={option}>{option}</SegmentGroup.Item>
		{/each}
	</SegmentGroup.Root>

	<SystemScope {settings}>
		<WindowScope controller={simulated}>
			<section aria-labelledby="header-bar-controls">
				<h2 id="header-bar-controls">Start and end controls</h2>
				<p>
					<code>start</code> holds navigation, such as a back button; <code>end</code> the main
					menu and other actions.
				</p>
				<div class="header-bar-frame">
					<HeaderBar title="Documents">
						{#snippet start()}
							<BackButton onclick={() => (last = 'Back')} />
							<IconButton
								icon={icon(Plus)}
								label="New document"
								onclick={() => (last = 'New document')}
							/>
						{/snippet}
						{#snippet end()}
							<Menu.Root>
								<Menu.Trigger>
									{#snippet child({ props })}
										<IconButton
											{...props}
											icon={icon(EllipsisVertical)}
											label="Main menu"
										/>
									{/snippet}
								</Menu.Trigger>
								<Menu.Content>
									<Menu.Item onSelect={() => (last = 'Preferences')}
										>Preferences</Menu.Item
									>
									<Menu.Item onSelect={() => (last = 'About Documents')}
										>About Documents</Menu.Item
									>
								</Menu.Content>
							</Menu.Root>
						{/snippet}
					</HeaderBar>
				</div>
				<p class="note" role="status">
					Last action: {last || simulated.lastAction || 'none'}
				</p>
			</section>

			<section aria-labelledby="header-bar-search">
				<h2 id="header-bar-search">Search</h2>
				<p>
					With <code>searchable</code>, a search button at the end swaps the title for a
					search field. Escape closes it and returns the focus to the button.
				</p>
				<div class="header-bar-frame">
					<HeaderBar
						title="Fruits"
						searchable
						bind:searchActive={searching}
						bind:searchValue={query}
						searchPlaceholder="Search fruits"
						searchLabel="Search fruits"
					/>
					<ul class="header-bar-results">
						{#each found as fruit (fruit)}
							<li><HighlightedText text={fruit} query={query.trim()} /></li>
						{:else}
							<li class="note">No fruit matches.</li>
						{/each}
					</ul>
				</div>
				<p class="note">
					Search {searching ? 'open' : 'closed'}, text: {query || '(empty)'}
				</p>
			</section>

			<section aria-labelledby="header-bar-tabs">
				<h2 id="header-bar-tabs">View switcher</h2>
				<p>
					<code>tabs</code> puts a view switcher in place of the title, such as the
					<code>Tabs.List</code> of a <code>Tabs.Root</code> around the bar and its pages.
				</p>
				<div class="header-bar-frame">
					<Tabs.Root bind:value={view}>
						<HeaderBar tabWidth={110}>
							{#snippet tabs()}
								<Tabs.List aria-label="Library views">
									{#each views as entry (entry.value)}
										<Tabs.Trigger value={entry.value}
											>{entry.label}</Tabs.Trigger
										>
									{/each}
								</Tabs.List>
							{/snippet}
						</HeaderBar>
						{#each views as entry (entry.value)}
							<Tabs.Content value={entry.value} class="header-bar-page"
								>{entry.text}</Tabs.Content
							>
						{/each}
					</Tabs.Root>
				</div>
			</section>
		</WindowScope>
	</SystemScope>
</main>

<style>
	.header-bar-frame {
		max-width: 640px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-surface);
	}

	.header-bar-results {
		display: grid;
		gap: var(--oito2-space-xxs);
		margin: 0;
		padding: var(--oito2-space-md);
		list-style: none;
	}

	.header-bar-frame :global(.header-bar-page) {
		padding: var(--oito2-space-md);
	}
</style>
