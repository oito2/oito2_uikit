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
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import List from '@lucide/svelte/icons/list';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { SegmentGroup } from '@oito2/ui';

	let range = $state<string | null>('week');
	let view = $state<string | null>('grid');
	let style = $state<string | null>(null);
	let side = $state<string | null>('left');
</script>

<main class="showcase-page">
	<p>
		<code>SegmentGroup</code> is a row (or column) of mutually exclusive choices on a recessed track,
		with a raised marker that slides to the selected one. The group is one Tab stop: the arrow keys
		select the previous or next enabled segment, wrapping at the ends. Assistive technologies read
		it as a group of radio buttons.
	</p>

	<section aria-labelledby="segment-group-basic">
		<h2 id="segment-group-basic">Text segments</h2>
		<p>
			Bind <code>value</code>, or set <code>defaultValue</code> and listen to
			<code>onValueChange</code>.
		</p>
		<SegmentGroup.Root bind:value={range} aria-label="Range">
			<SegmentGroup.Item value="day">Day</SegmentGroup.Item>
			<SegmentGroup.Item value="week">Week</SegmentGroup.Item>
			<SegmentGroup.Item value="month">Month</SegmentGroup.Item>
			<SegmentGroup.Item value="year">Year</SegmentGroup.Item>
		</SegmentGroup.Root>
		<p class="note">Range: {range ?? 'none'}</p>
	</section>

	<section aria-labelledby="segment-group-icons">
		<h2 id="segment-group-icons">Icons</h2>
		<p>A segment takes an <code>icon</code> before its label.</p>
		<div class="row">
			<SegmentGroup.Root bind:value={view} aria-label="View">
				<SegmentGroup.Item value="grid" icon={LayoutGrid}>Grid</SegmentGroup.Item>
				<SegmentGroup.Item value="list" icon={List}>List</SegmentGroup.Item>
			</SegmentGroup.Root>
			<SegmentGroup.Root bind:value={style} aria-label="Style">
				<SegmentGroup.Item value="light" icon={Sun}>Light</SegmentGroup.Item>
				<SegmentGroup.Item value="dark" icon={Moon}>Dark</SegmentGroup.Item>
			</SegmentGroup.Root>
		</div>
		<p class="note">
			View: {view ?? 'none'} · Style: {style ?? 'none (no segment selected yet)'}
		</p>
	</section>

	<section aria-labelledby="segment-group-vertical">
		<h2 id="segment-group-vertical">Vertical</h2>
		<p>
			With <code>orientation="vertical"</code> the segments stack and the Up and Down arrows move
			between them.
		</p>
		<SegmentGroup.Root bind:value={side} orientation="vertical" aria-label="Sidebar position">
			<SegmentGroup.Item value="left">Left</SegmentGroup.Item>
			<SegmentGroup.Item value="right">Right</SegmentGroup.Item>
			<SegmentGroup.Item value="hidden">Hidden</SegmentGroup.Item>
		</SegmentGroup.Root>
	</section>

	<section aria-labelledby="segment-group-disabled">
		<h2 id="segment-group-disabled">Disabled</h2>
		<p>
			A single segment, or the whole group, can be disabled; the arrows skip disabled
			segments.
		</p>
		<div class="row">
			<SegmentGroup.Root defaultValue="standard" aria-label="Quality with a disabled segment">
				<SegmentGroup.Item value="draft">Draft</SegmentGroup.Item>
				<SegmentGroup.Item value="standard">Standard</SegmentGroup.Item>
				<SegmentGroup.Item value="best" disabled>Best</SegmentGroup.Item>
			</SegmentGroup.Root>
			<SegmentGroup.Root defaultValue="standard" disabled aria-label="Quality (disabled)">
				<SegmentGroup.Item value="draft">Draft</SegmentGroup.Item>
				<SegmentGroup.Item value="standard">Standard</SegmentGroup.Item>
				<SegmentGroup.Item value="best">Best</SegmentGroup.Item>
			</SegmentGroup.Root>
		</div>
	</section>
</main>
