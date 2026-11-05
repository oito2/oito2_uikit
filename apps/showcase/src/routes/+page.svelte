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

<!-- The start page: what the showcase holds, shown while no page is selected. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { showcasePages } from '#lib/catalog.js';
</script>

<main>
	<p>
		The components of the oito2 design system for Svelte 5 and Tauri v2. Choose a page from the
		list, or search it by name.
	</p>
	<ul>
		{#each showcasePages as entry (entry.slug)}
			<li><a href={resolve('/[slug]', { slug: entry.slug })}>{entry.title}</a></li>
		{/each}
	</ul>
</main>

<style>
	main {
		padding: var(--oito2-space-xl);
	}
</style>
