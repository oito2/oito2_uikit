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
	import Heart from '@lucide/svelte/icons/heart';
	import Settings from '@lucide/svelte/icons/settings';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { Button, Card, IconButton, LinearProgress } from '@oito2/ui';

	let liked = $state(false);
	let saved = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>Card</code> groups related content on a surface with an outline and large rounded
		corners. Compose it with <code>Card.Header</code> (a title, a description and actions),
		<code>Card.Content</code> and <code>Card.Footer</code>; every part is optional.
	</p>

	<section aria-labelledby="card-anatomy">
		<h2 id="card-anatomy">Header, content and footer</h2>
		<div class="cards">
			<Card.Root>
				<Card.Header title="Backup" description="Last run today at 09:30" />
				<Card.Content>
					Your documents and pictures are copied to the external drive every day.
				</Card.Content>
				<Card.Footer>
					<Button variant="text" onclick={() => (saved = false)}>Cancel</Button>
					<Button onclick={() => (saved = true)}>{saved ? 'Saved' : 'Save'}</Button>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header title="Storage" description="128 GB of 256 GB used">
					{#snippet actions()}
						<IconButton icon={Settings} label="Storage settings" />
					{/snippet}
				</Card.Header>
				<Card.Content>
					<LinearProgress value={0.5} label="Storage used" />
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<section aria-labelledby="card-minimal">
		<h2 id="card-minimal">Content only</h2>
		<p>A card can hold just its content, such as a short note or a quote.</p>
		<div class="cards">
			<Card.Root>
				<Card.Content
					>Cards take the width of their container and grow with their content.</Card.Content
				>
			</Card.Root>
			<Card.Root>
				<Card.Header title="Title only" />
			</Card.Root>
		</div>
	</section>

	<section aria-labelledby="card-custom">
		<h2 id="card-custom">Custom header</h2>
		<p>
			<code>title</code> and <code>description</code> also take snippets, and
			<code>children</code> add content under them.
		</p>
		<div class="cards">
			<Card.Root>
				<Card.Header>
					{#snippet title()}<span class="accent">Sunset over the bay</span>{/snippet}
					{#snippet description()}Photo by Ana · 2 days ago{/snippet}
					{#snippet actions()}
						<IconButton
							icon={Heart}
							label="Like"
							selected={liked}
							onclick={() => (liked = !liked)}
						/>
						<IconButton icon={Share2} label="Share" />
					{/snippet}
					<span class="note"
						>{liked ? 'You like this photo.' : 'Nobody likes it yet.'}</span
					>
				</Card.Header>
				<Card.Content>
					<div
						class="picture"
						role="img"
						aria-label="An orange gradient standing for a photo"
					></div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>
</main>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--oito2-space-lg);
		align-items: start;
	}

	.accent {
		color: var(--oito2-color-primary-text);
	}

	.picture {
		height: 120px;
		border-radius: var(--oito2-radius-medium);
		background: linear-gradient(
			135deg,
			var(--oito2-color-tertiary-container),
			var(--oito2-color-primary-container)
		);
	}
</style>
