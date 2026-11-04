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

<!-- Test helper: the overlays, pickers and shortcut components of phase F9, one at a time. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import SystemScope from '../lib/foundation/SystemScope.svelte';
	import { fallbackSystemSettings } from '../lib/foundation/system-settings.js';
	import { Platform, type OperatingSystem } from '../lib/foundation/platform.js';
	import Button from '../lib/components/button/Button.svelte';
	import * as Popover from '../lib/components/popover/popover/index.js';
	import * as HoverCard from '../lib/components/hover-card/hover-card/index.js';
	import * as ContextMenu from '../lib/components/context-menu/context-menu/index.js';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import Calendar from '../lib/components/calendar/Calendar.svelte';
	import type { DateRange } from '../lib/components/calendar/calendar-math.js';
	import DateEntry from '../lib/components/entries/DateEntry.svelte';
	import ColorPicker from '../lib/components/color-picker/ColorPicker.svelte';
	import * as Sheet from '../lib/components/sheet/sheet/index.js';
	import Toaster from '../lib/components/toast/Toaster.svelte';
	import { ToasterStore } from '../lib/components/toast/toaster.svelte.js';
	import FloatingPanel from '../lib/components/floating-panel/FloatingPanel.svelte';
	import Tour from '../lib/components/tour/Tour.svelte';
	import { TourController } from '../lib/components/tour/tour-controller.svelte.js';
	import ShortcutRecorder from '../lib/components/shortcuts/ShortcutRecorder.svelte';
	import CommandPalette from '../lib/components/shortcuts/CommandPalette.svelte';
	import type { Shortcut } from '../lib/shortcuts/shortcut.js';
	import type { Command } from '../lib/shortcuts/commands.js';

	interface Props {
		show: string;
		os?: OperatingSystem;
		date?: Date | null;
		range?: DateRange | null;
		rangeMode?: boolean;
		color?: string;
		sheetOpen?: boolean;
		snap?: number;
		store?: ToasterStore;
		rect?: { x: number; y: number; width: number; height: number };
		tour?: TourController;
		shortcut?: Shortcut | null;
		paletteOpen?: boolean;
		commands?: readonly Command[];
		log?: string[];
		bottomTrigger?: boolean;
	}

	let {
		show,
		os = 'linux',
		date = $bindable(null),
		range = $bindable(null),
		rangeMode = false,
		color = $bindable('#3584E4'),
		sheetOpen = $bindable(false),
		snap = $bindable(0),
		store = new ToasterStore(),
		rect = $bindable({ x: 20, y: 20, width: 260, height: 180 }),
		tour = new TourController([{ title: 'Intro' }]),
		shortcut = $bindable(null),
		paletteOpen = $bindable(false),
		commands = [],
		log = [],
		bottomTrigger = false
	}: Props = $props();

	const settings = $derived(fallbackSystemSettings(new Platform({ os, isWeb: false })));
</script>

<SystemScope {settings}>
	<ThemeProvider mode="light" highContrast={false} accent="blue">
		<div class="harness" data-bottom={bottomTrigger ? '' : undefined}>
			{#if show === 'popover'}
				<button type="button">Before</button>
				<Popover.Root>
					<Popover.Trigger>Options</Popover.Trigger>
					<Popover.Content>
						<Popover.Title>Options</Popover.Title>
						<input aria-label="Name" />
						<Popover.Root>
							<Popover.Trigger>More</Popover.Trigger>
							<Popover.Content>
								<button type="button">Inner</button>
							</Popover.Content>
						</Popover.Root>
					</Popover.Content>
				</Popover.Root>
			{:else if show === 'hover-card'}
				<HoverCard.Root openDelay={50} closeDelay={50}>
					<HoverCard.Trigger><a href="#profile">@ana</a></HoverCard.Trigger>
					<HoverCard.Content>Ana Souza, designer</HoverCard.Content>
				</HoverCard.Root>
			{:else if show === 'context-menu'}
				<ContextMenu.Root>
					<ContextMenu.Trigger>
						<div class="area" tabindex="0" role="button" aria-label="Canvas">
							Canvas
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<Menu.Item onSelect={() => log.push('copy')}>Copy</Menu.Item>
						<Menu.Item onSelect={() => log.push('paste')}>Paste</Menu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			{:else if show === 'calendar'}
				<Calendar
					bind:value={date}
					bind:rangeValue={range}
					range={rangeMode}
					today={new Date(2026, 10, 4)}
					min={new Date(2026, 0, 1)}
					max={new Date(2026, 11, 31)}
					showWeekNumbers
				/>
			{:else if show === 'date-entry'}
				<DateEntry bind:value={date} aria-label="Due" />
			{:else if show === 'color'}
				<ColorPicker bind:value={color} swatches={['#E62D42', '#3A944A']} />
			{:else if show === 'sheet'}
				<button type="button">Before</button>
				<Sheet.Root bind:open={sheetOpen} side="bottom" snapPoints={[0.3, 0.6]} bind:snap>
					<Sheet.Trigger>Open sheet</Sheet.Trigger>
					<Sheet.Content>
						<Sheet.Handle />
						<Sheet.Header title="Filters" />
						<Sheet.Body><input aria-label="Filter" /></Sheet.Body>
					</Sheet.Content>
				</Sheet.Root>
			{:else if show === 'toast'}
				<Toaster {store} />
			{:else if show === 'panel'}
				<div class="stage">
					<FloatingPanel title="Tools" bind:rect onClose={() => log.push('close')}>
						<p>Tool content</p>
					</FloatingPanel>
				</div>
			{:else if show === 'tour'}
				<Button id="tour-target">Target</Button>
				<Tour controller={tour} onFinish={(completed) => log.push(`finish ${completed}`)} />
			{:else if show === 'recorder'}
				<ShortcutRecorder bind:value={shortcut} aria-label="Shortcut" />
			{:else if show === 'palette'}
				<CommandPalette bind:open={paletteOpen} {commands} />
			{/if}
		</div>
	</ThemeProvider>
</SystemScope>

<style>
	.harness {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 8px;
	}

	[data-bottom] {
		position: fixed;
		bottom: 0;
	}

	.area {
		width: 200px;
		height: 120px;
		border: 1px solid;
	}

	.stage {
		position: relative;
		width: 600px;
		height: 400px;
	}
</style>
