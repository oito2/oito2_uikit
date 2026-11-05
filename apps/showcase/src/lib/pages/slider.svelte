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
	import { Slider } from '@oito2/ui';

	let volume = $state(0.4);
	let committed = $state(0.4);
	let rating = $state(3);
	let price: [number, number] = $state([20, 80]);
	let level = $state(60);

	const percent = (v: number) => `${Math.round(v * 100)}%`;
</script>

<main class="showcase-page">
	<p>
		<code>Slider</code> picks a value, or a range with two thumbs, between <code>min</code> and
		<code>max</code>. The arrows move a thumb by one step, Home and End to the ends.
		<code>label</code> and <code>valueText</code> add a header with the formatted value.
	</p>

	<section aria-labelledby="slider-continuous">
		<h2 id="slider-continuous">Continuous</h2>
		<p>
			<code>onValueChange</code> fires while the user drags; <code>onValueCommit</code> once the
			drag or key press ends.
		</p>
		<div class="sliders">
			<Slider
				label="Volume"
				bind:value={volume}
				valueText={percent}
				onValueCommit={(v) => (committed = v as number)}
			/>
		</div>
		<p>Value {percent(volume)}, committed {percent(committed)}.</p>
	</section>

	<section aria-labelledby="slider-discrete">
		<h2 id="slider-discrete">Divisions and marks</h2>
		<p>
			<code>divisions</code> snaps the value to even steps, <code>marks</code> label points
			under the track and <code>showValueIndicator</code> shows a bubble over the thumb while dragging.
		</p>
		<div class="sliders">
			<Slider
				label="Rating"
				min={1}
				max={5}
				divisions={4}
				bind:value={rating}
				showValueIndicator
				valueText={(v) => `${v} of 5`}
				marks={[1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }))}
			/>
		</div>
	</section>

	<section aria-labelledby="slider-range">
		<h2 id="slider-range">Range</h2>
		<p>Two values make a range; <code>thumbLabels</code> names each thumb.</p>
		<div class="sliders">
			<Slider
				label="Price"
				min={0}
				max={100}
				divisions={20}
				bind:value={price}
				thumbLabels={['Minimum price', 'Maximum price']}
				valueText={(v) => `$${v}`}
				showValueIndicator
				marks={[
					{ value: 0, label: '$0' },
					{ value: 50, label: '$50' },
					{ value: 100, label: '$100' }
				]}
			/>
		</div>
		<p>From ${price[0]} to ${price[1]}.</p>
	</section>

	<section aria-labelledby="slider-vertical">
		<h2 id="slider-vertical">Vertical</h2>
		<p>A vertical slider grows upward; <code>length</code> sets its height.</p>
		<div class="row top">
			<Slider
				orientation="vertical"
				length={160}
				label="Level"
				min={0}
				max={100}
				bind:value={level}
				valueText={(v) => `${Math.round(v)}%`}
			/>
			<Slider
				orientation="vertical"
				length={160}
				label="Disabled"
				defaultValue={0.3}
				disabled
			/>
		</div>
	</section>

	<section aria-labelledby="slider-disabled">
		<h2 id="slider-disabled">Disabled</h2>
		<div class="sliders">
			<Slider label="Brightness" defaultValue={0.7} valueText={percent} disabled />
			<Slider
				label="Hours"
				min={0}
				max={24}
				defaultValue={[9, 17]}
				thumbLabels={['Start hour', 'End hour']}
				disabled
			/>
		</div>
	</section>
</main>

<style>
	.sliders {
		display: grid;
		gap: var(--oito2-space-lg);
		max-width: 360px;
	}
</style>
