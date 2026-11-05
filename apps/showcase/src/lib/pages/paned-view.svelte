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
	import { Button, PanedView } from '@oito2/ui';

	const sides = ['start', 'end', 'top', 'bottom'] as const;

	let paneSize = $state(240);
	let side = $state<(typeof sides)[number]>('end');
</script>

<main class="showcase-page">
	<p>
		A paned view splits its area between a pane, such as a sidebar, and the page, with a divider
		between them. The divider can be dragged or, once focused, moved with the arrow keys. The
		pane never shrinks below <code>minPaneSize</code> and never leaves less than
		<code>minPageSize</code> for the page.
	</p>

	<section aria-labelledby="paned-view-basic">
		<h2 id="paned-view-basic">Resizable pane</h2>
		<div class="row">
			<Button variant="tonal" onclick={() => (paneSize = 180)}>Narrow pane</Button>
			<Button variant="tonal" onclick={() => (paneSize = 320)}>Wide pane</Button>
		</div>
		<div class="frame">
			<PanedView bind:paneSize minPaneSize={160} minPageSize={200} class="fill">
				{#snippet pane()}<div class="pane">Sidebar</div>{/snippet}
				<div class="page">Page</div>
			</PanedView>
		</div>
		<p>Pane size: {Math.round(paneSize)} pixels.</p>
	</section>

	<section aria-labelledby="paned-view-sides">
		<h2 id="paned-view-sides">Pane side</h2>
		<p>
			<code>paneSide</code> puts the pane at the start or end side, or above or below the page.
		</p>
		<div class="row" role="group" aria-label="Pane side">
			{#each sides as value (value)}
				<Button
					variant={side === value ? 'tonal' : 'text'}
					aria-pressed={side === value}
					onclick={() => (side = value)}>{value}</Button
				>
			{/each}
		</div>
		<div class="frame tall">
			{#key side}
				<PanedView
					paneSide={side}
					defaultPaneSize={side === 'top' || side === 'bottom' ? 120 : 200}
					minPaneSize={80}
					minPageSize={120}
					class="fill"
				>
					{#snippet pane()}<div class="pane">Pane at the {side}</div>{/snippet}
					<div class="page">Page</div>
				</PanedView>
			{/key}
		</div>
	</section>

	<section aria-labelledby="paned-view-fixed">
		<h2 id="paned-view-fixed">Fixed</h2>
		<p>With <code>resizable</code> off the divider is only a line.</p>
		<div class="frame">
			<PanedView resizable={false} defaultPaneSize={200} class="fill">
				{#snippet pane()}<div class="pane">Fixed pane</div>{/snippet}
				<div class="page">Page</div>
			</PanedView>
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

	.pane,
	.page {
		height: 100%;
		box-sizing: border-box;
		padding: var(--oito2-space-lg);
	}

	.pane {
		background: var(--oito2-color-surface-container);
	}
</style>
