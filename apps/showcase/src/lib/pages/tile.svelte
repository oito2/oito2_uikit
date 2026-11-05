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
	import Bluetooth from '@lucide/svelte/icons/bluetooth';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Moon from '@lucide/svelte/icons/moon';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { Switch, Tile, TileList } from '@oito2/ui';

	let wifi = $state(true);
	let bluetooth = $state(false);
	let opened = $state('none');
</script>

{#snippet wifiIcon()}<Wifi aria-hidden="true" />{/snippet}
{#snippet bluetoothIcon()}<Bluetooth aria-hidden="true" />{/snippet}
{#snippet locationIcon()}<MapPin aria-hidden="true" />{/snippet}
{#snippet moonIcon()}<Moon aria-hidden="true" />{/snippet}
{#snippet chevron()}<ChevronRight aria-hidden="true" />{/snippet}

<main class="showcase-page">
	<p>
		A tile is a row with optional <code>leading</code> content, a <code>title</code>, a
		<code>subtitle</code> and <code>trailing</code> content, as used in settings and property
		lists. With <code>onclick</code> the whole row is a button. <code>TileList</code> groups tiles
		into one bordered list.
	</p>

	<section aria-labelledby="tile-list">
		<h2 id="tile-list">A settings list</h2>
		<div class="list">
			<TileList>
				<Tile
					title="Wi-Fi"
					subtitle={wifi ? 'Connected to Home' : 'Off'}
					leading={wifiIcon}
				>
					{#snippet trailing()}<Switch aria-label="Wi-Fi" bind:checked={wifi} />{/snippet}
				</Tile>
				<Tile title="Bluetooth" subtitle={bluetooth ? 'On' : 'Off'} leading={bluetoothIcon}>
					{#snippet trailing()}
						<Switch aria-label="Bluetooth" bind:checked={bluetooth} />
					{/snippet}
				</Tile>
				<Tile
					title="Location"
					subtitle="Apps that asked for it"
					leading={locationIcon}
					trailing={chevron}
					onclick={() => (opened = 'Location')}
				/>
				<Tile
					title="Night light"
					subtitle="Managed by the system"
					leading={moonIcon}
					disabled
				/>
			</TileList>
		</div>
		<p>Opened: {opened}.</p>
	</section>

	<section aria-labelledby="tile-properties">
		<h2 id="tile-properties">Properties</h2>
		<p>Trailing content can be a value, here on the right of each property.</p>
		<div class="list">
			<TileList>
				<Tile title="Size">
					{#snippet trailing()}<span class="value">24 KB</span>{/snippet}
				</Tile>
				<Tile title="Modified" subtitle="By Ana Souza">
					{#snippet trailing()}<span class="value">Yesterday</span>{/snippet}
				</Tile>
				<Tile title="Location" subtitle="~/Documents/Reports" />
			</TileList>
		</div>
	</section>

	<section aria-labelledby="tile-single">
		<h2 id="tile-single">On its own</h2>
		<div class="list">
			<Tile
				title="About this device"
				subtitle="Name, model and storage"
				trailing={chevron}
				onclick={() => (opened = 'About this device')}
			/>
		</div>
	</section>
</main>

<style>
	.list {
		max-width: 520px;
	}

	.value {
		color: var(--oito2-color-on-surface-variant);
	}
</style>
