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

<!-- Test helper: the layout and navigation components of phase F7 at rest, for axe and goldens. -->
<script lang="ts">
	import Home from '@lucide/svelte/icons/house';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Settings from '@lucide/svelte/icons/settings';
	import Star from '@lucide/svelte/icons/star';
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { ColorTheme } from '../lib/theme/color-theme.js';
	import type { IconComponent } from '../lib/components/icon.js';
	import * as Accordion from '../lib/components/expandable/accordion/index.js';
	import InfoBadge from '../lib/components/info/InfoBadge.svelte';
	import InfoBox from '../lib/components/info/InfoBox.svelte';
	import { infoTypes } from '../lib/components/info/info-type.js';
	import * as Section from '../lib/components/layout/section/index.js';
	import Tile from '../lib/components/layout/Tile.svelte';
	import TileList from '../lib/components/layout/TileList.svelte';
	import PageIndicator from '../lib/components/navigation/PageIndicator.svelte';
	import * as NavigationRail from '../lib/components/navigation/rail/index.js';
	import Pagination from '../lib/components/pagination/Pagination.svelte';
	import * as Steps from '../lib/components/steps/steps/index.js';
	import Banner from '../lib/components/surfaces/Banner.svelte';
	import SelectableContainer from '../lib/components/surfaces/SelectableContainer.svelte';
	import * as Tabs from '../lib/components/tabs/tabs/index.js';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		theme?: ColorTheme;
	}

	let { mode = 'light', highContrast = false, theme }: Props = $props();

	const railStyles = ['compact', 'labelled', 'labelledExtended'] as const;
</script>

{#snippet star()}<Star size={20} aria-hidden="true" />{/snippet}

<ThemeProvider {mode} {highContrast} accent="blue" light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="rails">
			{#each railStyles as railStyle (railStyle)}
				<NavigationRail.Root {railStyle} defaultValue="home" aria-label={railStyle}>
					<NavigationRail.Item value="home" label="Home" icon={Home as IconComponent} />
					<NavigationRail.Item
						value="inbox"
						label="Inbox"
						icon={Inbox as IconComponent}
					/>
					<NavigationRail.Item
						value="settings"
						label="Settings"
						icon={Settings as IconComponent}
					/>
				</NavigationRail.Root>
			{/each}
		</div>
		<div class="column">
			{#each ['pill', 'subtle'] as const as variant (variant)}
				<Tabs.Root defaultValue="b" {variant}>
					<Tabs.List aria-label={variant}>
						<Tabs.Trigger value="a">Overview</Tabs.Trigger>
						<Tabs.Trigger value="b">Details</Tabs.Trigger>
						<Tabs.Trigger value="c">History</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			{/each}
			<Section.Root>
				<Section.Header headline="Section" />
				<Section.Content>
					<TileList>
						<Tile title="Tile" subtitle="Subtitle" leading={star} />
						<Tile title="Button tile" onclick={() => {}} />
						<Tile title="Disabled" disabled />
					</TileList>
				</Section.Content>
			</Section.Root>
			<div class="row">
				{#each infoTypes as type (type)}<InfoBadge {type} label={type} />{/each}
			</div>
			<InfoBox type="warning" title="Warning" subtitle="Something needs attention." />
			<InfoBox type="success" title="Saved" />
			<div class="row">
				<SelectableContainer selected onclick={() => {}}>Selected</SelectableContainer>
				<SelectableContainer onclick={() => {}}>Plain</SelectableContainer>
				<Banner title="Banner" subtitle="Promoted" icon={star} onclick={() => {}} />
			</div>
			<Accordion.Root defaultValue={['a']}>
				<Accordion.Item value="a">
					<Accordion.Trigger>Open section</Accordion.Trigger>
					<Accordion.Content>Accordion content</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="b">
					<Accordion.Trigger>Closed section</Accordion.Trigger>
					<Accordion.Content>Hidden</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
			<Steps.Root defaultCurrent={1}>
				<Steps.Item title="Account" description="Done" />
				<Steps.Item title="Profile" />
				<Steps.Item title="Review" error />
				<Steps.Item title="Finish" />
			</Steps.Root>
			<div class="row">
				<Pagination page={5} pageCount={10} />
				<PageIndicator length={5} page={2} onPageChange={() => {}} />
			</div>
		</div>
	</main>
</ThemeProvider>

<style>
	.gallery {
		display: flex;
		gap: 16px;
		width: 800px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	.rails {
		display: flex;
		gap: 8px;
		height: 220px;
	}

	.column {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
</style>
