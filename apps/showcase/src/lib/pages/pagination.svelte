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
	import { Pagination } from '@oito2/ui';

	const total = 487;

	let page = $state(3);
	let tablePage = $state(1);
	let pageSize = $state(25);
	let pageCount = $derived(Math.ceil(total / pageSize));
	let first = $derived((tablePage - 1) * pageSize + 1);
	let last = $derived(Math.min(tablePage * pageSize, total));
</script>

<main class="showcase-page">
	<p>
		Pagination moves through numbered pages: previous and next buttons around page numbers, with
		ellipses for the ranges in between, and an optional page size selector. Pages count from 1.
		Narrower than <code>compactWidth</code> it shows only the buttons around “Page 3 of 10”.
	</p>

	<section aria-labelledby="pagination-basic">
		<h2 id="pagination-basic">Pages</h2>
		<Pagination bind:page pageCount={20} aria-label="Search results" />
		<p>Page {page} of 20.</p>
	</section>

	<section aria-labelledby="pagination-size">
		<h2 id="pagination-size">Page size</h2>
		<p>The page count follows the page size: {total} rows in all.</p>
		<Pagination
			bind:page={tablePage}
			{pageCount}
			bind:pageSize
			pageSizes={[10, 25, 50, 100]}
			onPageSizeChange={() => (tablePage = 1)}
			aria-label="Table pages"
		/>
		<p>Rows {first} to {last} of {total}.</p>
	</section>

	<section aria-labelledby="pagination-counts">
		<h2 id="pagination-counts">More numbers around the current page</h2>
		<p>
			<code>siblingCount</code> sets how many numbers sit beside the current page and
			<code>boundaryCount</code> how many at each end.
		</p>
		<Pagination
			page={25}
			pageCount={50}
			siblingCount={2}
			boundaryCount={2}
			aria-label="Archive pages"
		/>
	</section>

	<section aria-labelledby="pagination-compact">
		<h2 id="pagination-compact">Compact</h2>
		<p>In a narrow space only the previous and next buttons remain.</p>
		<div class="narrow">
			<Pagination page={3} pageCount={10} aria-label="Compact pages" />
		</div>
	</section>

	<section aria-labelledby="pagination-disabled">
		<h2 id="pagination-disabled">Disabled</h2>
		<Pagination page={2} pageCount={8} disabled aria-label="Disabled pages" />
	</section>
</main>

<style>
	.narrow {
		width: min(100%, 320px);
		padding: var(--oito2-space-sm);
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-medium);
	}
</style>
