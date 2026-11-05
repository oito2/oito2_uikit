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
	import { PlaceholderIcon } from '@oito2/ui';

	const sizes = [24, 32, 48, 64, 96];
	const radii = ['none', 'small', 'medium', 'large', 24] as const;

	const albums = [
		{ title: 'Northern Lights', artist: 'Ana Souza' },
		{ title: 'Slow Rivers', artist: 'Bruno Lima' },
		{ title: 'City at Night', artist: 'Carla Dias' }
	];
</script>

<main class="showcase-page">
	<p>
		<code>PlaceholderIcon</code> stands in for a missing picture, such as an album cover or an app
		icon that has not loaded: a rounded square in a container tone with a picture outline in its center.
		It is decorative and hidden from assistive technologies.
	</p>

	<section aria-labelledby="placeholder-icon-sizes">
		<h2 id="placeholder-icon-sizes">Sizes</h2>
		<div class="row">
			{#each sizes as size (size)}
				<span class="placeholder-icon-cell">
					<PlaceholderIcon {size} />
					<span class="note">{size} px</span>
				</span>
			{/each}
		</div>
	</section>

	<section aria-labelledby="placeholder-icon-radius">
		<h2 id="placeholder-icon-radius">Corner radius</h2>
		<p>A token name, or a number of pixels.</p>
		<div class="row">
			{#each radii as radius (radius)}
				<span class="placeholder-icon-cell">
					<PlaceholderIcon size={64} {radius} />
					<span class="note">{radius}</span>
				</span>
			{/each}
		</div>
	</section>

	<section aria-labelledby="placeholder-icon-list">
		<h2 id="placeholder-icon-list">In a list</h2>
		<ul class="placeholder-icon-albums">
			{#each albums as album (album.title)}
				<li>
					<PlaceholderIcon size={48} radius="small" />
					<span>
						<strong>{album.title}</strong><br />
						<span class="note">{album.artist}</span>
					</span>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.placeholder-icon-cell {
		display: inline-grid;
		justify-items: center;
		gap: var(--oito2-space-xs);
	}

	.placeholder-icon-albums {
		display: grid;
		gap: var(--oito2-space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.placeholder-icon-albums li {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-md);
	}
</style>
