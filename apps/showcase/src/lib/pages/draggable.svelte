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
	import { resolve } from '$app/paths';
	import { draggable, focusBorder, useLocale } from '@oito2/ui';

	const locale = useLocale();

	let position = $state({ x: 24, y: 24 });
	let dragging = $state(false);
	let moves = $state(0);

	const notes = [
		{ id: 'groceries', text: 'Groceries', x: 16, y: 16, step: 8 },
		{ id: 'call', text: 'Call Ana', x: 160, y: 48, step: 8 },
		{ id: 'big', text: 'Big steps (32 px)', x: 48, y: 120, step: 32 }
	];
</script>

<main class="showcase-page">
	<p>
		The <code>draggable</code> attachment lets the user move an element inside its positioned
		container, with the pointer or, once focused, with the arrow keys. The element is placed
		with
		<code>position: absolute</code> and joins the tab order; give it an accessible name and a
		description such as the localized <code>moveWithArrowKeys</code> string. For a whole movable
		window, see the <a href={resolve('/[slug]', { slug: 'floating-panel' })}>floating panel</a>.
	</p>

	<span id="draggable-hint" hidden>{locale.strings.moveWithArrowKeys}</span>

	<section aria-labelledby="draggable-basic">
		<h2 id="draggable-basic">A movable note</h2>
		<p>
			<code>onMove</code> reports each new position; <code>onDragStart</code> and
			<code>onDragEnd</code> bracket a pointer drag. <code>focusBorder</code> draws the focus ring.
		</p>
		<div class="stage draggable-stage">
			<div
				class="draggable-note"
				data-dragging={dragging ? '' : undefined}
				role="group"
				aria-label="Sticky note"
				aria-describedby="draggable-hint"
				{@attach focusBorder()}
				{@attach draggable({
					initialPosition: { x: 24, y: 24 },
					onMove: (next) => {
						position = next;
						moves++;
					},
					onDragStart: () => (dragging = true),
					onDragEnd: () => (dragging = false)
				})}
			>
				Drag me
			</div>
		</div>
		<p class="note">
			Position {Math.round(position.x)}, {Math.round(position.y)} · {moves} moves ·
			{dragging ? 'dragging' : 'at rest'}
		</p>
	</section>

	<section aria-labelledby="draggable-many">
		<h2 id="draggable-many">Several notes</h2>
		<p>
			Each note moves on its own; <code>keyboardStep</code> sets how far an arrow press goes.
		</p>
		<div class="stage draggable-stage">
			{#each notes as note (note.id)}
				<div
					class="draggable-note"
					role="group"
					aria-label={note.text}
					aria-describedby="draggable-hint"
					{@attach focusBorder()}
					{@attach draggable({
						initialPosition: { x: note.x, y: note.y },
						keyboardStep: note.step
					})}
				>
					{note.text}
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.draggable-stage {
		height: 240px;
		max-width: 560px;
		overflow: hidden;
	}

	.draggable-note {
		padding: var(--oito2-space-sm) var(--oito2-space-md);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-secondary-container);
		color: var(--oito2-color-on-secondary-container);
		touch-action: none;
		user-select: none;
	}

	.draggable-note[data-dragging] {
		outline: 2px dashed var(--oito2-color-outline);
	}
</style>
