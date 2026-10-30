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
		The component pages arrive phase by phase. Phase F0 ships the workspace and the platform
		spikes below.
	</p>
	<ul>
		<li><a href={resolve('/spikes/baseline')}>Baseline: CSS, DOM, JavaScript and fonts</a></li>
		<li><a href={resolve('/spikes/chrome')}>Window chrome: title bar, drag and resize</a></li>
	</ul>
</main>

<style>
	main {
		padding: 20px;
	}
</style>
