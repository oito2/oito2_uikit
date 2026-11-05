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

<!-- A page of the showcase catalogue, loaded on demand from src/lib/pages. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { findPage, loadPage } from '#lib/catalog.js';

	let entry = $derived(findPage(page.params.slug));
</script>

{#if entry}
	{#await loadPage(entry.slug) then Page}
		<Page />
	{/await}
{:else}
	<main class="missing">
		<p>There is no page “{page.params.slug}”.</p>
		<a href={resolve('/')}>Back to the start</a>
	</main>
{/if}

<style>
	.missing {
		padding: var(--oito2-space-xl);
	}
</style>
