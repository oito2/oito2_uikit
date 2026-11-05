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
	import { BorderContainer, Button } from '@oito2/ui';

	const tints = [
		{ name: 'Primary', color: 'var(--oito2-color-primary)' },
		{ name: 'Success', color: 'var(--oito2-color-success)' },
		{ name: 'Warning', color: 'var(--oito2-color-warning)' },
		{ name: 'Error', color: 'var(--oito2-color-error)' },
		{ name: 'Info', color: 'var(--oito2-color-info)' }
	];
	const opacities = [0.05, 0.1, 0.2, 0.4];

	let opacity = $state(0.1);
</script>

<main class="showcase-page">
	<p>
		A border container groups content inside a rounded, outlined box. With <code>tint</code> the
		border and a light wash of the background take a color, and <code>tintOpacity</code> sets how
		strong the wash is.
	</p>

	<section aria-labelledby="border-container-plain">
		<h2 id="border-container-plain">Plain</h2>
		<BorderContainer>
			<div class="inner">
				A bordered container on the surface color, for grouping related content.
			</div>
		</BorderContainer>
	</section>

	<section aria-labelledby="border-container-tints">
		<h2 id="border-container-tints">Tints</h2>
		<div class="grid">
			{#each tints as tint (tint.name)}
				<BorderContainer tint={tint.color}>
					<div class="inner">{tint.name} tint.</div>
				</BorderContainer>
			{/each}
		</div>
	</section>

	<section aria-labelledby="border-container-opacity">
		<h2 id="border-container-opacity">Tint opacity</h2>
		<div class="row">
			{#each opacities as value (value)}
				<Button
					variant={opacity === value ? 'tonal' : 'text'}
					aria-pressed={opacity === value}
					onclick={() => (opacity = value)}>{value * 100}%</Button
				>
			{/each}
		</div>
		<BorderContainer tint="var(--oito2-color-primary)" tintOpacity={opacity}>
			<div class="inner">The wash is the primary color at {opacity * 100}%.</div>
		</BorderContainer>
	</section>
</main>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--oito2-space-md);
	}

	.inner {
		padding: var(--oito2-space-lg);
	}
</style>
