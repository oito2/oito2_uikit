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
	import Compass from '@lucide/svelte/icons/compass';
	import Image from '@lucide/svelte/icons/image';
	import Library from '@lucide/svelte/icons/library';
	import Palette from '@lucide/svelte/icons/palette';
	import Star from '@lucide/svelte/icons/star';
	import { Banner, Button } from '@oito2/ui';

	const apps = [
		{ id: 'photos', title: 'Photos', subtitle: 'Browse your library', icon: Image },
		{ id: 'maps', title: 'Maps', subtitle: 'Find your way', icon: Compass },
		{ id: 'books', title: 'Books', subtitle: 'Read anywhere', icon: Library }
	];

	let opened = $state('none');
	let chosen = $state('maps');
	let hovered = $state(false);
</script>

{#snippet star()}<Star size={32} aria-hidden="true" />{/snippet}
{#snippet palette()}<Palette size={32} aria-hidden="true" />{/snippet}

<main class="showcase-page">
	<p>
		A banner is a card-like surface that promotes something, such as an app in a store grid.
		Give it a <code>title</code>, a <code>subtitle</code> and an <code>icon</code> for the tile
		layout, or any content as children. With <code>onclick</code> it is a button whose border strengthens
		on hover.
	</p>

	<section aria-labelledby="banner-tile">
		<h2 id="banner-tile">Tile layout</h2>
		<div class="grid">
			{#each apps as app (app.id)}
				<Banner
					title={app.title}
					subtitle={app.subtitle}
					onclick={() => (opened = app.title)}
				>
					{#snippet icon()}<app.icon size={32} aria-hidden="true" />{/snippet}
				</Banner>
			{/each}
		</div>
		<p>Opened: {opened}.</p>
	</section>

	<section aria-labelledby="banner-selection">
		<h2 id="banner-selection">Selection</h2>
		<p>With <code>selected</code> a banner shows as the chosen one of a group.</p>
		<div class="grid">
			{#each apps as app (app.id)}
				<Banner
					title={app.title}
					subtitle={chosen === app.id ? 'Selected' : 'Click to select'}
					selected={chosen === app.id}
					onclick={() => (chosen = app.id)}
				>
					{#snippet icon()}<app.icon size={32} aria-hidden="true" />{/snippet}
				</Banner>
			{/each}
		</div>
	</section>

	<section aria-labelledby="banner-colors">
		<h2 id="banner-colors">Colors</h2>
		<p>
			<code>tint</code> blends a color lightly over the background; <code>color</code> replaces
			the background.
		</p>
		<div class="grid">
			<Banner
				title="Success tint"
				subtitle="A light wash of the success color"
				tint="var(--oito2-color-success)"
				icon={star}
			/>
			<Banner
				title="Warning tint"
				subtitle="A light wash of the warning color"
				tint="var(--oito2-color-warning)"
				icon={star}
			/>
			<Banner
				title="Container color"
				subtitle="On the secondary container"
				color="var(--oito2-color-secondary-container)"
				icon={palette}
			/>
		</div>
	</section>

	<section aria-labelledby="banner-custom">
		<h2 id="banner-custom">Custom content and hover</h2>
		<p>
			Children give the banner any layout. <code>onHoverChange</code> tells when the pointer enters
			and leaves.
		</p>
		<div class="grid">
			<Banner onHoverChange={(value) => (hovered = value)}>
				<div class="custom">
					<strong>Summer sale</strong>
					<span>Up to 40% off on selected themes.</span>
					<div class="row"><Button variant="tonal">See offers</Button></div>
				</div>
			</Banner>
		</div>
		<p>Pointer over the sale banner: {hovered ? 'yes' : 'no'}.</p>
	</section>

	<section aria-labelledby="banner-disabled">
		<h2 id="banner-disabled">Disabled</h2>
		<div class="grid">
			<Banner
				title="Coming soon"
				subtitle="Not available yet"
				icon={star}
				disabled
				onclick={() => {}}
			/>
		</div>
	</section>
</main>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--oito2-space-md);
	}

	.custom {
		display: grid;
		gap: var(--oito2-space-sm);
		padding: var(--oito2-space-lg);
	}

	.custom strong {
		font: var(--oito2-type-title-medium);
	}
</style>
