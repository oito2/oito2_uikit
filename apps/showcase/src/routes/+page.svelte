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
	import { resolve } from '$app/paths';
</script>

<main>
	<h1>oito2_uikit</h1>
	<p>
		The component pages arrive phase by phase. Phases F1 to F3 add the foundation, the color
		schemes and the interaction infrastructure; the platform spikes of phase F0 stay below.
	</p>
	<ul>
		<li><a href={resolve('/colors')}>Colors: every role of the active scheme</a></li>
		<li>
			<a href={resolve('/material')}
				>Material theme: buttons, toggles, fields and containers</a
			>
		</li>
		<li>
			<a href={resolve('/interaction')}
				>Interaction: shortcuts, focus helpers and collections</a
			>
		</li>
		<li>
			<a href={resolve('/foundation')}
				>Foundation: tokens, type scale, platform and formatting</a
			>
		</li>
		<li><a href={resolve('/spikes/baseline')}>Baseline: CSS, DOM, JavaScript and fonts</a></li>
		<li><a href={resolve('/spikes/chrome')}>Window chrome: title bar, drag and resize</a></li>
	</ul>
</main>

<style>
	main {
		padding: 20px;
	}
</style>
