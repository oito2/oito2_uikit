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
	import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
	import Copy from '@lucide/svelte/icons/copy';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Trash from '@lucide/svelte/icons/trash';
	import { ContextMenu, Menu, Shortcut } from '@oito2/ui';

	let action = $state('none');
	let open = $state(false);
	let grid = $state(true);
	let rulers = $state(false);
	let zoom = $state('100');
</script>

<main class="showcase-page">
	<p>
		<code>ContextMenu</code> opens a menu over an area on a secondary click, a long press,
		Shift+F10 or the menu key: where the pointer is, or over the middle of the area from the
		keyboard, with the first item focused. Its content holds the parts of <code>Menu</code>:
		items, check and radio items, groups, separators and submenus.
	</p>

	<section aria-labelledby="context-menu-full">
		<h2 id="context-menu-full">A canvas menu</h2>
		<ContextMenu.Root bind:open>
			<ContextMenu.Trigger>
				<div class="canvas" tabindex="0" role="button">
					Right click, long press or Shift+F10 here
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<Menu.Item icon={Scissors} onSelect={() => (action = 'Cut')}>
					Cut
					{#snippet shortcut()}<Menu.Shortcut
							shortcut={Shortcut.parse('Mod+X')}
						/>{/snippet}
				</Menu.Item>
				<Menu.Item icon={Copy} onSelect={() => (action = 'Copy')}>
					Copy
					{#snippet shortcut()}<Menu.Shortcut
							shortcut={Shortcut.parse('Mod+C')}
						/>{/snippet}
				</Menu.Item>
				<Menu.Item icon={ClipboardPaste} onSelect={() => (action = 'Paste')}>
					Paste
					{#snippet shortcut()}<Menu.Shortcut
							shortcut={Shortcut.parse('Mod+V')}
						/>{/snippet}
				</Menu.Item>
				<Menu.Separator />
				<Menu.Group label="View">
					<Menu.CheckboxItem bind:checked={grid}>Show grid</Menu.CheckboxItem>
					<Menu.CheckboxItem bind:checked={rulers}>Show rulers</Menu.CheckboxItem>
				</Menu.Group>
				<Menu.Separator />
				<Menu.Sub>
					<Menu.SubTrigger inset>Zoom</Menu.SubTrigger>
					<Menu.SubContent>
						<Menu.RadioGroup bind:value={zoom}>
							<Menu.RadioItem value="50">50%</Menu.RadioItem>
							<Menu.RadioItem value="100">100%</Menu.RadioItem>
							<Menu.RadioItem value="200">200%</Menu.RadioItem>
						</Menu.RadioGroup>
					</Menu.SubContent>
				</Menu.Sub>
				<Menu.Item icon={Share2} disabled>Share</Menu.Item>
				<Menu.Separator />
				<Menu.Item icon={Trash} onSelect={() => (action = 'Delete')}>Delete</Menu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
		<p class="note">
			Last action: {action} · Grid: {grid ? 'on' : 'off'} · Rulers: {rulers ? 'on' : 'off'} · Zoom:
			{zoom}% · Menu {open ? 'open' : 'closed'}
		</p>
	</section>

	<section aria-labelledby="context-menu-disabled">
		<h2 id="context-menu-disabled">Disabled</h2>
		<p>A disabled trigger lets the browser show its own menu.</p>
		<ContextMenu.Root>
			<ContextMenu.Trigger disabled>
				<div class="canvas" tabindex="0" role="button">The browser menu opens here</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<Menu.Item>Never shown</Menu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</section>
</main>

<style>
	.canvas {
		display: grid;
		height: 140px;
		place-items: center;
		padding: var(--oito2-space-md);
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-large);
		color: var(--oito2-color-on-surface-variant);
		text-align: center;
	}
</style>
