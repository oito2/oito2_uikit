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

<!-- Test helper: overlays opened from inside dialogs, sheets and the command palette. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import * as Dialog from '../lib/components/dialog/dialog/index.js';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import * as Popover from '../lib/components/popover/popover/index.js';
	import * as Select from '../lib/components/select/select/index.js';
	import * as Sheet from '../lib/components/sheet/sheet/index.js';
	import CommandPalette from '../lib/components/shortcuts/CommandPalette.svelte';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import type { Command } from '../lib/shortcuts/commands.js';

	interface Props {
		show: 'dialog' | 'sheet' | 'palette' | 'remove';
		fruit?: string | null;
		log?: string[];
	}

	let { show, fruit = $bindable(null), log = [] }: Props = $props();

	const fruits = new ListCollection(['Apple', 'Banana', 'Cherry']);
	let paletteOpen = $state(false);
	let dialogOpen = $state(false);
	let rows = $state(['One', 'Two']);
	let fallback = $state<HTMLElement | null>(null);

	const commands: Command[] = [
		{ id: 'about', label: 'About', onInvoke: () => (dialogOpen = true) }
	];
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	{#if show === 'dialog'}
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
				<Popover.Root>
					<Popover.Trigger>Details</Popover.Trigger>
					<Popover.Content>
						<button type="button">Inside popover</button>
					</Popover.Content>
				</Popover.Root>
				<Menu.Root>
					<Menu.Trigger>Actions</Menu.Trigger>
					<Menu.Content>
						<Menu.Item onSelect={() => log.push('copy')}>Copy</Menu.Item>
						<Menu.Item onSelect={() => log.push('cut')}>Cut</Menu.Item>
					</Menu.Content>
				</Menu.Root>
			</Dialog.Content>
		</Dialog.Root>
	{:else if show === 'sheet'}
		<Sheet.Root side="end">
			<Sheet.Trigger>Open sheet</Sheet.Trigger>
			<Sheet.Content>
				<Sheet.Header title="Filters" />
				<Sheet.Body>
					<Menu.Root>
						<Menu.Trigger>Sort</Menu.Trigger>
						<Menu.Content>
							<Menu.Item onSelect={() => log.push('name')}>By name</Menu.Item>
							<Menu.Item onSelect={() => log.push('date')}>By date</Menu.Item>
						</Menu.Content>
					</Menu.Root>
				</Sheet.Body>
			</Sheet.Content>
		</Sheet.Root>
	{:else if show === 'palette'}
		<button type="button" onclick={() => (paletteOpen = true)}>Commands</button>
		<CommandPalette bind:open={paletteOpen} {commands} />
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Content>
				<Dialog.TitleBar>About</Dialog.TitleBar>
				<Dialog.Actions>
					<Dialog.Close>Done</Dialog.Close>
				</Dialog.Actions>
			</Dialog.Content>
		</Dialog.Root>
	{:else if show === 'remove'}
		<h2 tabindex="-1" bind:this={fallback}>Rows</h2>
		{#each rows as row (row)}
			<Dialog.Root>
				<Dialog.Trigger>Delete {row}</Dialog.Trigger>
				<Dialog.Content role="alertdialog" finalFocus={() => fallback}>
					<Dialog.TitleBar>Delete {row}?</Dialog.TitleBar>
					<Dialog.Actions>
						<button
							type="button"
							onclick={() => (rows = rows.filter((each) => each !== row))}
						>
							Confirm
						</button>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
		{/each}
	{/if}
	<button type="button" data-testid="after">After</button>
</ThemeProvider>
