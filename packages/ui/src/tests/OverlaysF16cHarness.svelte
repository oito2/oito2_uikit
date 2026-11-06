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
<!-- Test helper: selects, dialogs, toasts, hover cards, context menus, tours and panels. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import * as ContextMenu from '../lib/components/context-menu/context-menu/index.js';
	import * as Dialog from '../lib/components/dialog/dialog/index.js';
	import FloatingPanel from '../lib/components/floating-panel/FloatingPanel.svelte';
	import * as HoverCard from '../lib/components/hover-card/hover-card/index.js';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import * as Popover from '../lib/components/popover/popover/index.js';
	import * as Select from '../lib/components/select/select/index.js';
	import Toaster from '../lib/components/toast/Toaster.svelte';
	import { ToasterStore } from '../lib/components/toast/toaster.svelte.js';
	import Tour from '../lib/components/tour/Tour.svelte';
	import { TourController } from '../lib/components/tour/tour-controller.svelte.js';

	interface Props {
		show: 'select' | 'dialog' | 'toast' | 'hover-card' | 'context-menu' | 'tour' | 'panel';
		fruit?: string | null;
		store?: ToasterStore;
		tour?: TourController;
		panel?: boolean;
		log?: string[];
	}

	let {
		show,
		fruit = $bindable(null),
		store = new ToasterStore(),
		tour = new TourController([{ title: 'Intro' }]),
		panel = true,
		log = []
	}: Props = $props();

	const fruits = new ListCollection(['Apple', 'Banana', 'Cherry']);
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	{#if show === 'select'}
		<Select.Root bind:value={fruit}>
			<Select.Trigger aria-label="Fruit"><Select.Value placeholder="Fruit" /></Select.Trigger>
			<Select.Content>
				<Select.Item value="a" label="Apple" />
				<Select.Item value="b" label="Banana" />
				<Select.Item value="c">Cherry</Select.Item>
			</Select.Content>
		</Select.Root>
	{:else if show === 'dialog'}
		<button type="button" data-testid="outside">Outside</button>
		<Dialog.Root>
			<Dialog.Trigger>Open dialog</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.TitleBar>Settings</Dialog.TitleBar>
				<Select.Root
					collection={fruits}
					bind:value={fruit}
					placeholder="Fruit"
					label="Fruit"
				/>
				<Dialog.Root>
					<Dialog.Trigger>Open inner</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.TitleBar>Inner</Dialog.TitleBar>
						<Dialog.Actions><Dialog.Close>Done</Dialog.Close></Dialog.Actions>
					</Dialog.Content>
				</Dialog.Root>
				<Dialog.Actions><Dialog.Close>Finish</Dialog.Close></Dialog.Actions>
			</Dialog.Content>
		</Dialog.Root>
	{:else if show === 'toast'}
		<Toaster {store} maxVisible={1} />
	{:else if show === 'hover-card'}
		<HoverCard.Root openDelay={50} closeDelay={50}>
			<HoverCard.Trigger
				><a href="#profile" aria-describedby="hint">@ana</a></HoverCard.Trigger
			>
			<HoverCard.Content>Ana Souza, designer</HoverCard.Content>
		</HoverCard.Root>
		<span id="hint">Profile</span>
		<Popover.Root>
			<Popover.Trigger>Links</Popover.Trigger>
			<Popover.Content role="group" aria-label="Links">
				<a href="#docs">Docs</a>
			</Popover.Content>
		</Popover.Root>
	{:else if show === 'context-menu'}
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				<div class="area" role="button" tabindex="0" aria-label="Canvas">Canvas</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<Menu.Item onSelect={() => log.push('copy')}>Copy</Menu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{:else if show === 'tour'}
		<button type="button" id="tour-target">Target</button>
		<Tour controller={tour} />
	{:else if show === 'panel'}
		<div class="stage">
			{#if panel}
				<FloatingPanel
					title="Tools"
					rect={{ x: 20, y: 20, width: 260, height: 180 }}
					onRectChange={(rect) => log.push(`rect ${rect.width}`)}
				>
					<p>Tool content</p>
				</FloatingPanel>
			{/if}
		</div>
	{/if}
</ThemeProvider>

<style>
	.area {
		width: 200px;
		height: 120px;
	}

	.stage {
		position: relative;
		width: 600px;
		height: 400px;
	}
</style>
