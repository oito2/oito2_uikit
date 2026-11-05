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
	import Download from '@lucide/svelte/icons/download';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Heart from '@lucide/svelte/icons/heart';
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings';
	import Star from '@lucide/svelte/icons/star';
	import { BackButton, Button, CloseButton, IconButton } from '@oito2/ui';

	const variants = ['filled', 'tonal', 'outlined', 'text', 'elevated'] as const;

	let favorite = $state(false);
	let clicks = $state(0);
</script>

<main class="showcase-page">
	<p>
		Buttons trigger an action. <code>Button</code> has five emphasis levels, from
		<code>filled</code> for the main action to <code>text</code> for the least important one;
		<code>IconButton</code> shows only an icon and names it with a tooltip;
		<code>BackButton</code> and <code>CloseButton</code> are ready-made icon buttons.
	</p>

	<section aria-labelledby="button-variants">
		<h2 id="button-variants">Variants</h2>
		<div class="row">
			{#each variants as variant (variant)}
				<Button {variant} onclick={() => clicks++}>{variant}</Button>
			{/each}
		</div>
		<p>Clicked {clicks} times.</p>
	</section>

	<section aria-labelledby="button-content">
		<h2 id="button-content">Icons, trailing content and links</h2>
		<div class="row">
			<Button icon={Plus}>New file</Button>
			<Button variant="tonal" icon={Download}>Download</Button>
			<Button variant="outlined">
				Options
				{#snippet trailing()}<ChevronDown aria-hidden="true" />{/snippet}
			</Button>
			<Button variant="text" href="https://github.com/oito2/oito2_uikit" target="_blank">
				A link that looks like a button
			</Button>
		</div>
	</section>

	<section aria-labelledby="button-disabled">
		<h2 id="button-disabled">Disabled</h2>
		<div class="row">
			{#each variants as variant (variant)}
				<Button {variant} disabled>{variant}</Button>
			{/each}
		</div>
	</section>

	<section aria-labelledby="icon-buttons">
		<h2 id="icon-buttons">Icon buttons</h2>
		<p>
			The label is the accessible name and the tooltip. With <code>selected</code> an icon button
			is a toggle.
		</p>
		<div class="row">
			<IconButton icon={Settings} label="Settings" />
			<IconButton
				icon={Heart}
				label="Favorite"
				selected={favorite}
				onclick={() => (favorite = !favorite)}
			/>
			<IconButton icon={Star} label="Disabled" disabled />
			<BackButton />
			<CloseButton />
		</div>
	</section>
</main>
