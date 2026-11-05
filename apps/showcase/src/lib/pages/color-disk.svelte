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
	import { ColorDisk } from '@oito2/ui';

	const accents = [
		{ name: 'Blue', color: '#3584e4' },
		{ name: 'Teal', color: '#2190a4' },
		{ name: 'Green', color: '#3a944a' },
		{ name: 'Yellow', color: '#c88800' },
		{ name: 'Orange', color: '#ed5b00' },
		{ name: 'Red', color: '#e62d42' },
		{ name: 'Pink', color: '#d56199' },
		{ name: 'Purple', color: '#9141ac' },
		{ name: 'Slate', color: '#6f8396' }
	];
	const pale = [
		{ name: 'White', color: '#ffffff' },
		{ name: 'Light gray', color: '#f6f5f4' },
		{ name: 'Black', color: '#000000' },
		{ name: 'Dark gray', color: '#241f31' }
	];

	let accent = $state('Blue');
	let paper = $state('White');
	let current = $derived(accents.find((each) => each.name === accent)?.color ?? '#3584e4');
</script>

<main class="showcase-page">
	<p>
		<code>ColorDisk</code> is a round color swatch that can be selected, as in accent color
		pickers. A ring in the disk's own hue surrounds it while <code>selected</code>, and a
		fainter one while the pointer hovers it or it has keyboard focus. <code>label</code> names it
		for assistive technologies and is its tooltip.
	</p>

	<section aria-labelledby="color-disk-accent">
		<h2 id="color-disk-accent">Accent picker</h2>
		<p>Each disk is a toggle button; the page keeps which one is selected.</p>
		<div class="row" role="group" aria-label="Accent color">
			{#each accents as each (each.name)}
				<ColorDisk
					color={each.color}
					label={each.name}
					selected={accent === each.name}
					onclick={() => (accent = each.name)}
				/>
			{/each}
		</div>
		<div class="row">
			<span class="sample" style:background={current}></span>
			<span class="note">Accent: {accent} ({current})</span>
		</div>
	</section>

	<section aria-labelledby="color-disk-sizes">
		<h2 id="color-disk-sizes">Sizes</h2>
		<p><code>size</code> sets the diameter of the disk without its ring; it defaults to 20.</p>
		<div class="row">
			<ColorDisk color="#9141ac" label="Purple, 16 pixels" size={16} />
			<ColorDisk color="#9141ac" label="Purple, 20 pixels" />
			<ColorDisk color="#9141ac" label="Purple, 28 pixels" size={28} />
			<ColorDisk color="#9141ac" label="Purple, 40 pixels" size={40} selected />
		</div>
	</section>

	<section aria-labelledby="color-disk-contrast">
		<h2 id="color-disk-contrast">Low-contrast colors</h2>
		<p>
			A disk with less than 3:1 contrast with the surface gets a thin outline, so it doesn't
			blend into the background. Switch between the light and dark theme to see it move.
		</p>
		<div class="row" role="group" aria-label="Paper color">
			{#each pale as each (each.name)}
				<ColorDisk
					color={each.color}
					label={each.name}
					size={28}
					selected={paper === each.name}
					onclick={() => (paper = each.name)}
				/>
			{/each}
		</div>
	</section>

	<section aria-labelledby="color-disk-disabled">
		<h2 id="color-disk-disabled">Disabled</h2>
		<div class="row">
			<ColorDisk color="#3a944a" label="Green (unavailable)" disabled />
			<ColorDisk color="#e62d42" label="Red (unavailable)" selected disabled />
		</div>
	</section>
</main>

<style>
	.sample {
		width: 48px;
		height: 24px;
		border-radius: var(--oito2-radius-small);
	}
</style>
