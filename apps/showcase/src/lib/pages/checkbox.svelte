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
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import Headphones from '@lucide/svelte/icons/headphones';
	import { Checkbox, CheckboxListTile, type CheckedState } from '@oito2/ui';

	let toppings = $state<{ id: string; label: string; checked: CheckedState }[]>([
		{ id: 'cheese', label: 'Cheese', checked: true },
		{ id: 'tomato', label: 'Tomato', checked: false },
		{ id: 'basil', label: 'Basil', checked: true }
	]);

	let all = $derived<CheckedState>(
		toppings.every((t) => t.checked === true)
			? true
			: toppings.some((t) => t.checked !== false)
				? 'mixed'
				: false
	);

	let remember = $state<CheckedState>(true);
</script>

<main class="showcase-page">
	<p>
		<code>Checkbox</code> is a check box alone: checked, unchecked or mixed. Name it with a
		<code>&lt;label for&gt;</code> or <code>aria-label</code>. <code>CheckboxListTile</code> puts
		it in a list row that toggles with a click anywhere on it.
	</p>

	<section aria-labelledby="checkbox-states">
		<h2 id="checkbox-states">States</h2>
		<div class="row">
			<Checkbox aria-label="Unchecked" />
			<Checkbox aria-label="Checked" defaultChecked />
			<Checkbox aria-label="Mixed" defaultChecked="mixed" tristate />
			<Checkbox aria-label="Disabled" disabled />
			<Checkbox aria-label="Disabled and checked" disabled defaultChecked />
			<Checkbox aria-label="Disabled and mixed" disabled defaultChecked="mixed" />
		</div>
	</section>

	<section aria-labelledby="checkbox-label">
		<h2 id="checkbox-label">With a label</h2>
		<div class="row">
			<span class="labelled">
				<Checkbox id="checkbox-remember" bind:checked={remember} />
				<label for="checkbox-remember">Remember me</label>
			</span>
		</div>
		<p>Remember me: {remember === true ? 'yes' : 'no'}.</p>
	</section>

	<section aria-labelledby="checkbox-mixed">
		<h2 id="checkbox-mixed">Select all</h2>
		<p>
			The parent box is mixed while only some toppings are chosen; clicking it checks or
			clears them all.
		</p>
		<div class="column">
			<span class="labelled">
				<Checkbox
					id="checkbox-all"
					checked={all}
					onCheckedChange={(next) => {
						for (const t of toppings) t.checked = next === true;
					}}
				/>
				<label for="checkbox-all">All toppings</label>
			</span>
			<div class="nested column">
				{#each toppings as topping (topping.id)}
					<span class="labelled">
						<Checkbox id="checkbox-{topping.id}" bind:checked={topping.checked} />
						<label for="checkbox-{topping.id}">{topping.label}</label>
					</span>
				{/each}
			</div>
		</div>
	</section>

	<section aria-labelledby="checkbox-list-tile">
		<h2 id="checkbox-list-tile">CheckboxListTile</h2>
		<p>
			The check box comes first by default; <code>controlPosition="end"</code> moves it to the
			end, and <code>secondary</code> fills the other side.
		</p>
		<div class="list">
			<CheckboxListTile title="Documents" subtitle="Text files and PDFs" defaultChecked>
				{#snippet secondary()}<FileText size={20} aria-hidden="true" />{/snippet}
			</CheckboxListTile>
			<CheckboxListTile title="Pictures" subtitle="Photos and screenshots">
				{#snippet secondary()}<Image size={20} aria-hidden="true" />{/snippet}
			</CheckboxListTile>
			<CheckboxListTile title="Audio" controlPosition="end" defaultChecked="mixed" tristate>
				{#snippet secondary()}<Headphones size={20} aria-hidden="true" />{/snippet}
			</CheckboxListTile>
			<CheckboxListTile title="Disabled" subtitle="Can't be changed" disabled />
		</div>
	</section>
</main>

<style>
	.labelled {
		display: inline-flex;
		align-items: center;
		gap: var(--oito2-space-xs);
	}

	.nested {
		padding-inline-start: var(--oito2-space-xl);
	}

	.list {
		display: grid;
		max-width: 400px;
	}
</style>
