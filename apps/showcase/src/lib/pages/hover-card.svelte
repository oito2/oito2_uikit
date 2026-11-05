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
	import { Avatar, HoverCard, type PopoverPlacement } from '@oito2/ui';

	const placements: PopoverPlacement[] = ['top', 'bottom', 'start', 'end'];

	let open = $state(false);
</script>

{#snippet profile(name: string, role: string)}
	<div class="profile">
		<Avatar {name} status="online" />
		<div>
			<strong>{name}</strong>
			<div class="note">{role}</div>
		</div>
	</div>
{/snippet}

<main class="showcase-page">
	<p>
		<code>HoverCard</code> previews what a link leads to, such as a profile on a user name. It
		opens after <code>openDelay</code> while the pointer rests on the trigger or focus is inside
		it, on a long press on touch screens, and closes <code>closeDelay</code> after the pointer leaves
		the trigger and the card. The card doesn't take focus, so it only repeats what the trigger leads
		to.
	</p>

	<section aria-labelledby="hover-card-profile">
		<h2 id="hover-card-profile">A profile preview</h2>
		<p>
			Made by
			<HoverCard.Root bind:open>
				<HoverCard.Trigger><a href="#hover-card-profile">@ana</a></HoverCard.Trigger>
				<HoverCard.Content>
					{@render profile('Ana Souza', 'Designer, works on the oito2 identity.')}
				</HoverCard.Content>
			</HoverCard.Root>
			and reviewed by
			<HoverCard.Root>
				<HoverCard.Trigger><a href="#hover-card-profile">@bruno</a></HoverCard.Trigger>
				<HoverCard.Content>
					{@render profile('Bruno Lima', 'Engineer, maintains the Tauri plugins.')}
				</HoverCard.Content>
			</HoverCard.Root>.
		</p>
		<p class="note">The first card is {open ? 'open' : 'closed'}.</p>
	</section>

	<section aria-labelledby="hover-card-placement">
		<h2 id="hover-card-placement">Placement</h2>
		<p>The card moves to the other side when it doesn't fit.</p>
		<div class="row">
			{#each placements as placement (placement)}
				<HoverCard.Root>
					<HoverCard.Trigger
						><a href="#hover-card-placement">{placement}</a></HoverCard.Trigger
					>
					<HoverCard.Content {placement}
						>A card on the {placement} side.</HoverCard.Content
					>
				</HoverCard.Root>
			{/each}
		</div>
	</section>

	<section aria-labelledby="hover-card-options">
		<h2 id="hover-card-options">Delays, alignment and arrow</h2>
		<div class="row">
			<HoverCard.Root openDelay={0} closeDelay={0}>
				<HoverCard.Trigger><a href="#hover-card-options">No delay</a></HoverCard.Trigger>
				<HoverCard.Content>Opens and closes at once.</HoverCard.Content>
			</HoverCard.Root>
			<HoverCard.Root openDelay={1200}>
				<HoverCard.Trigger><a href="#hover-card-options">Slow to open</a></HoverCard.Trigger
				>
				<HoverCard.Content>Opens after 1.2 seconds.</HoverCard.Content>
			</HoverCard.Root>
			<HoverCard.Root>
				<HoverCard.Trigger
					><a href="#hover-card-options">Start aligned</a></HoverCard.Trigger
				>
				<HoverCard.Content alignment="start" arrow={false} maxWidth={200}>
					Aligned to the start of the trigger, without an arrow, at most 200 pixels wide.
				</HoverCard.Content>
			</HoverCard.Root>
		</div>
	</section>
</main>

<style>
	.profile {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-md);
	}
</style>
