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
	import { DiagonalClip } from '@oito2/ui';

	const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

	const themes = [
		{ name: 'Blue', light: '#E8F1FC', dark: '#1A3A5E', accent: '#3584E4' },
		{ name: 'Green', light: '#E6F4E8', dark: '#1D3F24', accent: '#3A944A' },
		{ name: 'Red', light: '#FCE8EB', dark: '#5E1A23', accent: '#E62D42' }
	];
</script>

<main class="showcase-page">
	<p>
		<code>DiagonalClip</code> clips its content along a diagonal, keeping the triangle on the
		side of <code>corner</code>. Two of them on top of each other split an area diagonally, for
		example to preview the light and dark variants of a theme in one swatch.
	</p>

	<section aria-labelledby="diagonal-clip-corners">
		<h2 id="diagonal-clip-corners">Corners</h2>
		<div class="row">
			{#each corners as corner (corner)}
				<span class="diagonal-clip-cell">
					<span class="diagonal-clip-frame">
						<DiagonalClip {corner} class="diagonal-clip-fill" />
					</span>
					<code>{corner}</code>
				</span>
			{/each}
		</div>
	</section>

	<section aria-labelledby="diagonal-clip-split">
		<h2 id="diagonal-clip-split">Light and dark swatches</h2>
		<p>Each swatch stacks a top-left light half over a bottom-right dark half.</p>
		<div class="row">
			{#each themes as theme (theme.name)}
				<span class="diagonal-clip-cell">
					<span
						class="diagonal-clip-swatch"
						role="img"
						aria-label="{theme.name} theme, light and dark"
						style:--diagonal-clip-accent={theme.accent}
					>
						<DiagonalClip
							corner="top-left"
							class="diagonal-clip-half"
							style="background: {theme.light}"
						>
							<span class="diagonal-clip-dot"></span>
						</DiagonalClip>
						<DiagonalClip
							corner="bottom-right"
							class="diagonal-clip-half"
							style="background: {theme.dark}"
						>
							<span class="diagonal-clip-dot"></span>
						</DiagonalClip>
					</span>
					<span>{theme.name}</span>
				</span>
			{/each}
		</div>
	</section>
</main>

<style>
	.diagonal-clip-cell {
		display: inline-grid;
		justify-items: center;
		gap: var(--oito2-space-xs);
	}

	.diagonal-clip-frame {
		display: block;
		width: 80px;
		height: 80px;
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-medium);
		overflow: hidden;
	}

	.diagonal-clip-frame :global(.diagonal-clip-fill) {
		width: 100%;
		height: 100%;
		background: var(--oito2-color-primary);
	}

	.diagonal-clip-swatch {
		position: relative;
		display: block;
		width: 96px;
		height: 96px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.diagonal-clip-swatch :global(.diagonal-clip-half) {
		position: absolute;
		inset: 0;
	}

	.diagonal-clip-dot {
		position: absolute;
		inset: 0;
		width: 24px;
		height: 24px;
		margin: auto;
		border-radius: 50%;
		background: var(--diagonal-clip-accent);
	}
</style>
