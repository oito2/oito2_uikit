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
	import { Splitter } from '@oito2/ui';

	let sizes = $state<readonly number[]>([]);
</script>

<main class="showcase-page">
	<p>
		A splitter places panes side by side, or stacked, with a draggable divider between each two.
		From the keyboard a focused divider moves with the arrow keys, Home and End take the pane
		before it to its smallest and largest size, and Enter or Space collapses or restores a
		collapsible pane.
	</p>

	<section aria-labelledby="splitter-horizontal">
		<h2 id="splitter-horizontal">Side by side</h2>
		<p>
			The first pane starts at a quarter of the width and can collapse; the last one never
			gets narrower than 120 pixels.
		</p>
		<div class="frame">
			<Splitter.Root class="fill" onSizesChange={(next) => (sizes = next)}>
				<Splitter.Pane initialFraction={0.25} collapsible>
					<div class="pane">Files</div>
				</Splitter.Pane>
				<Splitter.Pane><div class="pane">Editor</div></Splitter.Pane>
				<Splitter.Pane minSize={120}><div class="pane">Outline</div></Splitter.Pane>
			</Splitter.Root>
		</div>
		<p>
			Sizes: {sizes.length
				? sizes.map((size) => Math.round(size)).join(', ')
				: 'not moved yet'}.
		</p>
	</section>

	<section aria-labelledby="splitter-vertical">
		<h2 id="splitter-vertical">Stacked</h2>
		<div class="frame tall">
			<Splitter.Root orientation="vertical" class="fill">
				<Splitter.Pane initialFraction={0.6}><div class="pane">Editor</div></Splitter.Pane>
				<Splitter.Pane minSize={60} collapsible>
					<div class="pane">Terminal</div>
				</Splitter.Pane>
			</Splitter.Root>
		</div>
	</section>

	<section aria-labelledby="splitter-limits">
		<h2 id="splitter-limits">Limits and collapsed panes</h2>
		<p>
			The start pane stays between 120 and 260 pixels. The end pane starts collapsed to a
			40-pixel strip; drag its divider, double-click it or press Enter on it to restore it.
		</p>
		<div class="frame">
			<Splitter.Root class="fill">
				<Splitter.Pane minSize={120} maxSize={260} initialFraction={0.3}>
					<div class="pane">Navigator</div>
				</Splitter.Pane>
				<Splitter.Pane><div class="pane">Content</div></Splitter.Pane>
				<Splitter.Pane collapsible collapsedSize={40} defaultCollapsed minSize={160}>
					<div class="pane">Details</div>
				</Splitter.Pane>
			</Splitter.Root>
		</div>
	</section>
</main>

<style>
	.frame {
		display: flex;
		height: 220px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.frame.tall {
		height: 320px;
	}

	.frame > :global(.fill) {
		flex: 1;
		min-width: 0;
	}

	.pane {
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		padding: var(--oito2-space-md);
	}
</style>
