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
	import { isTauri } from '@tauri-apps/api/core';
	import { getCurrentWindow, type Window } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';
	import { spikeDecorationMode, type DecorationMode } from '#lib/spikes/bridge.js';

	// The package doesn't export its resize direction type, so it is taken from the method.
	type ResizeDirection = Parameters<Window['startResizeDragging']>[0];

	const edges: { direction: ResizeDirection; className: string }[] = [
		{ direction: 'North', className: 'n' },
		{ direction: 'South', className: 's' },
		{ direction: 'East', className: 'e' },
		{ direction: 'West', className: 'w' },
		{ direction: 'NorthEast', className: 'ne' },
		{ direction: 'NorthWest', className: 'nw' },
		{ direction: 'SouthEast', className: 'se' },
		{ direction: 'SouthWest', className: 'sw' }
	];

	const tauri = isTauri();
	let maximized = $state(false);
	let mode = $state<DecorationMode | null>(null);
	// With the system frame, the system draws the controls and the resize edges.
	let ownChrome = $derived(mode !== 'native');

	onMount(() => {
		if (!tauri) return;
		void spikeDecorationMode().then((value) => (mode = value));
		const appWindow = getCurrentWindow();
		const refresh = async () => {
			maximized = await appWindow.isMaximized();
		};
		void refresh();
		const unlisten = appWindow.onResized(() => void refresh());
		return () => void unlisten.then((stop) => stop());
	});

	// Each action is a no-op in the browser build, where no native window exists.
	const minimize = () => tauri && void getCurrentWindow().minimize();
	const toggleMaximize = () => tauri && void getCurrentWindow().toggleMaximize();
	const close = () => tauri && void getCurrentWindow().close();
	const resize = (direction: ResizeDirection) =>
		tauri && void getCurrentWindow().startResizeDragging(direction);
</script>

<div class="window">
	<header data-tauri-drag-region>
		<span class="title" data-tauri-drag-region>
			Window chrome spike{mode ? ` — ${mode}` : ''}
		</span>
		{#if ownChrome}
			<div class="controls">
				<button type="button" onclick={minimize} aria-label="Minimize">–</button>
				<button
					type="button"
					onclick={toggleMaximize}
					aria-label={maximized ? 'Restore' : 'Maximize'}
				>
					{maximized ? '❐' : '□'}
				</button>
				<button type="button" onclick={close} aria-label="Close">×</button>
			</div>
		{/if}
	</header>
	<main>
		<p>Check, for the decoration mode chosen with <code>OITO2_DECORATIONS</code>:</p>
		<ol>
			<li>
				Dragging the title bar moves the window; double-clicking it maximizes and restores.
			</li>
			<li>The window has a shadow and rounded corners where the desktop draws them.</li>
			<li>Every edge and corner resizes the window.</li>
			<li>Tiling (Super+arrows, dragging to a screen edge) works.</li>
		</ol>
		{#if !tauri}
			<p>Browser build: the buttons and the resize handles do nothing.</p>
		{/if}
	</main>
	{#if ownChrome && !maximized}
		{#each edges as edge (edge.direction)}
			<div
				class="edge {edge.className}"
				role="presentation"
				onpointerdown={(event) => event.button === 0 && resize(edge.direction)}
			></div>
		{/each}
	{/if}
</div>

<style>
	.window {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
	}

	header {
		height: 46px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 6px 0 16px;
		background: color-mix(in srgb, CanvasText 8%, Canvas);
		border-bottom: 1px solid color-mix(in srgb, CanvasText 15%, Canvas);
		user-select: none;
	}

	.title {
		font-weight: 600;
	}

	.controls {
		display: flex;
		gap: 6px;
	}

	.controls button {
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 50%;
		background: color-mix(in srgb, CanvasText 12%, Canvas);
		color: inherit;
		font: inherit;
		line-height: 1;
	}

	main {
		padding: 20px;
		overflow: auto;
	}

	.edge {
		position: fixed;
		z-index: 10;
	}

	.n,
	.s {
		left: 8px;
		right: 8px;
		height: 6px;
		cursor: ns-resize;
	}

	.e,
	.w {
		top: 8px;
		bottom: 8px;
		width: 6px;
		cursor: ew-resize;
	}

	.n {
		top: 0;
	}

	.s {
		bottom: 0;
	}

	.e {
		right: 0;
	}

	.w {
		left: 0;
	}

	.ne,
	.nw,
	.se,
	.sw {
		width: 10px;
		height: 10px;
	}

	.ne {
		top: 0;
		right: 0;
		cursor: nesw-resize;
	}

	.nw {
		top: 0;
		left: 0;
		cursor: nwse-resize;
	}

	.se {
		bottom: 0;
		right: 0;
		cursor: nwse-resize;
	}

	.sw {
		bottom: 0;
		left: 0;
		cursor: nesw-resize;
	}
</style>
