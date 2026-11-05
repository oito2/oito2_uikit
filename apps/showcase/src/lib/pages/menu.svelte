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
	import Clipboard from '@lucide/svelte/icons/clipboard-paste';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Settings from '@lucide/svelte/icons/settings';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Trash from '@lucide/svelte/icons/trash';
	import { IconButton, Menu, Shortcut } from '@oito2/ui';

	let lastAction = $state('none');
	let showHidden = $state(true);
	let showExtensions = $state(false);
	let sort = $state<string | null>('name');
	let view = $state<string | null>('list');
</script>

<main class="showcase-page">
	<p>
		<code>Menu</code> lists actions opened from a button, following the WAI-ARIA menu button
		pattern: the arrows move between items, typing finds an item and Escape closes the menu.
		Compose it with <code>Menu.Trigger</code> and <code>Menu.Content</code>.
	</p>

	<section aria-labelledby="menu-actions">
		<h2 id="menu-actions">Actions</h2>
		<p>
			Items take an <code>icon</code> and a <code>shortcut</code>; <code>inset</code> aligns an
			item without an icon with the others.
		</p>
		<div class="row">
			<Menu.Root>
				<Menu.Trigger>Edit</Menu.Trigger>
				<Menu.Content>
					<Menu.Item icon={Scissors} onSelect={() => (lastAction = 'cut')}>
						Cut
						{#snippet shortcut()}<Menu.Shortcut
								shortcut={Shortcut.parse('Mod+X')}
							/>{/snippet}
					</Menu.Item>
					<Menu.Item icon={Copy} onSelect={() => (lastAction = 'copy')}>
						Copy
						{#snippet shortcut()}<Menu.Shortcut
								shortcut={Shortcut.parse('Mod+C')}
							/>{/snippet}
					</Menu.Item>
					<Menu.Item icon={Clipboard} onSelect={() => (lastAction = 'paste')}>
						Paste
						{#snippet shortcut()}<Menu.Shortcut
								shortcut={Shortcut.parse('Mod+V')}
							/>{/snippet}
					</Menu.Item>
					<Menu.Separator />
					<Menu.Item inset onSelect={() => (lastAction = 'select all')}
						>Select all</Menu.Item
					>
					<Menu.Item inset disabled>Undo</Menu.Item>
				</Menu.Content>
			</Menu.Root>
			<span>Last action: {lastAction}.</span>
		</div>
	</section>

	<section aria-labelledby="menu-settings">
		<h2 id="menu-settings">Check boxes and radio items</h2>
		<p>
			A <code>Menu.CheckboxItem</code> keeps the menu open so several settings can change at
			once; a
			<code>Menu.RadioItem</code> picks one value of a <code>Menu.RadioGroup</code>.
		</p>
		<div class="row">
			<Menu.Root>
				<Menu.Trigger variant="tonal">View</Menu.Trigger>
				<Menu.Content>
					<Menu.Group label="Show">
						<Menu.CheckboxItem bind:checked={showHidden}>Hidden files</Menu.CheckboxItem
						>
						<Menu.CheckboxItem bind:checked={showExtensions}
							>File extensions</Menu.CheckboxItem
						>
					</Menu.Group>
					<Menu.Separator />
					<Menu.Group label="Sort by">
						<Menu.RadioGroup bind:value={sort}>
							<Menu.RadioItem value="name">Name</Menu.RadioItem>
							<Menu.RadioItem value="date">Date modified</Menu.RadioItem>
							<Menu.RadioItem value="size">Size</Menu.RadioItem>
						</Menu.RadioGroup>
					</Menu.Group>
					<Menu.Separator />
					<Menu.Label>Layout</Menu.Label>
					<Menu.RadioGroup bind:value={view}>
						<Menu.RadioItem value="list">List</Menu.RadioItem>
						<Menu.RadioItem value="grid">Grid</Menu.RadioItem>
					</Menu.RadioGroup>
				</Menu.Content>
			</Menu.Root>
			<span>
				Hidden files {showHidden ? 'shown' : 'hidden'}, extensions {showExtensions
					? 'shown'
					: 'hidden'}, sorted by {sort}, {view} layout.
			</span>
		</div>
	</section>

	<section aria-labelledby="menu-submenu">
		<h2 id="menu-submenu">Submenus and custom trigger</h2>
		<p>
			<code>Menu.Sub</code> opens a submenu on hover, click, Enter or the right arrow. With
			<code>child</code>, the trigger renders your own element, here an icon button.
		</p>
		<div class="row">
			<Menu.Root>
				<Menu.Trigger>
					{#snippet child({ props })}
						<IconButton icon={Settings} label="File actions" {...props} />
					{/snippet}
				</Menu.Trigger>
				<Menu.Content>
					<Menu.Item icon={Pencil} onSelect={() => (lastAction = 'rename')}
						>Rename</Menu.Item
					>
					<Menu.Item icon={Download} onSelect={() => (lastAction = 'download')}
						>Download</Menu.Item
					>
					<Menu.Sub>
						<Menu.SubTrigger icon={Share2}>Share</Menu.SubTrigger>
						<Menu.SubContent>
							<Menu.Item onSelect={() => (lastAction = 'share by email')}
								>By email</Menu.Item
							>
							<Menu.Item onSelect={() => (lastAction = 'copy link')}
								>Copy the link</Menu.Item
							>
							<Menu.Item disabled>To a printer</Menu.Item>
						</Menu.SubContent>
					</Menu.Sub>
					<Menu.Separator />
					<Menu.Item icon={Trash} onSelect={() => (lastAction = 'delete')}
						>Delete</Menu.Item
					>
				</Menu.Content>
			</Menu.Root>
			<span>Last action: {lastAction}.</span>
		</div>
	</section>

	<section aria-labelledby="menu-placement">
		<h2 id="menu-placement">Placement</h2>
		<p>The menu opens under its trigger; <code>placement</code> moves it.</p>
		<div class="row">
			{#each ['bottom-start', 'bottom-end', 'top-start', 'right-start'] as const as placement (placement)}
				<Menu.Root>
					<Menu.Trigger variant="text">{placement}</Menu.Trigger>
					<Menu.Content {placement}>
						<Menu.Item onSelect={() => (lastAction = `first (${placement})`)}
							>First</Menu.Item
						>
						<Menu.Item onSelect={() => (lastAction = `second (${placement})`)}
							>Second</Menu.Item
						>
					</Menu.Content>
				</Menu.Root>
			{/each}
		</div>
	</section>
</main>
