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

<!-- Test helper: components given handlers and attributes of their own element. -->
<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import IconButton from '../lib/components/button/IconButton.svelte';
	import * as ToggleGroup from '../lib/components/choice/toggle-group/index.js';
	import OptionButton from '../lib/components/controls/OptionButton.svelte';
	import ColorDisk from '../lib/components/controls/ColorDisk.svelte';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import * as Popover from '../lib/components/popover/popover/index.js';
	import * as Sheet from '../lib/components/sheet/sheet/index.js';
	import * as HoverCard from '../lib/components/hover-card/hover-card/index.js';
	import Chip from '../lib/components/surfaces/Chip.svelte';
	import EditableLabel from '../lib/components/text/EditableLabel.svelte';
	import TimeEntry from '../lib/components/entries/TimeEntry.svelte';
	import type { TimeOfDay } from '../lib/components/entries/date-time.js';
	import type { IconComponent } from '../lib/components/icon.js';

	const Star = StarIcon as IconComponent;

	interface Props {
		show:
			| 'tooltip-triggers'
			| 'menu'
			| 'popover'
			| 'sheet'
			| 'hover-card'
			| 'theme'
			| 'chip'
			| 'editable-label'
			| 'time-entry';
		/** Whether the handlers given to the components call `preventDefault()`. */
		cancel?: boolean;
		log?: string[];
		toggles?: readonly string[];
		sheetOpen?: boolean;
		time?: TimeOfDay | null;
	}

	let {
		show,
		cancel = false,
		log = [],
		toggles = $bindable([]),
		sheetOpen = $bindable(true),
		time = $bindable(null)
	}: Props = $props();

	/** Returns a handler that logs `name` and, with `cancel`, prevents the default. */
	const handler = (name: string) => (event: Event) => {
		log.push(name);
		if (cancel) event.preventDefault();
	};
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue" style="min-height: 123px">
	{#if show === 'tooltip-triggers'}
		<IconButton icon={Star} label="Favorite" onfocus={handler('icon-button')} />
		<ToggleGroup.Root bind:value={toggles} aria-label="Format">
			<ToggleGroup.Item
				value="bold"
				label="Bold"
				icon={Star}
				onfocus={handler('toggle-item')}
			/>
		</ToggleGroup.Root>
		<OptionButton icon={Star} label="Options" onfocus={handler('option-button')} />
		<ColorDisk color="#3366ff" label="Blue" onfocus={handler('color-disk')} />
	{:else if show === 'menu'}
		<Menu.Root>
			<Menu.Trigger onclick={handler('menu-click')} onkeydown={handler('menu-key')}
				>Actions</Menu.Trigger
			>
			<Menu.Content>
				<Menu.Item>Copy</Menu.Item>
			</Menu.Content>
		</Menu.Root>
	{:else if show === 'popover'}
		<Popover.Root>
			<Popover.Trigger onclick={handler('popover-click')}>Details</Popover.Trigger>
			<Popover.Content>
				<button type="button">Inside popover</button>
			</Popover.Content>
		</Popover.Root>
	{:else if show === 'sheet'}
		<Sheet.Root bind:open={sheetOpen} side="end">
			<Sheet.Content>
				<Sheet.Close onclick={handler('sheet-close')}>Done</Sheet.Close>
			</Sheet.Content>
		</Sheet.Root>
	{:else if show === 'hover-card'}
		<HoverCard.Root openDelay={50} closeDelay={50}>
			<HoverCard.Trigger><a href="#profile">@ana</a></HoverCard.Trigger>
			<HoverCard.Content onpointerenter={handler('card-enter')}
				>Ana Souza, designer</HoverCard.Content
			>
		</HoverCard.Root>
	{:else if show === 'theme'}
		<p>Themed</p>
	{:else if show === 'chip'}
		<Chip variant="input" onRemove={() => log.push('remove')} id="tag-chip" data-kind="tag"
			>Svelte</Chip
		>
	{:else if show === 'editable-label'}
		<EditableLabel
			text="Notes"
			onSubmit={() => log.push('submit')}
			onkeydown={handler('label-key')}
			ondblclick={handler('label-dblclick')}
		/>
	{:else if show === 'time-entry'}
		<TimeEntry aria-label="Time" bind:value={time} oninput={handler('time-input')} />
	{/if}
</ThemeProvider>
