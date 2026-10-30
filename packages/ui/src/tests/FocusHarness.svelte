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

<!-- Test helper: a toggleable focus scope, a roving group and an edge-focus grid. -->
<script lang="ts">
	import { edgeFocus } from '../lib/attachments/edge-focus.js';
	import { focusBorder } from '../lib/attachments/focus-border.js';
	import { focusScope } from '../lib/internal/focus-scope.js';
	import { rovingFocus } from '../lib/internal/roving-focus.js';
	import '../lib/styles/base.css';
	import '../lib/styles/tokens.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';

	interface Props {
		open?: boolean;
		trap?: boolean;
		loop?: boolean;
		dir?: 'ltr' | 'rtl';
	}

	let { open = false, trap = true, loop = false, dir = 'ltr' }: Props = $props();
</script>

<ThemeProvider mode="light" highContrast={false}>
	<button data-testid="before">Before</button>
	{#if open}
		<div data-testid="scope" {@attach focusScope({ trap })}>
			<button data-testid="first">First</button>
			<input data-testid="middle" />
			<button data-testid="last">Last</button>
		</div>
	{/if}
	<div
		role="toolbar"
		data-testid="toolbar"
		{dir}
		{@attach rovingFocus({ orientation: 'horizontal', loop })}
	>
		<button data-oito2-roving-item data-testid="r1">One</button>
		<button data-oito2-roving-item data-testid="r2" data-disabled>Two</button>
		<button data-oito2-roving-item data-testid="r3">Three</button>
		<button data-oito2-roving-item data-testid="r4">Four</button>
	</div>
	<div
		data-testid="grid"
		class="grid"
		{@attach edgeFocus()}
		{@attach focusBorder({ radius: 'large' })}
	>
		<button data-testid="g1">1</button>
		<button data-testid="g2">2</button>
		<button data-testid="g3">3</button>
		<button data-testid="g4">4</button>
	</div>
	<button data-testid="after">After</button>
</ThemeProvider>

<style>
	.grid {
		display: grid;
		grid-template-columns: 60px 60px;
		gap: 8px;
		width: 128px;
	}
</style>
