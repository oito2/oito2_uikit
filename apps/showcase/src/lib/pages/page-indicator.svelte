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
	import { Button, PageIndicator, type PageIndicatorLayout } from '@oito2/ui';

	const length = 6;
	const layouts: PageIndicatorLayout[] = ['fixed', 'stepped', 'bounded'];

	let page = $state(0);
	let layoutPage = $state(4);
</script>

<main class="showcase-page">
	<p>
		A page indicator shows the current page of a carousel or a paged view as a row of dots, the
		current one a wider pill. With <code>onPageChange</code> or <code>interactive</code> each dot
		is a button: the current one is the Tab stop and the arrow keys, Home and End change the page.
	</p>

	<section aria-labelledby="page-indicator-static">
		<h2 id="page-indicator-static">Display only</h2>
		<PageIndicator length={5} page={2} />
	</section>

	<section aria-labelledby="page-indicator-interactive">
		<h2 id="page-indicator-interactive">Interactive</h2>
		<div class="row">
			<Button variant="text" disabled={page === 0} onclick={() => page--}>Previous</Button>
			<PageIndicator {length} bind:page interactive />
			<Button variant="text" disabled={page === length - 1} onclick={() => page++}
				>Next</Button
			>
		</div>
		<p>Page {page + 1} of {length}.</p>
	</section>

	<section aria-labelledby="page-indicator-layouts">
		<h2 id="page-indicator-layouts">Layouts</h2>
		<p>
			<code>fixed</code> keeps the spacing, <code>stepped</code> tightens it as the pages grow
			and
			<code>bounded</code> shrinks it to fit the width.
		</p>
		{#each layouts as layout (layout)}
			<div class="column">
				<h3>{layout}</h3>
				<div class="bounded">
					<PageIndicator length={12} {layout} bind:page={layoutPage} interactive />
				</div>
			</div>
		{/each}
	</section>

	<section aria-labelledby="page-indicator-sizes">
		<h2 id="page-indicator-sizes">Dot size and spacing</h2>
		<div class="column">
			<PageIndicator length={5} page={1} dotSize={6} spacing={6} />
			<PageIndicator length={5} page={1} />
			<PageIndicator length={5} page={1} dotSize={12} spacing={12} />
		</div>
	</section>

	<section aria-labelledby="page-indicator-overflow">
		<h2 id="page-indicator-overflow">Too many pages for the width</h2>
		<p>When the dots don't fit, the indicator shows “page / length” instead.</p>
		<div class="narrow">
			<PageIndicator length={40} page={11} />
		</div>
	</section>
</main>

<style>
	.bounded {
		width: min(100%, 260px);
		padding: var(--oito2-space-sm);
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-medium);
	}

	.narrow {
		width: 120px;
	}
</style>
