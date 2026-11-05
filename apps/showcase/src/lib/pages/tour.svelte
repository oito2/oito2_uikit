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
	import Bell from '@lucide/svelte/icons/bell';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import { Button, IconButton, Tour, TourController, type IconComponent } from '@oito2/ui';

	const tour = new TourController([
		{
			title: 'Welcome',
			description: 'A short walk through this mock toolbar. The arrow keys go back and forth.'
		},
		{
			title: 'Search',
			target: '#tour-search',
			description: 'Find anything in the project.'
		},
		{
			title: 'Notifications',
			target: '#tour-bell',
			description: 'Click the bell to go on: this step waits for a click on its target.',
			waitForTap: true
		},
		{
			title: 'Settings',
			target: '#tour-settings',
			description: 'The card goes on the side the step asks for.',
			placement: 'start',
			spotlightPadding: 12
		},
		{
			title: 'The whole toolbar',
			target: () => document.getElementById('tour-toolbar'),
			description: 'A target can also be a function that returns the element.',
			placement: 'top'
		}
	]);

	let result = $state('not run yet');
	let notifications = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>Tour</code> walks the user through an interface: the page dims except for a spotlight
		on each step's target, and a card beside it shows the step with Back, Next and Skip. Escape
		skips. A <code>TourController</code> holds the steps, starts the tour and tells whether it was
		completed.
	</p>

	<section aria-labelledby="tour-run">
		<h2 id="tour-run">Run a tour</h2>
		<div class="row">
			<Button onclick={() => tour.start()}>Start the tour</Button>
			{#each tour.steps as step, index (step.title)}
				<Button variant="text" onclick={() => tour.start(index)}>From “{step.title}”</Button
				>
			{/each}
		</div>
		<p class="note" role="status">
			{#if tour.isActive}
				Step {(tour.index ?? 0) + 1} of {tour.steps.length}: {tour.step?.title}
			{:else}
				Last run: {result}
			{/if}
		</p>
	</section>

	<section aria-labelledby="tour-target">
		<h2 id="tour-target">The toolbar the tour shows</h2>
		<div class="row tour-toolbar" id="tour-toolbar">
			<Button id="tour-search" variant="outlined" icon={Search as IconComponent}
				>Search</Button
			>
			<span id="tour-bell">
				<IconButton
					icon={Bell as IconComponent}
					label="Notifications"
					onclick={() => notifications++}
				/>
			</span>
			<span id="tour-settings">
				<IconButton icon={Settings as IconComponent} label="Settings" />
			</span>
		</div>
		<p class="note">The bell was clicked {notifications} times.</p>
	</section>

	<Tour
		controller={tour}
		onFinish={(completed) => (result = completed ? 'completed' : 'skipped')}
	/>
</main>

<style>
	.tour-toolbar {
		justify-content: space-between;
		max-width: 480px;
		padding: var(--oito2-space-sm);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}
</style>
