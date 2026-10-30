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
	import {
		Dialog,
		DialogTitleBar,
		HeaderBar,
		TitleBar,
		WindowButtonLayout,
		windowControlStyles
	} from '@oito2/ui';
	import { SimulatedWindowController } from '#lib/simulated-window.svelte.js';

	const styles = windowControlStyles.filter((style) => style !== 'none');
	// Each sample bar has its own window, so maximizing one changes only its glyph.
	const controllers = Object.fromEntries(
		styles.map((style) => [style, new SimulatedWindowController()])
	);
	let query = $state('');
</script>

<main>
	<h1>Window chrome</h1>
	<p>
		The title bar of the window above follows the desktop: in the browser, pick one in the
		Desktop menu. The bars below show every window control style; hover the buttons, and
		maximize to see the restore glyph.
	</p>

	<section aria-labelledby="styles">
		<h2 id="styles">Window control styles</h2>
		<div class="bars">
			{#each styles as style (style)}
				<TitleBar
					title={style}
					controlStyle={style}
					buttonLayout={WindowButtonLayout.defaultFor(style)}
					controller={controllers[style]}
				/>
				<p class="note">Last action: {controllers[style]?.lastAction || 'none'}</p>
			{/each}
		</div>
	</section>

	<section aria-labelledby="header">
		<h2 id="header">Header bar with search</h2>
		<HeaderBar
			title="Documents"
			searchable
			bind:searchValue={query}
			searchPlaceholder="Search documents"
		/>
		<p class="note">Search text: {query || '(empty)'}</p>
	</section>

	<section aria-labelledby="dialog">
		<h2 id="dialog">Dialog title bar</h2>
		<Dialog.Root>
			<Dialog.Trigger variant="tonal">Open preferences</Dialog.Trigger>
			<Dialog.Content class="preferences">
				<DialogTitleBar title="Preferences" />
				<Dialog.Description>
					The close button sits where the desktop puts it, in its style.
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Root>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-sm);
	}

	.bars {
		display: grid;
		gap: var(--oito2-space-xs);
		max-width: 640px;
	}

	.note {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-body-small);
	}

	:global(.preferences) {
		padding: 0 0 var(--oito2-space-xl);
	}

	:global(.preferences) > :global(p) {
		padding: 0 var(--oito2-space-xl);
	}
</style>
