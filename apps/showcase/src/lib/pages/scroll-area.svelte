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
	import { Button, ScrollArea, Switch, undershoot } from '@oito2/ui';

	const settings = [
		'Wi-Fi',
		'Bluetooth',
		'Airplane mode',
		'Night light',
		'Do not disturb',
		'Automatic updates',
		'Location services',
		'Screen lock',
		'Notifications on lock screen',
		'Sound effects',
		'Reduce motion',
		'Large text'
	];
	const tags = [
		'svelte',
		'tauri',
		'rust',
		'typescript',
		'design-system',
		'gnome',
		'material',
		'accessibility',
		'desktop',
		'linux',
		'windows',
		'macos'
	];

	let viewport = $state<HTMLDivElement | null>(null);
	let alwaysVisible = $state(false);
	let picked = $state('none');
</script>

<main class="showcase-page">
	<p>
		<code>ScrollArea</code> scrolls its content with the oito2 scroll bars instead of the system
		ones: thin rounded thumbs that show while the content scrolls or the pointer is over the
		region. The thumbs can be dragged and the tracks clicked to page. The
		<code>undershoot</code> attachment fades a soft shadow in at the edges of any scrolling element
		while there is more content beyond them, as GTK does.
	</p>

	<section aria-labelledby="scroll-area-vertical">
		<h2 id="scroll-area-vertical">Vertical</h2>
		<p>
			<code>thumbVisibility</code> keeps the thumb shown; the bound <code>viewport</code> sets the
			scroll position from code.
		</p>
		<div class="row">
			<label class="row">Always show the thumb <Switch bind:checked={alwaysVisible} /></label>
			<Button
				variant="text"
				onclick={() => viewport?.scrollTo({ top: 0, behavior: 'smooth' })}
				>To the top</Button
			>
			<Button
				variant="text"
				onclick={() =>
					viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })}
				>To the bottom</Button
			>
		</div>
		<ScrollArea
			class="scroll-area-box scroll-area-tall"
			thumbVisibility={alwaysVisible}
			bind:viewport
		>
			<ul class="scroll-area-settings">
				{#each settings as setting (setting)}
					<li><label class="row">{setting} <Switch /></label></li>
				{/each}
			</ul>
		</ScrollArea>
	</section>

	<section aria-labelledby="scroll-area-horizontal">
		<h2 id="scroll-area-horizontal">Horizontal and both</h2>
		<ScrollArea direction="horizontal" class="scroll-area-box scroll-area-wide">
			<div class="scroll-area-chips">
				{#each tags as tag (tag)}
					<Button variant="outlined" onclick={() => (picked = tag)}>{tag}</Button>
				{/each}
			</div>
		</ScrollArea>
		<p class="note">Picked: {picked}</p>
		<ScrollArea direction="both" class="scroll-area-box scroll-area-tall scroll-area-wide">
			<div class="scroll-area-grid">
				{#each { length: 64 }, index (index)}
					<Button variant="text" onclick={() => (picked = `cell ${index + 1}`)}
						>Cell {index + 1}</Button
					>
				{/each}
			</div>
		</ScrollArea>
	</section>

	<section aria-labelledby="scroll-area-undershoot">
		<h2 id="scroll-area-undershoot">Undershoot</h2>
		<p>
			The shadows use the element's <code>::before</code> and <code>::after</code>. A
			horizontal undershoot needs a flex row, and by default its scroll also follows the
			vertical mouse wheel.
		</p>
		<div class="row top">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="scroll-area-box scroll-area-native"
				tabindex="0"
				role="region"
				aria-label="Lines with undershoot"
				{@attach undershoot()}
			>
				{#each { length: 24 }, i (i)}<p>Line {i + 1}</p>{/each}
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="scroll-area-box scroll-area-native"
				tabindex="0"
				role="region"
				aria-label="Lines with a deep end shadow only"
				{@attach undershoot({ start: false, extent: 40 })}
			>
				{#each { length: 24 }, i (i)}<p>Line {i + 1}</p>{/each}
			</div>
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="scroll-area-box scroll-area-row"
			tabindex="0"
			role="region"
			aria-label="Tags with horizontal undershoot"
			{@attach undershoot({ orientation: 'horizontal' })}
		>
			{#each tags as tag (tag)}<span class="scroll-area-tag">{tag}</span>{/each}
		</div>
	</section>
</main>

<style>
	:global(.scroll-area-box) {
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	:global(.scroll-area-tall) {
		height: 220px;
		width: min(320px, 100%);
	}

	:global(.scroll-area-wide) {
		width: min(480px, 100%);
	}

	.scroll-area-settings {
		margin: 0;
		padding: var(--oito2-space-sm) var(--oito2-space-md);
		list-style: none;
	}

	.scroll-area-settings label {
		justify-content: space-between;
		padding: var(--oito2-space-xs) 0;
	}

	.scroll-area-chips {
		display: flex;
		gap: var(--oito2-space-sm);
		padding: var(--oito2-space-sm);
		width: max-content;
	}

	.scroll-area-grid {
		display: grid;
		grid-template-columns: repeat(8, 120px);
		gap: var(--oito2-space-xs);
		padding: var(--oito2-space-sm);
	}

	.scroll-area-native {
		width: 200px;
		height: 200px;
		overflow: auto;
	}

	.scroll-area-native p {
		margin: 0;
		padding: 2px var(--oito2-space-sm);
	}

	.scroll-area-row {
		display: flex;
		gap: var(--oito2-space-sm);
		width: min(480px, 100%);
		padding: var(--oito2-space-sm);
		overflow-x: auto;
	}

	.scroll-area-tag {
		flex: none;
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
		border-radius: var(--oito2-radius-small);
		background: var(--oito2-color-secondary-container);
		color: var(--oito2-color-on-secondary-container);
	}
</style>
