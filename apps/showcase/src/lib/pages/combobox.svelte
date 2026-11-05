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
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { Autocomplete, Combobox, ListCollection } from '@oito2/ui';

	interface City {
		id: string;
		name: string;
		state: string;
		closed?: boolean;
	}

	const countries = new ListCollection([
		'Argentina',
		'Bolivia',
		'Brasil',
		'Canadá',
		'Chile',
		'Colômbia',
		'Equador',
		'México',
		'Paraguai',
		'Peru',
		'Uruguai',
		'Venezuela'
	]);
	const cities = new ListCollection<City>(
		[
			{ id: 'sp', name: 'São Paulo', state: 'SP' },
			{ id: 'rj', name: 'Rio de Janeiro', state: 'RJ' },
			{ id: 'bh', name: 'Belo Horizonte', state: 'MG' },
			{ id: 'poa', name: 'Porto Alegre', state: 'RS' },
			{ id: 'rec', name: 'Recife', state: 'PE' },
			{ id: 'bsb', name: 'Brasília', state: 'DF', closed: true },
			{ id: 'cwb', name: 'Curitiba', state: 'PR' }
		],
		{
			getValue: (city) => city.id,
			getLabel: (city) => city.name,
			isDisabled: (city) => city.closed === true
		}
	);
	const languages = new ListCollection(['Svelte', 'Rust', 'TypeScript', 'Dart', 'CSS', 'Go']);

	let country = $state('');
	let picked = $state('none');
	let city = $state('');
	let pickedCity = $state<City | null>(null);
	let language = $state('');
</script>

<main class="showcase-page">
	<p>
		<code>Combobox</code> is a text field that suggests the items of a <code>collection</code>
		as the user types: the enabled items whose label contains the text, ignoring case and accents,
		with the matches highlighted. The Up and Down arrows move the highlight, Enter picks it and Escape
		closes the list. <code>Autocomplete</code> is the same component under another name.
	</p>

	<section aria-labelledby="combobox-basic">
		<h2 id="combobox-basic">Suggestions while typing</h2>
		<p>
			Without children the root renders an input with a trigger and the suggestion list. Bind
			<code>inputValue</code> for the text; <code>onSelect</code> receives each picked item. Try
			"col" or "mexico".
		</p>
		<div class="field">
			<Combobox.Root
				collection={countries}
				bind:inputValue={country}
				onSelect={(item) => (picked = item)}
				label="Country"
				placeholder="Type a country"
			/>
		</div>
		<p class="note">Text: {country || '(empty)'} · Picked: {picked}</p>
	</section>

	<section aria-labelledby="combobox-objects">
		<h2 id="combobox-objects">Objects, disabled items and all items</h2>
		<p>
			A <code>ListCollection</code> of objects says how to read each item's value, label and
			disabled flag; Brasília is disabled. With <code>showAllWhenEmpty</code> every item shows while
			the field is empty.
		</p>
		<div class="field">
			<Combobox.Root
				collection={cities}
				bind:inputValue={city}
				onSelect={(item) => (pickedCity = item)}
				showAllWhenEmpty
				label="City"
				placeholder="Pick a city"
			/>
		</div>
		<p class="note">
			Picked: {pickedCity ? `${pickedCity.name} (${pickedCity.state})` : 'none'}
		</p>
	</section>

	<section aria-labelledby="combobox-parts">
		<h2 id="combobox-parts">Composed from parts</h2>
		<p>
			The parts replace the default layout: <code>Input</code> takes <code>leading</code> and
			<code>trailing</code> snippets, <code>Content</code> lists the suggestions and
			<code>Empty</code> replaces "No results".
		</p>
		<div class="field">
			<Autocomplete.Root collection={cities} defaultValue="rec">
				<Autocomplete.Input aria-label="Destination" placeholder="Where to?">
					{#snippet leading()}<MapPin size={18} aria-hidden="true" />{/snippet}
					{#snippet trailing()}<Autocomplete.Trigger
							label="Show destinations"
						/>{/snippet}
				</Autocomplete.Input>
				<Autocomplete.Content maxHeight={180}>
					{#snippet empty()}No destination matches.{/snippet}
				</Autocomplete.Content>
			</Autocomplete.Root>
		</div>
	</section>

	<section aria-labelledby="combobox-exclude">
		<h2 id="combobox-exclude">Excluded values</h2>
		<p>
			<code>exclude</code> lists values never suggested, such as the ones already chosen elsewhere.
			Here Svelte and Rust are left out.
		</p>
		<div class="field">
			<Combobox.Root
				collection={languages}
				bind:inputValue={language}
				exclude={['Svelte', 'Rust']}
				showAllWhenEmpty
				label="Another language"
			/>
		</div>
	</section>

	<section aria-labelledby="combobox-disabled">
		<h2 id="combobox-disabled">Disabled</h2>
		<div class="field">
			<Combobox.Root
				collection={countries}
				defaultValue="Chile"
				disabled
				label="Country (disabled)"
			/>
		</div>
	</section>
</main>

<style>
	.field {
		max-width: 320px;
	}
</style>
