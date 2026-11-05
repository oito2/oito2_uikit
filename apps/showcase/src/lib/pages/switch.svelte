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
	import Moon from '@lucide/svelte/icons/moon';
	import Plane from '@lucide/svelte/icons/plane';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { Switch, SwitchButton, SwitchListTile } from '@oito2/ui';

	let darkMode = $state(false);
	let autoUpdate = $state(true);
	let wifi = $state(true);
	let bluetooth = $state(false);
	let airplane = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>Switch</code> turns a setting on or off at once. Name it with a
		<code>&lt;label for&gt;</code>
		or <code>aria-label</code>. <code>SwitchButton</code> adds a title and a subtitle, and
		<code>SwitchListTile</code> puts it in a list row; both toggle with a click anywhere on the row.
	</p>

	<section aria-labelledby="switch-states">
		<h2 id="switch-states">States</h2>
		<p><code>onOffShapes</code> adds "I" and "O" marks to the track.</p>
		<div class="row">
			<Switch aria-label="Off" />
			<Switch aria-label="On" defaultChecked />
			<Switch aria-label="Off, with shapes" onOffShapes />
			<Switch aria-label="On, with shapes" onOffShapes defaultChecked />
			<Switch aria-label="Disabled" disabled />
			<Switch aria-label="Disabled and on" disabled defaultChecked />
		</div>
	</section>

	<section aria-labelledby="switch-label">
		<h2 id="switch-label">With a label</h2>
		<div class="row">
			<span class="labelled">
				<label for="switch-dark-mode">Dark mode</label>
				<Switch id="switch-dark-mode" bind:checked={darkMode} />
			</span>
		</div>
		<p>Dark mode is {darkMode ? 'on' : 'off'}.</p>
	</section>

	<section aria-labelledby="switch-button">
		<h2 id="switch-button">SwitchButton</h2>
		<div class="column">
			<SwitchButton
				title="Update automatically"
				subtitle="Installs updates while the app is closed"
				bind:checked={autoUpdate}
			/>
			<SwitchButton title="Send usage statistics" onOffShapes />
			<SwitchButton title="Disabled" subtitle="Managed by your organization" disabled />
		</div>
		<p>Automatic updates are {autoUpdate ? 'on' : 'off'}.</p>
	</section>

	<section aria-labelledby="switch-list-tile">
		<h2 id="switch-list-tile">SwitchListTile</h2>
		<p>
			The switch comes last by default; <code>controlPosition="start"</code> moves it to the
			start, and <code>secondary</code> fills the other side.
		</p>
		<div class="list">
			<SwitchListTile title="Wi-Fi" subtitle={wifi ? 'Connected' : 'Off'} bind:checked={wifi}>
				{#snippet secondary()}<Wifi size={20} aria-hidden="true" />{/snippet}
			</SwitchListTile>
			<SwitchListTile title="Bluetooth" bind:checked={bluetooth}>
				{#snippet secondary()}<Bluetooth size={20} aria-hidden="true" />{/snippet}
			</SwitchListTile>
			<SwitchListTile
				title="Airplane mode"
				controlPosition="start"
				onOffShapes
				bind:checked={airplane}
			>
				{#snippet secondary()}<Plane size={20} aria-hidden="true" />{/snippet}
			</SwitchListTile>
			<SwitchListTile title="Night light" subtitle="Not supported by this screen" disabled>
				{#snippet secondary()}<Moon size={20} aria-hidden="true" />{/snippet}
			</SwitchListTile>
		</div>
		<p>
			Wi-Fi {wifi ? 'on' : 'off'}, Bluetooth {bluetooth ? 'on' : 'off'}, airplane mode {airplane
				? 'on'
				: 'off'}.
		</p>
	</section>
</main>

<style>
	.labelled {
		display: inline-flex;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	.list {
		display: grid;
		max-width: 400px;
	}
</style>
