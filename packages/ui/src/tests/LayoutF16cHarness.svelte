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

<!-- Test helper: trees, list boxes, carousel, marquee, splitter, scroll area, paned view, table of contents and navigation page. -->
<script lang="ts">
	import Home from '@lucide/svelte/icons/house';
	import Settings from '@lucide/svelte/icons/settings';
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import { TreeCollection } from '../lib/collections/tree-collection.js';
	import * as Carousel from '../lib/components/carousel/carousel/index.js';
	import type { IconComponent } from '../lib/components/icon.js';
	import * as ListBox from '../lib/components/list-box/list-box/index.js';
	import Marquee from '../lib/components/marquee/Marquee.svelte';
	import * as NavigationPage from '../lib/components/navigation/page/index.js';
	import ScrollArea from '../lib/components/scroll/ScrollArea.svelte';
	import PanedView from '../lib/components/split/PanedView.svelte';
	import * as Splitter from '../lib/components/split/splitter/index.js';
	import TableOfContents from '../lib/components/toc/TableOfContents.svelte';
	import JsonTreeView from '../lib/components/tree/JsonTreeView.svelte';
	import TreeView from '../lib/components/tree/TreeView.svelte';

	interface Props {
		show:
			| 'tree'
			| 'list-box'
			| 'carousel'
			| 'marquee'
			| 'splitter'
			| 'scroll'
			| 'paned'
			| 'toc'
			| 'navigation'
			| 'json';
		log?: string[];
		playing?: boolean;
		paused?: boolean;
		width?: number;
		minSize?: number;
		density?: 'pointer' | 'touch';
		data?: unknown;
	}

	let {
		show,
		log = [],
		playing = $bindable(),
		paused = false,
		width = 800,
		minSize = 48,
		density = 'pointer',
		data
	}: Props = $props();

	const tree = new TreeCollection([
		{ value: 'a', label: 'Alpha', children: [{ value: 'a1', label: 'Alpha one' }] },
		{ value: 'b', label: 'Beta', children: [{ value: 'b1', label: 'Beta one' }] },
		{ value: 'c', label: 'Gamma' }
	]);
	const fruits = new ListCollection(['Apple', 'Pear']);
	const items = [
		{ value: 'home', label: 'Home', icon: Home as IconComponent },
		{ value: 'settings', label: 'Settings', icon: Settings as IconComponent }
	];
	const sections = [
		{ title: 'First', id: 'f16c-first' },
		{ title: 'Second', id: 'f16c-second' }
	];
	let scroller: HTMLElement | null = $state(null);
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<button type="button">Before</button>
	{#if show === 'tree'}
		<TreeView collection={tree} aria-label="Files" style="height: 200px" />
	{:else if show === 'json'}
		<JsonTreeView {data} expandDepth={2} aria-label="Document" style="height: 200px" />
	{:else if show === 'list-box'}
		<ListBox.Root collection={fruits} aria-label="Fruits">
			<ListBox.Group data-testid="unnamed">
				<ListBox.Item value="Apple" />
			</ListBox.Group>
			<ListBox.Group data-testid="named">
				<ListBox.GroupLabel data-testid="label">Soft</ListBox.GroupLabel>
				<ListBox.Item value="Pear" />
			</ListBox.Group>
		</ListBox.Root>
	{:else if show === 'carousel'}
		<Carousel.Root
			autoScroll
			interval={60000}
			bind:playing
			onPlayingChange={(next) => log.push(`playing:${next}`)}
			aria-label="Photos"
		>
			<Carousel.Viewport height={80} data-testid="frame">
				<Carousel.Item>Slide one</Carousel.Item>
				<Carousel.Item>Slide two</Carousel.Item>
			</Carousel.Viewport>
			<Carousel.PlayPause onclick={() => log.push('click')} />
		</Carousel.Root>
	{:else if show === 'marquee'}
		<div style="width: 120px">
			<Marquee {paused} pauseOnHover={false} data-testid="marquee">
				<span>A long line of text that does not fit in the marquee</span>
			</Marquee>
		</div>
	{:else if show === 'splitter'}
		<div style:width="{width}px" style="display: flex; height: 200px">
			<Splitter.Root
				onSizesChange={(sizes) => log.push(sizes.map(Math.round).join(','))}
				style="flex: 1"
			>
				<Splitter.Pane initialFraction={0.5} {minSize}>Left</Splitter.Pane>
				<Splitter.Pane>Right</Splitter.Pane>
			</Splitter.Root>
		</div>
	{:else if show === 'scroll'}
		<ScrollArea aria-label="Log" data-testid="scroll" style="height: 60px">
			<div style="height: 400px">Lines</div>
		</ScrollArea>
	{:else if show === 'paned'}
		<div style="display: flex; width: 800px; height: 200px">
			<PanedView defaultPaneSize={300} style="flex: 1">
				{#snippet pane()}Pane{/snippet}
				Page
			</PanedView>
		</div>
	{:else if show === 'toc'}
		<TableOfContents entries={sections} scrollContainer={scroller} aria-label="On this page" />
		<div bind:this={scroller} style="height: 100px; overflow: auto">
			<h2 id="f16c-first">First</h2>
			<div style="height: 300px"></div>
			<h2 id="f16c-second">Second</h2>
			<div style="height: 300px"></div>
		</div>
	{:else if show === 'navigation'}
		<div data-oito2-density={density} style="display: flex; width: 500px; height: 300px">
			<NavigationPage.Root {items} navigationLabel="Main" style="flex: 1">
				<NavigationPage.Content value="home">Home page</NavigationPage.Content>
				<NavigationPage.Content value="settings">Settings page</NavigationPage.Content>
			</NavigationPage.Root>
		</div>
	{/if}
</ThemeProvider>
