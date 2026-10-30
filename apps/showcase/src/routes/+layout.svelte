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
	import '@oito2/ui/styles.css';
	import '@oito2/ui-syntax/fonts.css';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { spikeRequest } from '#lib/spikes/bridge.js';

	let { children }: LayoutProps = $props();

	// A Tauri debug build started with OITO2_SPIKE opens that spike page and reports back.
	onMount(async () => {
		const spike = await spikeRequest();
		if (spike) await goto(resolve(`/spikes/${spike}?report`));
	});
</script>

{@render children()}

<style>
	:global(html) {
		color-scheme: light dark;
		/* The Linux window is transparent so GTK can draw its shadow; the page stays opaque. */
		background: Canvas;
	}

	:global(body) {
		margin: 0;
		font-family:
			Inter, Ubuntu, Roboto, 'Segoe UI', 'SF Pro Text', 'Noto Sans', system-ui, sans-serif;
		background: Canvas;
		color: CanvasText;
	}
</style>
