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
	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import Underline from '@lucide/svelte/icons/underline';
	import Copy from '@lucide/svelte/icons/copy';
	import Scissors from '@lucide/svelte/icons/scissors';
	import { IconButton, ListTile, Separator } from '@oito2/ui';
</script>

<main class="showcase-page">
	<p>
		<code>Separator</code> is a 1-pixel line in the outline variant color between pieces of
		content, horizontal by default. Assistive technologies announce it as a separator, unless it
		is
		<code>decorative</code>.
	</p>

	<section aria-labelledby="separator-horizontal">
		<h2 id="separator-horizontal">Horizontal</h2>
		<div class="text">
			<p>The first paragraph talks about one thing.</p>
			<Separator />
			<p>The second paragraph, after the line, moves on to another.</p>
		</div>
	</section>

	<section aria-labelledby="separator-vertical">
		<h2 id="separator-vertical">Vertical</h2>
		<p>A vertical separator takes the height of its row, here between groups of a toolbar.</p>
		<div class="toolbar">
			<IconButton icon={Scissors} label="Cut" />
			<IconButton icon={Copy} label="Copy" />
			<Separator orientation="vertical" />
			<IconButton icon={Bold} label="Bold" />
			<IconButton icon={Italic} label="Italic" />
			<IconButton icon={Underline} label="Underline" />
		</div>
	</section>

	<section aria-labelledby="separator-list">
		<h2 id="separator-list">In a list</h2>
		<p>
			Between rows the line only decorates: <code>decorative</code> hides it from assistive technologies.
		</p>
		<div class="list">
			<ListTile title="Profile" />
			<Separator decorative />
			<ListTile title="Privacy" />
			<Separator decorative />
			<ListTile title="Notifications" />
		</div>
	</section>
</main>

<style>
	.text {
		display: grid;
		gap: var(--oito2-space-md);
		max-width: 72ch;
	}

	.text p {
		margin: 0;
	}

	.toolbar {
		display: flex;
		align-items: stretch;
		gap: var(--oito2-space-xs);
		width: fit-content;
		padding: var(--oito2-space-xs);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.list {
		display: grid;
		max-width: 400px;
	}
</style>
