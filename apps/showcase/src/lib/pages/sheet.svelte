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
	import Funnel from '@lucide/svelte/icons/funnel';
	import {
		Button,
		Sheet,
		Switch,
		TextField,
		type IconComponent,
		type SheetSide
	} from '@oito2/ui';

	const sides: SheetSide[] = ['start', 'end', 'bottom'];

	let side = $state<SheetSide>('end');
	let sideOpen = $state(false);
	let snap = $state(0);
	let snapOpen = $state(false);
	let panelOpen = $state(false);
	let unread = $state(true);
	let count = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>Sheet</code> is a panel that slides in from a window edge. A modal sheet dims the page
		and keeps focus inside; a non-modal one leaves the page usable beside it. Escape closes
		either, and when <code>dismissible</code>, so do a click on the dimmed page and a drag of
		<code>Sheet.Handle</code> toward the edge.
	</p>

	<section aria-labelledby="sheet-sides">
		<h2 id="sheet-sides">Sides</h2>
		<p><code>start</code> and <code>end</code> follow the reading direction.</p>
		<div class="row">
			{#each sides as each (each)}
				<Button
					variant="outlined"
					onclick={() => {
						side = each;
						sideOpen = true;
					}}>From the {each}</Button
				>
			{/each}
		</div>
		<Sheet.Root bind:open={sideOpen} {side}>
			<Sheet.Content>
				<Sheet.Handle />
				<Sheet.Header title="Filters" />
				<Sheet.Body>
					<div class="column">
						<TextField aria-label="Search filters" placeholder="Search filters" />
						<label class="row">Unread only <Switch bind:checked={unread} /></label>
					</div>
				</Sheet.Body>
			</Sheet.Content>
		</Sheet.Root>
	</section>

	<section aria-labelledby="sheet-snap">
		<h2 id="sheet-snap">Snap points</h2>
		<p>
			A bottom sheet with <code>snapPoints</code> rests at those fractions of the window height;
			drag its handle between them, or below the lowest to close it.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (snapOpen = true)}>Open the bottom sheet</Button>
			<span class="note">Snap point: {snap}</span>
		</div>
		<Sheet.Root bind:open={snapOpen} side="bottom" snapPoints={[0.3, 0.6, 0.9]} bind:snap>
			<Sheet.Content>
				<Sheet.Handle />
				<Sheet.Header title="Details">
					{#snippet actions()}
						<Button variant="text" onclick={() => (snap = (snap + 1) % 3)}
							>Next height</Button
						>
					{/snippet}
				</Sheet.Header>
				<Sheet.Body>
					<p>Resting at {[30, 60, 90][snap]}% of the window height.</p>
				</Sheet.Body>
			</Sheet.Content>
		</Sheet.Root>
	</section>

	<section aria-labelledby="sheet-trigger">
		<h2 id="sheet-trigger">Trigger, size and closing</h2>
		<p>
			<code>Sheet.Trigger</code> opens an uncontrolled sheet; <code>Sheet.Content</code>'s
			<code>size</code> sets its width. This one isn't dismissible: only Escape and its buttons
			close it.
		</p>
		<Sheet.Root side="start" dismissible={false}>
			<Sheet.Trigger icon={Funnel as IconComponent}>Wide sheet</Sheet.Trigger>
			<Sheet.Content size={480}>
				<Sheet.Header title="Advanced filters" closeButton={false} />
				<Sheet.Body>
					<p>Click on the dimmed page: the sheet stays open.</p>
				</Sheet.Body>
				<div class="sheet-footer">
					<Sheet.Close>Cancel</Sheet.Close>
					<Sheet.Close variant="filled">Apply</Sheet.Close>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</section>

	<section aria-labelledby="sheet-modeless">
		<h2 id="sheet-modeless">Non-modal</h2>
		<p>The page stays usable while the sheet is open: the counter below keeps working.</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (panelOpen = !panelOpen)}>
				{panelOpen ? 'Close' : 'Open'} the side panel
			</Button>
			<Button variant="outlined" onclick={() => count++}>Clicked {count} times</Button>
		</div>
		<Sheet.Root bind:open={panelOpen} modal={false}>
			<Sheet.Content size={300}>
				<Sheet.Header title="Side panel" />
				<Sheet.Body>
					<p>A non-modal sheet neither dims the page nor keeps the focus.</p>
				</Sheet.Body>
			</Sheet.Content>
		</Sheet.Root>
	</section>
</main>

<style>
	.sheet-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--oito2-space-sm);
		padding: var(--oito2-space-md);
	}
</style>
