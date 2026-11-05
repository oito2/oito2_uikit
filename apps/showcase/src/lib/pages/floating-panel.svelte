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
	import { Button, FloatingPanel, type WindowControlStyle } from '@oito2/ui';

	let panelOpen = $state(true);
	let rect = $state({ x: 24, y: 24, width: 320, height: 220 });
	let fixedRect = $state({ x: 24, y: 24, width: 260, height: 160 });
	let controlStyle = $state<WindowControlStyle>('gnome');

	const styles: WindowControlStyle[] = ['gnome', 'breeze', 'windows', 'macos'];
</script>

<main class="showcase-page">
	<p>
		<code>FloatingPanel</code> is a small window inside its positioned parent, such as a tool
		palette, kept within it. Drag the title bar to move it and the corner grip to resize it; the
		title bar buttons minimize it to the bar, maximize it to the parent and close it. With focus
		on the panel itself, the arrows move it and Shift with the arrows resizes it, by
		<code>keyboardStep</code> pixels.
	</p>

	<section aria-labelledby="floating-panel-basic">
		<h2 id="floating-panel-basic">Movable and resizable</h2>
		<div class="row">
			{#each styles as style (style)}
				<Button
					variant={controlStyle === style ? 'filled' : 'outlined'}
					aria-pressed={controlStyle === style}
					onclick={() => (controlStyle = style)}>{style}</Button
				>
			{/each}
		</div>
		<div class="stage panel-stage">
			{#if panelOpen}
				<FloatingPanel
					title="Layers"
					bind:rect
					{controlStyle}
					onClose={() => (panelOpen = false)}
				>
					<p class="panel-text">
						The title bar buttons follow the window control style; close calls <code
							>onClose</code
						>.
					</p>
				</FloatingPanel>
			{:else}
				<Button variant="text" onclick={() => (panelOpen = true)}>Show the panel</Button>
			{/if}
		</div>
		<p class="note">
			Position {Math.round(rect.x)}, {Math.round(rect.y)} · size {Math.round(rect.width)} × {Math.round(
				rect.height
			)}
		</p>
	</section>

	<section aria-labelledby="floating-panel-fixed">
		<h2 id="floating-panel-fixed">Fixed size</h2>
		<p>
			With <code>resizable</code> off the panel has no corner grip; without
			<code>onClose</code> it has no close button.
		</p>
		<div class="stage panel-stage">
			<FloatingPanel
				title="Properties"
				resizable={false}
				bind:rect={fixedRect}
				keyboardStep={32}
			>
				<p class="panel-text">Arrow keys move this one 32 pixels at a time.</p>
			</FloatingPanel>
		</div>
	</section>
</main>

<style>
	.panel-stage {
		height: 360px;
		overflow: hidden;
	}

	.panel-text {
		margin: 0;
		padding: var(--oito2-space-md);
	}
</style>
