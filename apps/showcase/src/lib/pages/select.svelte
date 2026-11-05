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
	import Globe from '@lucide/svelte/icons/globe';
	import { Field, ListCollection, Select } from '@oito2/ui';

	const fruits = new ListCollection(
		[
			{ id: 'apple', name: 'Apple', group: 'Pome' },
			{ id: 'pear', name: 'Pear', group: 'Pome' },
			{ id: 'cherry', name: 'Cherry', group: 'Drupe' },
			{ id: 'plum', name: 'Plum', group: 'Drupe' },
			{ id: 'banana', name: 'Banana (out of season)', group: 'Berry' }
		],
		{
			getValue: (f) => f.id,
			getLabel: (f) => f.name,
			getGroup: (f) => f.group,
			isDisabled: (f) => f.id === 'banana'
		}
	);

	const countries = new ListCollection(
		[
			{ code: 'br', name: 'Brazil' },
			{ code: 'pt', name: 'Portugal' },
			{ code: 'jp', name: 'Japan' },
			{ code: 'ca', name: 'Canada' }
		],
		{ getValue: (c) => c.code, getLabel: (c) => c.name }
	);

	let fruit = $state<string | null>('cherry');
	let country = $state<string | null>(null);
	let touched = $state(false);
	let language = $state<string | null>(null);
</script>

<main class="showcase-page">
	<p>
		<code>Select</code> is a button that shows the chosen option and opens a list of options.
		Give
		<code>Select.Root</code> a <code>collection</code> and it renders the options and their
		groups by itself, or compose the trigger and the list with <code>Select.Item</code>,
		<code>Select.Group</code> and <code>Select.Label</code>.
	</p>

	<section aria-labelledby="select-collection">
		<h2 id="select-collection">From a collection</h2>
		<p>
			The collection gives each option its value, label, group and disabled state.
			<code>label</code> names a select that has no <code>Field.Label</code>.
		</p>
		<div class="row">
			<Select.Root
				collection={fruits}
				bind:value={fruit}
				label="Fruit"
				placeholder="Choose a fruit"
			/>
			<Select.Root collection={fruits} label="Fruit, empty" placeholder="Choose a fruit" />
			<Select.Root
				collection={fruits}
				defaultValue="pear"
				label="Fruit, disabled"
				placeholder="Choose a fruit"
				disabled
			/>
		</div>
		<p>Fruit: {fruit ?? 'none'}.</p>
	</section>

	<section aria-labelledby="select-field">
		<h2 id="select-field">In a field</h2>
		<p>
			Inside <code>Field.Root</code> the trigger takes the field's id, so
			<code>Field.Label</code>
			names it and the helper and error describe it.
		</p>
		<div class="fields">
			<Field.Root required invalid={touched && country === null}>
				<Field.Label>Country</Field.Label>
				<Select.Root
					collection={countries}
					bind:value={country}
					placeholder="Choose a country"
					onValueChange={() => (touched = true)}
				/>
				<Field.Helper>Where the order ships.</Field.Helper>
				<Field.Error>Choose a country.</Field.Error>
			</Field.Root>
		</div>
		<p>Country: {country ?? 'none'}.</p>
	</section>

	<section aria-labelledby="select-composed">
		<h2 id="select-composed">Composed parts</h2>
		<p>
			Without a collection, compose <code>Select.Trigger</code> (here with a leading icon) and
			<code>Select.Content</code> with groups, labels and items. The trigger learns an option's
			label once the list has opened.
		</p>
		<div class="row">
			<Select.Root bind:value={language}>
				<Select.Trigger aria-label="Language" placeholder="Choose a language">
					{#snippet leading()}<Globe size={20} aria-hidden="true" />{/snippet}
				</Select.Trigger>
				<Select.Content>
					<Select.Group label="Available">
						<Select.Item value="en" label="English" />
						<Select.Item value="pt-BR" label="Português (Brasil)" />
					</Select.Group>
					<Select.Label>Coming soon</Select.Label>
					<Select.Item value="es" label="Español" disabled />
					<Select.Item value="fr" label="Français" disabled />
				</Select.Content>
			</Select.Root>
			<span>Language: {language ?? 'none'}.</span>
		</div>
	</section>
</main>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--oito2-space-lg);
	}
</style>
