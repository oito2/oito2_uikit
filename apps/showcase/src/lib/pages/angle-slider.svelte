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
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import { AngleSlider } from '@oito2/ui';

	let rotation = $state(45);
	let direction = $state(90);
	let committed = $state(90);
	let fine = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>AngleSlider</code> is a round dial that picks an angle in degrees, from 0 at the top
		clockwise to just under 360, such as a rotation or a gradient direction. Drag or click to
		point the dial; the arrow keys turn it by <code>step</code>, Page Up and Page Down by
		<code>pageStep</code>, and Home goes back to 0. The value wraps around.
	</p>

	<section aria-labelledby="angle-slider-basic">
		<h2 id="angle-slider-basic">Rotation</h2>
		<p>Bind <code>value</code>; here it turns the arrow next to the dial, in steps of 5°.</p>
		<div class="row">
			<AngleSlider bind:value={rotation} step={5} aria-label="Rotation" />
			<span class="preview" style:rotate="{rotation}deg"
				><ArrowUp size={40} aria-hidden="true" /></span
			>
			<span class="note">Rotation: {rotation}°</span>
		</div>
	</section>

	<section aria-labelledby="angle-slider-gradient">
		<h2 id="angle-slider-gradient">Gradient direction</h2>
		<p>
			<code>onValueCommit</code> receives the final angle when a drag ends and after each key press,
			so expensive work can wait for it.
		</p>
		<div class="row">
			<AngleSlider
				bind:value={direction}
				onValueCommit={(next) => (committed = next)}
				size={120}
				aria-label="Gradient direction"
			/>
			<div
				class="swatch"
				style:background="linear-gradient({direction}deg, var(--oito2-color-primary),
				var(--oito2-color-tertiary))"
			></div>
			<span class="note">Live: {direction}° · Committed: {committed}°</span>
		</div>
	</section>

	<section aria-labelledby="angle-slider-markers">
		<h2 id="angle-slider-markers">Markers, size and value</h2>
		<p>
			<code>markers</code> draws ticks at those angles (the four quarters by default),
			<code>size</code> sets the diameter and <code>showValue</code> hides the number in the middle.
		</p>
		<div class="row">
			<AngleSlider
				bind:value={fine}
				markers={[0, 45, 90, 135, 180, 225, 270, 315]}
				pageStep={45}
				aria-label="Eight markers"
			/>
			<AngleSlider value={30} markers={[]} size={64} aria-label="No markers" />
			<AngleSlider value={120} showValue={false} size={64} aria-label="Without the value" />
		</div>
	</section>

	<section aria-labelledby="angle-slider-states">
		<h2 id="angle-slider-states">Read-only and disabled</h2>
		<p>
			A read-only or disabled dial shows the angle as an image named by its value and ignores
			the pointer and the keyboard.
		</p>
		<div class="row">
			<AngleSlider value={210} readonly />
			<AngleSlider value={300} disabled />
		</div>
	</section>
</main>

<style>
	.preview {
		display: inline-grid;
		place-items: center;
		color: var(--oito2-color-primary-text);
		transition: rotate 0.1s linear;
	}

	.swatch {
		width: 120px;
		height: 80px;
		border-radius: var(--oito2-radius-large);
	}

	@media (prefers-reduced-motion: reduce) {
		.preview {
			transition: none;
		}
	}
</style>
