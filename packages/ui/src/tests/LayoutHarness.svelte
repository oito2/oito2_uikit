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

<!-- Test helper: paned view, splitter, navigation page and master-detail at a given size. -->
<script lang="ts">
	import Home from '@lucide/svelte/icons/house';
	import Settings from '@lucide/svelte/icons/settings';
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import PanedView from '../lib/components/split/PanedView.svelte';
	import * as Splitter from '../lib/components/split/splitter/index.js';
	import * as NavigationPage from '../lib/components/navigation/page/index.js';
	import * as MasterDetail from '../lib/components/master-detail/master-detail/index.js';
	import * as Tabs from '../lib/components/tabs/tabs/index.js';
	import HeaderBar from '../lib/window/HeaderBar.svelte';
	import type { IconComponent } from '../lib/components/icon.js';

	interface Props {
		show: 'paned' | 'splitter' | 'navigation' | 'master-detail' | 'header';
		width?: number;
		density?: 'pointer' | 'touch';
		paneSize?: number;
		onSizes?: (sizes: readonly number[]) => void;
		destination?: string;
		item?: string | null;
		extendedBreakpoint?: number;
	}

	let {
		show,
		width = 800,
		density = 'pointer',
		paneSize = $bindable(280),
		onSizes,
		destination = $bindable('home'),
		item = $bindable(null),
		extendedBreakpoint
	}: Props = $props();

	const items = [
		{ value: 'home', label: 'Home', icon: Home as IconComponent },
		{ value: 'settings', label: 'Settings', icon: Settings as IconComponent }
	];
	const people = ['Ana', 'Bruno', 'Carla'];
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<div
		data-oito2-density={density}
		style:width="{width}px"
		style:height="400px"
		style:display="flex"
	>
		{#if show === 'paned'}
			<PanedView bind:paneSize style="flex: 1">
				{#snippet pane()}Pane{/snippet}
				Page
			</PanedView>
		{:else if show === 'splitter'}
			<Splitter.Root onSizesChange={onSizes} style="flex: 1">
				<Splitter.Pane initialFraction={0.25} collapsible>Left</Splitter.Pane>
				<Splitter.Pane>Middle</Splitter.Pane>
				<Splitter.Pane minSize={100}>Right</Splitter.Pane>
			</Splitter.Root>
		{:else if show === 'navigation'}
			<NavigationPage.Root
				{items}
				bind:value={destination}
				{extendedBreakpoint}
				navigationLabel="Main"
				style="flex: 1"
			>
				<NavigationPage.Content value="home">Home page</NavigationPage.Content>
				<NavigationPage.Content value="settings">Settings page</NavigationPage.Content>
			</NavigationPage.Root>
		{:else if show === 'header'}
			<Tabs.Root bind:value={destination} style="flex: 1">
				<HeaderBar>
					{#snippet tabs()}
						<Tabs.List aria-label="Views">
							<Tabs.Trigger value="home">Home</Tabs.Trigger>
							<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
						</Tabs.List>
					{/snippet}
				</HeaderBar>
				<Tabs.Content value="home">Home view</Tabs.Content>
				<Tabs.Content value="settings">Settings view</Tabs.Content>
			</Tabs.Root>
		{:else}
			<MasterDetail.Root bind:value={item} style="flex: 1">
				<MasterDetail.Master>
					<MasterDetail.List aria-label="People">
						{#each people as person (person)}
							<MasterDetail.Tile value={person} title={person} />
						{/each}
					</MasterDetail.List>
				</MasterDetail.Master>
				<MasterDetail.Detail>
					{#snippet children(value)}
						<MasterDetail.DetailHeader title={value} />
						<p>About {value}</p>
					{/snippet}
				</MasterDetail.Detail>
			</MasterDetail.Root>
		{/if}
	</div>
</ThemeProvider>
