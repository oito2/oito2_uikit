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
	import { Button, Expandable } from '@oito2/ui';

	let open = $state(false);
	let changes = $state(0);
</script>

<main class="showcase-page">
	<p>
		An expandable is a single section whose content opens and closes from a heading with a
		chevron button. The <code>collapsed</code> snippet of the content shows while it is closed,
		such as a summary of what is hidden. For a group of sections, use the
		<a href={resolve('/[slug]', { slug: 'accordion' })}>accordion</a> instead.
	</p>

	<section aria-labelledby="expandable-basic">
		<h2 id="expandable-basic">Collapsed summary</h2>
		<Expandable.Root>
			<Expandable.Trigger headingLevel={3}>Advanced options</Expandable.Trigger>
			<Expandable.Content>
				{#snippet collapsed()}<p class="note">Three options hidden.</p>{/snippet}
				<p>Proxy server, cache size and logging level.</p>
			</Expandable.Content>
		</Expandable.Root>
	</section>

	<section aria-labelledby="expandable-controlled">
		<h2 id="expandable-controlled">Controlled</h2>
		<p>Bind <code>open</code> to open and close it from outside.</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (open = !open)}>{open ? 'Close' : 'Open'}</Button
			>
		</div>
		<Expandable.Root bind:open onOpenChange={() => changes++}>
			<Expandable.Trigger headingLevel={3}>Release notes</Expandable.Trigger>
			<Expandable.Content>
				<p>Version 1.4 adds dark mode, faster search and a new export dialog.</p>
			</Expandable.Content>
		</Expandable.Root>
		<p>Open: {open ? 'yes' : 'no'}. Changed {changes} times from the trigger.</p>
	</section>

	<section aria-labelledby="expandable-start">
		<h2 id="expandable-start">Chevron at the start, open by default</h2>
		<Expandable.Root defaultOpen>
			<Expandable.Trigger headingLevel={3} iconPosition="start">Details</Expandable.Trigger>
			<Expandable.Content>
				<p>Created on 3 March, modified yesterday, 24 KB.</p>
			</Expandable.Content>
		</Expandable.Root>
	</section>

	<section aria-labelledby="expandable-disabled">
		<h2 id="expandable-disabled">Disabled</h2>
		<Expandable.Root disabled>
			<Expandable.Trigger headingLevel={3}>Developer options</Expandable.Trigger>
			<Expandable.Content>
				{#snippet collapsed()}<p class="note">
						Turn on developer mode to see these.
					</p>{/snippet}
				<p>Debugging and inspection tools.</p>
			</Expandable.Content>
		</Expandable.Root>
	</section>
</main>
