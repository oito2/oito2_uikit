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
	import { Field, NumberEntry } from '@oito2/ui';

	let copies = $state(1);
	let amount = $state(12.5);
	let opacity = $state(80);
	let offset = $state(0);
	let lastChange = $state<number | null>(null);
</script>

<main class="showcase-page">
	<p>
		<code>NumberEntry</code> is a number field with decrease and increase buttons, like a GNOME
		spin button. It shows <code>value</code> in the locale's number format; typed text is read
		when the field loses focus or on Enter, rounded and kept between <code>min</code> and
		<code>max</code>. Text that isn't a number is replaced by the current value.
	</p>

	<section aria-labelledby="number-entry-basic">
		<h2 id="number-entry-basic">Limits</h2>
		<p>
			The buttons turn off at the limits. The Up and Down arrows step by <code>step</code>,
			Page Up and Page Down by <code>pageStep</code>, and Home and End jump to the limits.
			With focus in the field the mouse wheel steps too, and dragging sideways on the buttons
			scrubs the value.
		</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Copies</Field.Label>
				<NumberEntry bind:value={copies} min={1} max={99} pageStep={10} />
				<Field.Helper>From 1 to 99.</Field.Helper>
			</Field.Root>
		</div>
		<p class="note">Copies: {copies}</p>
	</section>

	<section aria-labelledby="number-entry-decimals">
		<h2 id="number-entry-decimals">Decimals and steps</h2>
		<p>
			<code>decimals</code> sets the places shown and kept; <code>step</code> can be a
			fraction.
			<code>onValueChange</code> reports each new value.
		</p>
		<div class="fields">
			<NumberEntry
				bind:value={amount}
				min={0}
				max={100}
				step={0.5}
				decimals={1}
				onValueChange={(next) => (lastChange = next)}
				aria-label="Amount"
			/>
			<NumberEntry
				bind:value={opacity}
				min={0}
				max={100}
				step={5}
				aria-label="Opacity, percent"
			/>
			<NumberEntry bind:value={offset} step={10} aria-label="Offset without limits" />
		</div>
		<p class="note">
			Amount: {amount} · Opacity: {opacity}% · Offset: {offset} · Last change: {lastChange ??
				'none'}
		</p>
	</section>

	<section aria-labelledby="number-entry-states">
		<h2 id="number-entry-states">Read-only and disabled</h2>
		<p>
			A read-only entry can be focused and copied but not changed; a disabled one can't be
			used.
		</p>
		<div class="fields">
			<NumberEntry value={42} readonly aria-label="Answer (read-only)" />
			<NumberEntry value={7} disabled aria-label="Days (disabled)" />
		</div>
	</section>
</main>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 220px));
		gap: var(--oito2-space-md);
		align-items: start;
	}
</style>
