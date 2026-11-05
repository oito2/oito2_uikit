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
	import CircleHelp from '@lucide/svelte/icons/circle-question-mark';
	import Pencil from '@lucide/svelte/icons/pencil';
	import {
		Button,
		IconButton,
		Popover,
		PopoverController,
		TextField,
		type IconComponent,
		type PopoverAlignment,
		type PopoverPlacement
	} from '@oito2/ui';

	const placements: PopoverPlacement[] = ['top', 'bottom', 'start', 'end'];
	const alignments: PopoverAlignment[] = ['start', 'center', 'end'];

	let name = $state('Report');
	let draft = $state('Report');
	let renameOpen = $state(false);

	const hint = new PopoverController();
</script>

<main class="showcase-page">
	<p>
		<code>Popover</code> is a non-modal panel anchored to an element, for pickers and short
		forms. It opens on the content's <code>placement</code> side and moves to the other side
		when it doesn't fit; Escape and a click outside close it. Bind <code>open</code>, start it
		with
		<code>defaultOpen</code>, or open it from code with a <code>PopoverController</code>.
	</p>

	<section aria-labelledby="popover-form">
		<h2 id="popover-form">A short form</h2>
		<p>The panel takes focus when it opens; <code>Popover.Close</code> closes it.</p>
		<div class="row">
			<Popover.Root
				bind:open={renameOpen}
				onOpenChange={(open) => {
					if (open) draft = name;
				}}
			>
				<Popover.Trigger icon={Pencil as IconComponent}>Rename</Popover.Trigger>
				<Popover.Content>
					<Popover.Arrow />
					<Popover.Title>Rename the file</Popover.Title>
					<form
						class="popover-form"
						onsubmit={(event) => {
							event.preventDefault();
							name = draft.trim() || name;
							renameOpen = false;
						}}
					>
						<TextField aria-label="New name" bind:value={draft} />
						<Button type="submit">Save</Button>
						<Popover.Close>Cancel</Popover.Close>
					</form>
				</Popover.Content>
			</Popover.Root>
			<span>File name: <strong>{name}</strong></span>
		</div>
	</section>

	<section aria-labelledby="popover-placement">
		<h2 id="popover-placement">Placement and alignment</h2>
		<div class="row">
			{#each placements as placement (placement)}
				<Popover.Root>
					<Popover.Trigger variant="outlined">{placement}</Popover.Trigger>
					<Popover.Content {placement} alignment="center">
						<Popover.Arrow />
						A panel on the {placement} side.
					</Popover.Content>
				</Popover.Root>
			{/each}
		</div>
		<div class="row">
			{#each alignments as alignment (alignment)}
				<Popover.Root>
					<Popover.Trigger variant="text">Aligned to the {alignment}</Popover.Trigger>
					<Popover.Content {alignment} maxWidth={220}>
						Below the button, aligned to its {alignment} edge.
					</Popover.Content>
				</Popover.Root>
			{/each}
		</div>
	</section>

	<section aria-labelledby="popover-anchor">
		<h2 id="popover-anchor">Anchor and controller</h2>
		<p>
			<code>Popover.Anchor</code> places the panel against a whole field, and the
			<code>PopoverController</code> opens it from the help button. This panel neither takes focus
			nor closes on an outside click.
		</p>
		<Popover.Root controller={hint}>
			<Popover.Anchor class="popover-anchor">
				<TextField aria-label="Server address" placeholder="Server address" />
				<IconButton
					icon={CircleHelp as IconComponent}
					label="What is this?"
					selected={hint.isOpen}
					onclick={() => hint.toggle()}
				/>
			</Popover.Anchor>
			<Popover.Content matchAnchorWidth focusOnOpen={false} closeOnOutsideClick={false}>
				<Popover.Arrow />
				<Popover.Title>Server address</Popover.Title>
				<p class="popover-text">The host name or IP address, with an optional port.</p>
				<Popover.Close variant="tonal">Got it</Popover.Close>
			</Popover.Content>
		</Popover.Root>
		<p class="note">The help panel is {hint.isOpen ? 'open' : 'closed'}.</p>
	</section>

	<section aria-labelledby="popover-flush">
		<h2 id="popover-flush">Flush content</h2>
		<p><code>flush</code> drops the padding for content that sets its own, such as a list.</p>
		<Popover.Root>
			<Popover.Trigger variant="outlined">Recent files</Popover.Trigger>
			<Popover.Content flush>
				<ul class="recent">
					<li>report.odt</li>
					<li>budget.ods</li>
					<li>slides.odp</li>
				</ul>
			</Popover.Content>
		</Popover.Root>
	</section>
</main>

<style>
	.popover-form {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	:global(.popover-anchor) {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-sm);
		width: min(360px, 100%);
	}

	.popover-text {
		margin: 0 0 var(--oito2-space-sm);
	}

	.recent {
		margin: 0;
		padding: var(--oito2-space-sm) 0;
		list-style: none;
	}

	.recent li {
		padding: var(--oito2-space-xs) var(--oito2-space-md);
	}
</style>
