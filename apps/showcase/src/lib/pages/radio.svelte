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
	import Moon from '@lucide/svelte/icons/moon';
	import Plane from '@lucide/svelte/icons/plane';
	import Sun from '@lucide/svelte/icons/sun';
	import { RadioButton, RadioGroup, RadioListTile } from '@oito2/ui';

	const sizes = [
		{ value: 's', label: 'Small' },
		{ value: 'm', label: 'Medium' },
		{ value: 'l', label: 'Large' },
		{ value: 'xl', label: 'Extra large (sold out)', disabled: true }
	];

	let size = $state<string | null>('m');
	let shipping = $state<string | null>('standard');
	let theme = $state<string | null>('system');
	let rating = $state<string | null>(null);
</script>

<main class="showcase-page">
	<p>
		A <code>RadioGroup.Root</code> holds options of which one at most is selected. The group is
		one Tab stop and the arrow keys move between its items and select them. Its items are
		<code>RadioGroup.Item</code> (the ring alone), <code>RadioButton</code> (with a title) or
		<code>RadioListTile</code> (a list row).
	</p>

	<section aria-labelledby="radio-items">
		<h2 id="radio-items">Radio items</h2>
		<p>
			<code>RadioGroup.Item</code> is the ring alone; name it with a
			<code>&lt;label for&gt;</code>
			or <code>aria-label</code>.
		</p>
		<RadioGroup.Root bind:value={size} orientation="horizontal" aria-label="T-shirt size">
			<div class="row">
				{#each sizes as option (option.value)}
					<span class="labelled">
						<RadioGroup.Item
							id="radio-size-{option.value}"
							value={option.value}
							disabled={option.disabled}
						/>
						<label for="radio-size-{option.value}">{option.label}</label>
					</span>
				{/each}
			</div>
		</RadioGroup.Root>
		<p>Size: {size}.</p>
	</section>

	<section aria-labelledby="radio-buttons">
		<h2 id="radio-buttons">RadioButton</h2>
		<p>
			A radio with a title and an optional subtitle, selected by a click anywhere on the row.
		</p>
		<RadioGroup.Root bind:value={shipping} aria-label="Shipping">
			<div class="column">
				<RadioButton
					value="standard"
					title="Standard"
					subtitle="5 to 7 working days, free"
				/>
				<RadioButton value="express" title="Express" subtitle="2 days, $9.90" />
				<RadioButton value="pickup" title="Pick up in store" />
			</div>
		</RadioGroup.Root>
		<p>Shipping: {shipping}.</p>
	</section>

	<section aria-labelledby="radio-list-tiles">
		<h2 id="radio-list-tiles">RadioListTile</h2>
		<p>
			The radio comes first by default; <code>controlPosition="end"</code> moves it to the
			end, and
			<code>secondary</code> fills the other side.
		</p>
		<RadioGroup.Root bind:value={theme} aria-label="Theme">
			<div class="list">
				<RadioListTile value="light" title="Light" subtitle="Always light">
					{#snippet secondary()}<Sun size={20} aria-hidden="true" />{/snippet}
				</RadioListTile>
				<RadioListTile value="dark" title="Dark" subtitle="Always dark">
					{#snippet secondary()}<Moon size={20} aria-hidden="true" />{/snippet}
				</RadioListTile>
				<RadioListTile value="system" title="Follow the system" controlPosition="end" />
				<RadioListTile value="travel" title="Travel mode" subtitle="Not available" disabled>
					{#snippet secondary()}<Plane size={20} aria-hidden="true" />{/snippet}
				</RadioListTile>
			</div>
		</RadioGroup.Root>
		<p>Theme: {theme}.</p>
	</section>

	<section aria-labelledby="radio-group-options">
		<h2 id="radio-group-options">Toggleable and disabled groups</h2>
		<p>
			With <code>toggleable</code> a click on the selected item clears the group;
			<code>disabled</code> on the root disables every item.
		</p>
		<div class="row top">
			<RadioGroup.Root bind:value={rating} toggleable aria-label="Rating">
				<div class="column">
					<RadioButton value="good" title="Good" />
					<RadioButton value="bad" title="Bad" />
				</div>
			</RadioGroup.Root>
			<RadioGroup.Root defaultValue="on" disabled aria-label="Disabled group">
				<div class="column">
					<RadioButton value="on" title="Disabled and selected" />
					<RadioButton value="off" title="Disabled" />
				</div>
			</RadioGroup.Root>
		</div>
		<p>Rating: {rating ?? 'none'}.</p>
	</section>
</main>

<style>
	.labelled {
		display: inline-flex;
		align-items: center;
		gap: var(--oito2-space-xxs);
	}

	.list {
		display: grid;
		max-width: 400px;
	}
</style>
