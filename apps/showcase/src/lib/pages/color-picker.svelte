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
	import { ColorPicker, ColorPickerButton } from '@oito2/ui';

	const swatches = ['#3584E4', '#2190A4', '#3A944A', '#C88800', '#ED5B00', '#E62D42', '#9141AC'];

	let color = $state('#3584E4');
	let opaque = $state('#3A944A');
	let accent = $state('#E62D42');
	let highlight = $state('#C88800CC');
</script>

<main class="showcase-page">
	<p>
		<code>ColorPicker</code> edits a hex color with a saturation and brightness area, a hue
		slider, an optional opacity slider, text fields in hex, RGB or HSL, and a row of swatches.
		<code>ColorPickerButton</code> is an outlined button with a swatch and the hex value that opens
		the picker in a popover.
	</p>

	<section aria-labelledby="color-picker-full">
		<h2 id="color-picker-full">Picker with swatches</h2>
		<p>
			The arrows move the area and the sliders by 1%, or 10% with Shift; the fields apply on
			Enter or when they lose focus. A translucent color is <code>#RRGGBBAA</code>.
		</p>
		<div class="row top">
			<ColorPicker bind:value={color} {swatches} />
			<div class="column">
				<div class="color-preview" style:background={color} aria-hidden="true"></div>
				<p class="note">Value: {color}</p>
			</div>
		</div>
	</section>

	<section aria-labelledby="color-picker-options">
		<h2 id="color-picker-options">Without alpha, in RGB</h2>
		<p>
			<code>showAlpha</code> off keeps the color opaque; <code>defaultFormat</code> starts the
			text fields in RGB, and <code>width</code> narrows the picker.
		</p>
		<div class="row top">
			<ColorPicker bind:value={opaque} showAlpha={false} defaultFormat="rgb" width={220} />
			<p class="note">Value: {opaque}</p>
		</div>
	</section>

	<section aria-labelledby="color-picker-button">
		<h2 id="color-picker-button">Picker button</h2>
		<p>The label names the button and its popover, such as what the color is for.</p>
		<div class="row">
			<ColorPickerButton bind:value={accent} label="Accent" {swatches} />
			<ColorPickerButton bind:value={highlight} label="Highlight" />
			<ColorPickerButton value="#9141AC" label="Opaque" showAlpha={false} />
		</div>
		<p class="note">Accent: {accent} · Highlight: {highlight}</p>
	</section>
</main>

<style>
	.color-preview {
		width: 96px;
		height: 96px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}
</style>
