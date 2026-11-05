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
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Send from '@lucide/svelte/icons/send';
	import { Fab } from '@oito2/ui';

	let notes = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>Fab</code> is a floating action button for the main action of a screen: a square in
		the primary container color with a raised shadow. With a label as children it becomes an
		extended, wider pill. Name an icon-only button with <code>label</code>.
	</p>

	<section aria-labelledby="fab-sizes">
		<h2 id="fab-sizes">Sizes</h2>
		<p>
			Icon-only buttons come in three sizes; <code>medium</code> (56 pixels) is the default.
		</p>
		<div class="row">
			<Fab icon={Plus} size="small" label="Add, small" />
			<Fab icon={Plus} label="Add, medium" />
			<Fab icon={Plus} size="large" label="Add, large" />
		</div>
	</section>

	<section aria-labelledby="fab-extended">
		<h2 id="fab-extended">Extended</h2>
		<div class="row">
			<Fab icon={Pencil}>Compose</Fab>
			<Fab>Label only</Fab>
			<Fab icon={Send} disabled>Disabled</Fab>
		</div>
	</section>

	<section aria-labelledby="fab-placed">
		<h2 id="fab-placed">Placed over the content</h2>
		<p>A FAB usually floats at the bottom end corner of the screen, above the content.</p>
		<div class="stage">
			<p>{notes} notes</p>
			<div class="corner">
				<Fab icon={Plus} label="New note" onclick={() => notes++} />
			</div>
		</div>
	</section>
</main>

<style>
	.stage p {
		margin: 0;
	}

	.corner {
		position: absolute;
		inset-block-end: var(--oito2-space-md);
		inset-inline-end: var(--oito2-space-md);
	}
</style>
