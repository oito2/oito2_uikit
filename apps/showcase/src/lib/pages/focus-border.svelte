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
	import {
		Button,
		IconButton,
		Switch,
		TextField,
		edgeFocus,
		focusBorder,
		type IconComponent
	} from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;

	let name = $state('');
	let email = $state('');

	const radii = ['none', 'small', 'medium', 'large', '24px'] as const;

	let alwaysOn = $state(false);

	const cells = Array.from({ length: 9 }, (_, index) => index + 1);
	let picked = $state<number | null>(null);
</script>

<main class="showcase-page">
	<p>
		Two attachments for keyboard users. <code>focusBorder</code> draws a ring around a group
		while something inside it has keyboard focus, as around a list, a card or a set of fields.
		<code>edgeFocus</code> moves the focus between the controls of a group with the arrow keys, by
		their position on screen, and stops at the edges.
	</p>

	<section aria-labelledby="focus-border-group">
		<h2 id="focus-border-group">Around a group</h2>
		<p>
			Tab into the fields: the ring shows around the whole card. It doesn't show after a
			click, and it doesn't change the layout.
		</p>
		<div class="column focus-border-card" {@attach focusBorder({ radius: 'large' })}>
			<TextField bind:value={name} aria-label="Name" placeholder="Name" />
			<TextField bind:value={email} aria-label="Email" placeholder="Email" />
			<div class="row">
				<Button variant="filled">Save</Button>
				<Button variant="text">Cancel</Button>
			</div>
		</div>
	</section>

	<section aria-labelledby="focus-border-radius">
		<h2 id="focus-border-radius">Corner radius</h2>
		<p>
			<code>radius</code> takes a radius token or any CSS length, and sets the corners of the element
			and of the ring.
		</p>
		<div class="row">
			{#each radii as radius (radius)}
				<button class="focus-border-tile" {@attach focusBorder({ radius })}>{radius}</button
				>
			{/each}
		</div>
	</section>

	<section aria-labelledby="focus-border-forced">
		<h2 id="focus-border-forced">Forced on</h2>
		<p>
			<code>focused</code> turns the ring on or off whatever the focus, as for a selected card or
			a drop target.
		</p>
		<label class="row">Always on <Switch bind:checked={alwaysOn} /></label>
		<div
			class="focus-border-card focus-border-forced"
			{@attach focusBorder({ radius: 'large', focused: alwaysOn ? true : undefined })}
		>
			A card that shows the ring while the switch is on.
		</div>
	</section>

	<section aria-labelledby="focus-border-edge">
		<h2 id="focus-border-edge">Edge focus in a grid</h2>
		<p>
			Tab into the grid, then move with the arrow keys: focus follows the layout and stops at
			the edges instead of leaving the grid or scrolling the page.
		</p>
		<div
			class="focus-border-grid"
			role="group"
			aria-label="Number grid"
			{@attach edgeFocus()}
			{@attach focusBorder({ radius: 'large' })}
		>
			{#each cells as cell (cell)}
				<button aria-pressed={picked === cell} onclick={() => (picked = cell)}
					>{cell}</button
				>
			{/each}
		</div>
		<p class="note">Picked: {picked ?? 'none'}</p>
	</section>

	<section aria-labelledby="focus-border-toolbar">
		<h2 id="focus-border-toolbar">Edge focus in a toolbar</h2>
		<p>
			With <code>orientation: 'horizontal'</code> only Left and Right move; Up and Down stay free
			for the controls.
		</p>
		<div
			class="row focus-border-toolbar"
			role="toolbar"
			aria-label="Formatting"
			{@attach edgeFocus({ orientation: 'horizontal' })}
			{@attach focusBorder()}
		>
			<IconButton icon={icon(Bold)} label="Bold" />
			<IconButton icon={icon(Italic)} label="Italic" />
			<IconButton icon={icon(Underline)} label="Underline" />
			<Button variant="text">Clear formatting</Button>
		</div>
	</section>
</main>

<style>
	.focus-border-card {
		max-width: 360px;
		padding: var(--oito2-space-md);
		border: 1px solid var(--oito2-color-outline-variant);
		background: var(--oito2-color-surface-container-low);
	}

	.focus-border-tile {
		width: 88px;
		height: 64px;
		border: 1px solid var(--oito2-color-outline-variant);
		background: var(--oito2-color-surface-container);
		color: var(--oito2-color-on-surface);
		font: var(--oito2-type-label-large);
	}

	.focus-border-grid {
		display: grid;
		grid-template-columns: repeat(3, 56px);
		gap: var(--oito2-space-sm);
		width: max-content;
		padding: var(--oito2-space-sm);
	}

	.focus-border-grid button {
		height: 56px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-surface-container);
		color: var(--oito2-color-on-surface);
		font: var(--oito2-type-title-medium);
	}

	.focus-border-grid button[aria-pressed='true'] {
		background: var(--oito2-color-selected-fill);
		color: var(--oito2-color-on-selected-fill);
	}

	.focus-border-toolbar {
		width: max-content;
		padding: var(--oito2-space-xs);
		gap: var(--oito2-space-xs);
	}
</style>
