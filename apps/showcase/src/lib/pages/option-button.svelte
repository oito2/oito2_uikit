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
	import Minus from '@lucide/svelte/icons/minus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import { OptionButton } from '@oito2/ui';

	const palette = [
		{ name: 'Red', color: '#e62d42' },
		{ name: 'Green', color: '#3a944a' },
		{ name: 'Blue', color: '#3584e4' }
	];

	let items = $state(['First item', 'Second item']);
	let selected = $state(0);
	let color = $state('none');
</script>

<main class="showcase-page">
	<p>
		<code>OptionButton</code> is a small square outlined button for secondary options, such as
		the buttons next to a list. It shows an <code>icon</code>, a <code>color</code> swatch or
		custom children. <code>label</code> names it for assistive technologies and is its tooltip; it
		is required for an icon or a swatch.
	</p>

	<section aria-labelledby="option-button-list">
		<h2 id="option-button-list">Next to a list</h2>
		<p>Add, remove and rename the items of the list.</p>
		<div class="row top">
			<ul class="items" aria-label="Items">
				{#each items as item, index (index)}
					<li data-selected={selected === index ? '' : undefined}>
						<button type="button" class="item" onclick={() => (selected = index)}
							>{item}</button
						>
					</li>
				{/each}
			</ul>
			<div class="column">
				<OptionButton
					icon={Plus}
					label="Add an item"
					onclick={() => {
						items = [...items, `Item ${items.length + 1}`];
						selected = items.length - 1;
					}}
				/>
				<OptionButton
					icon={Minus}
					label="Remove the selected item"
					disabled={items.length === 0}
					onclick={() => {
						items = items.filter((_, index) => index !== selected);
						selected = Math.max(0, selected - 1);
					}}
				/>
				<OptionButton
					icon={Pencil}
					label="Rename the selected item"
					disabled={items.length === 0}
					onclick={() =>
						(items = items.map((item, index) =>
							index === selected ? `${item} (renamed)` : item
						))}
				/>
			</div>
		</div>
	</section>

	<section aria-labelledby="option-button-swatches">
		<h2 id="option-button-swatches">Color swatches</h2>
		<p>
			With <code>color</code> the button shows a swatch of that CSS color instead of an icon.
		</p>
		<div class="row">
			{#each palette as each (each.name)}
				<OptionButton
					color={each.color}
					label={each.name}
					onclick={() => (color = each.name)}
				/>
			{/each}
		</div>
		<p class="note">Color: {color}</p>
	</section>

	<section aria-labelledby="option-button-content">
		<h2 id="option-button-content">Custom content</h2>
		<p>Children replace the icon or swatch, such as a short text.</p>
		<div class="row">
			<OptionButton label="Bold">B</OptionButton>
			<OptionButton label="2× speed">2×</OptionButton>
		</div>
	</section>

	<section aria-labelledby="option-button-disabled">
		<h2 id="option-button-disabled">Disabled</h2>
		<div class="row">
			<OptionButton icon={Plus} label="Add (disabled)" disabled />
			<OptionButton color="#9141ac" label="Purple (disabled)" disabled />
		</div>
	</section>
</main>

<style>
	.items {
		display: grid;
		min-width: 200px;
		margin: 0;
		padding: var(--oito2-space-xs);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
		list-style: none;
	}

	.item {
		width: 100%;
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
		border: 0;
		border-radius: var(--oito2-radius-small);
		background: none;
		color: var(--oito2-color-on-surface);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}

	[data-selected] .item {
		background: var(--oito2-color-selected-fill);
		color: var(--oito2-color-on-selected-fill);
	}

	.item:focus-visible {
		outline: 2px solid var(--oito2-color-primary-text);
	}
</style>
