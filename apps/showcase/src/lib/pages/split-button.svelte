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
	import Copy from '@lucide/svelte/icons/copy';
	import FileText from '@lucide/svelte/icons/file-text';
	import Save from '@lucide/svelte/icons/save';
	import Send from '@lucide/svelte/icons/send';
	import { Menu, SplitButton } from '@oito2/ui';

	const variants = ['elevated', 'filled', 'outlined'] as const;

	let action = $state('none');
</script>

<main class="showcase-page">
	<p>
		<code>SplitButton</code> is a button with a main action and an attached arrow that opens a
		menu of related actions. The children are the main label and <code>onclick</code> its
		action;
		<code>menu</code> holds the <code>Menu.Item</code>s.
	</p>

	<section aria-labelledby="split-button-variants">
		<h2 id="split-button-variants">Variants</h2>
		<p>
			Both parts share the look: <code>elevated</code> by default, <code>filled</code> or
			<code>outlined</code>.
		</p>
		<div class="row">
			{#each variants as variant (variant)}
				<SplitButton {variant} onclick={() => (action = `save (${variant})`)}>
					Save
					{#snippet menu()}
						<Menu.Item onSelect={() => (action = `save as (${variant})`)}
							>Save as…</Menu.Item
						>
						<Menu.Item onSelect={() => (action = `save a copy (${variant})`)}>
							Save a copy
						</Menu.Item>
					{/snippet}
				</SplitButton>
			{/each}
		</div>
		<p class="note" aria-live="polite">Last action: {action}</p>
	</section>

	<section aria-labelledby="split-button-icons">
		<h2 id="split-button-icons">Icons and a richer menu</h2>
		<p>
			<code>icon</code> goes before the main label; the menu takes any menu part, such as
			items with icons and shortcuts or a separator. <code>menuLabel</code> names the arrow part,
			"More options" by default.
		</p>
		<div class="row">
			<SplitButton
				variant="filled"
				icon={Send}
				menuLabel="More ways to send"
				onclick={() => (action = 'send')}
			>
				Send
				{#snippet menu()}
					<Menu.Item onSelect={() => (action = 'schedule')}>Schedule…</Menu.Item>
					<Menu.Item onSelect={() => (action = 'send later')}
						>Send tomorrow morning</Menu.Item
					>
				{/snippet}
			</SplitButton>
			<SplitButton icon={Save} onclick={() => (action = 'save document')}>
				Save
				{#snippet menu()}
					<Menu.Item icon={FileText} onSelect={() => (action = 'save as')}>
						Save as…
						{#snippet shortcut()}Ctrl+Shift+S{/snippet}
					</Menu.Item>
					<Menu.Item icon={Copy} onSelect={() => (action = 'save a copy')}
						>Save a copy</Menu.Item
					>
					<Menu.Separator />
					<Menu.Item disabled>Save to the cloud</Menu.Item>
				{/snippet}
			</SplitButton>
		</div>
	</section>

	<section aria-labelledby="split-button-disabled">
		<h2 id="split-button-disabled">Disabled</h2>
		<p><code>disabled</code> turns off both parts.</p>
		<div class="row">
			{#each variants as variant (variant)}
				<SplitButton {variant} disabled>
					Save
					{#snippet menu()}
						<Menu.Item>Save as…</Menu.Item>
					{/snippet}
				</SplitButton>
			{/each}
		</div>
	</section>
</main>
