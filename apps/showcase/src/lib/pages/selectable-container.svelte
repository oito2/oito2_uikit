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
	import Palette from '@lucide/svelte/icons/palette';
	import Sun from '@lucide/svelte/icons/sun';
	import { SelectableContainer } from '@oito2/ui';

	const themes = [
		{ id: 'light', name: 'Light', icon: Sun },
		{ id: 'dark', name: 'Dark', icon: Moon },
		{ id: 'system', name: 'System', icon: Palette }
	];
	const toppings = ['Cheese', 'Tomato', 'Basil', 'Olives', 'Mushrooms'];

	let theme = $state('system');
	let chosen = $state<string[]>(['Cheese', 'Basil']);

	/** Adds a topping to the choice, or removes it when already chosen. */
	function toggle(topping: string) {
		chosen = chosen.includes(topping)
			? chosen.filter((each) => each !== topping)
			: [...chosen, topping];
	}
</script>

<main class="showcase-page">
	<p>
		A selectable container is a surface that can be selected, such as an option in a grid of
		choices. Selection shows as a tinted background with a 2-pixel border. With
		<code>onclick</code> it is a toggle button whose pressed state follows
		<code>selected</code>.
	</p>

	<section aria-labelledby="selectable-container-single">
		<h2 id="selectable-container-single">One choice</h2>
		<div class="row top">
			{#each themes as item (item.id)}
				<SelectableContainer selected={theme === item.id} onclick={() => (theme = item.id)}>
					<div class="option">
						<item.icon size={32} aria-hidden="true" />
						<span>{item.name}</span>
					</div>
				</SelectableContainer>
			{/each}
		</div>
		<p>Theme: {theme}.</p>
	</section>

	<section aria-labelledby="selectable-container-multiple">
		<h2 id="selectable-container-multiple">Several choices</h2>
		<div class="row">
			{#each toppings as topping (topping)}
				<SelectableContainer
					selected={chosen.includes(topping)}
					onclick={() => toggle(topping)}
				>
					<div class="chip">{topping}</div>
				</SelectableContainer>
			{/each}
		</div>
		<p>Chosen: {chosen.join(', ') || 'nothing'}.</p>
	</section>

	<section aria-labelledby="selectable-container-color">
		<h2 id="selectable-container-color">Selection color</h2>
		<p><code>selectionColor</code> changes the tint of the selected background.</p>
		<div class="row">
			<SelectableContainer
				selected
				selectionColor="color-mix(in oklch, var(--oito2-color-success) 16%, transparent)"
			>
				<div class="chip">Success tint</div>
			</SelectableContainer>
			<SelectableContainer
				selected
				selectionColor="color-mix(in oklch, var(--oito2-color-warning) 16%, transparent)"
			>
				<div class="chip">Warning tint</div>
			</SelectableContainer>
		</div>
	</section>

	<section aria-labelledby="selectable-container-disabled">
		<h2 id="selectable-container-disabled">Disabled</h2>
		<div class="row">
			<SelectableContainer disabled onclick={() => {}}>
				<div class="chip">Unavailable</div>
			</SelectableContainer>
			<SelectableContainer selected disabled onclick={() => {}}>
				<div class="chip">Selected and locked</div>
			</SelectableContainer>
		</div>
	</section>
</main>

<style>
	.option {
		display: grid;
		justify-items: center;
		gap: var(--oito2-space-sm);
		width: 120px;
		padding: var(--oito2-space-lg);
	}

	.chip {
		padding: var(--oito2-space-sm) var(--oito2-space-md);
	}
</style>
