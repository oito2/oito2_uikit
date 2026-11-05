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
	import { Button, Section, Switch, Tile, TileList } from '@oito2/ui';

	let previews = $state(true);
	let sounds = $state(false);
	let darkMode = $state(false);
	let resets = $state(0);

	/** Restores the notification defaults. */
	function reset() {
		previews = true;
		sounds = false;
		resets++;
	}
</script>

<main class="showcase-page">
	<p>
		A section groups related content under a headline, as the blocks of a settings page do.
		<code>Section.Header</code> renders the headline as a heading of <code>level</code> and
		holds optional <code>actions</code> at the end; <code>Section.Content</code> holds the content.
	</p>

	<section aria-labelledby="section-basic">
		<h2 id="section-basic">Headline and content</h2>
		<Section.Root>
			<Section.Header headline="Profile" level={3} />
			<Section.Content>
				<TileList>
					<Tile title="Name" subtitle="Ana Souza" />
					<Tile title="E-mail" subtitle="ana@example.com" />
				</TileList>
			</Section.Content>
		</Section.Root>
	</section>

	<section aria-labelledby="section-actions">
		<h2 id="section-actions">Header actions</h2>
		<Section.Root>
			<Section.Header headline="Notifications" level={3}>
				{#snippet actions()}<Button variant="text" onclick={reset}>Reset</Button>{/snippet}
			</Section.Header>
			<Section.Content>
				<TileList>
					<Tile title="Show previews" subtitle="On the lock screen">
						{#snippet trailing()}
							<Switch aria-label="Show previews" bind:checked={previews} />
						{/snippet}
					</Tile>
					<Tile title="Sounds" subtitle="Play a sound for new messages">
						{#snippet trailing()}
							<Switch aria-label="Sounds" bind:checked={sounds} />
						{/snippet}
					</Tile>
				</TileList>
			</Section.Content>
		</Section.Root>
		<p>Reset {resets} times.</p>
	</section>

	<section aria-labelledby="section-page">
		<h2 id="section-page">A settings page</h2>
		<div class="settings">
			<Section.Root>
				<Section.Header headline="Appearance" level={3} />
				<Section.Content>
					<TileList>
						<Tile title="Dark mode">
							{#snippet trailing()}
								<Switch aria-label="Dark mode" bind:checked={darkMode} />
							{/snippet}
						</Tile>
						<Tile title="Font size" subtitle="Medium" onclick={() => {}} />
					</TileList>
				</Section.Content>
			</Section.Root>
			<Section.Root>
				<Section.Header headline="About" level={3} />
				<Section.Content>
					<TileList>
						<Tile title="Version" subtitle="1.4.2" />
						<Tile title="License" subtitle="GPL 3.0 or later" />
					</TileList>
				</Section.Content>
			</Section.Root>
		</div>
	</section>
</main>

<style>
	.settings {
		display: grid;
		gap: var(--oito2-space-xl);
		max-width: 560px;
	}
</style>
