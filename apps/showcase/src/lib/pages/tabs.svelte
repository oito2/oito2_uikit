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
	import Image from '@lucide/svelte/icons/image';
	import Library from '@lucide/svelte/icons/library';
	import Settings from '@lucide/svelte/icons/settings';
	import Shield from '@lucide/svelte/icons/shield';
	import { HeaderBar, Tabs, type IconComponent, type TabsVariant } from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const variants: TabsVariant[] = ['pill', 'subtle'];
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	let section = $state('photos');
	let month = $state('March');
	let manual = $state('one');
	let view = $state('photos');
</script>

<main class="showcase-page">
	<p>
		Tabs switch between views of the same context. The arrow keys move between the tabs, Home
		and End jump to the ends, and by default focusing a tab shows its panel. The list comes in
		two looks: <code>pill</code> puts the selected tab on a filled pill and <code>subtle</code> marks
		it more quietly.
	</p>

	<section aria-labelledby="tabs-variants">
		<h2 id="tabs-variants">Variants</h2>
		{#each variants as variant (variant)}
			<div class="column">
				<h3>{variant}</h3>
				<Tabs.Root defaultValue="overview" {variant}>
					<Tabs.List aria-label="Project, {variant} tabs">
						<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
						<Tabs.Trigger value="details">Details</Tabs.Trigger>
						<Tabs.Trigger value="history">History</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="overview" class="tabs-panel"
						>The project overview.</Tabs.Content
					>
					<Tabs.Content value="details" class="tabs-panel"
						>The project details.</Tabs.Content
					>
					<Tabs.Content value="history" class="tabs-panel"
						>The change history.</Tabs.Content
					>
				</Tabs.Root>
			</div>
		{/each}
	</section>

	<section aria-labelledby="tabs-icons">
		<h2 id="tabs-icons">Icons and bound value</h2>
		<Tabs.Root bind:value={section}>
			<Tabs.List aria-label="Library sections">
				<Tabs.Trigger value="photos" icon={icon(Image)}>Photos</Tabs.Trigger>
				<Tabs.Trigger value="albums" icon={icon(Library)}>Albums</Tabs.Trigger>
				<Tabs.Trigger value="shared" icon={icon(Bell)}>Shared</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="photos" class="tabs-panel">All photos.</Tabs.Content>
			<Tabs.Content value="albums" class="tabs-panel">Your albums.</Tabs.Content>
			<Tabs.Content value="shared" class="tabs-panel">Shared with you.</Tabs.Content>
		</Tabs.Root>
		<p>Selected: {section}.</p>
	</section>

	<section aria-labelledby="tabs-vertical">
		<h2 id="tabs-vertical">Vertical</h2>
		<p>In a column the Up and Down arrow keys move between the tabs.</p>
		<Tabs.Root defaultValue="general" orientation="vertical" class="tabs-vertical">
			<Tabs.List aria-label="Settings sections">
				<Tabs.Trigger value="general" icon={icon(Settings)}>General</Tabs.Trigger>
				<Tabs.Trigger value="alerts" icon={icon(Bell)}>Alerts</Tabs.Trigger>
				<Tabs.Trigger value="privacy" icon={icon(Shield)}>Privacy</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="general" class="tabs-panel">General settings.</Tabs.Content>
			<Tabs.Content value="alerts" class="tabs-panel">Alert settings.</Tabs.Content>
			<Tabs.Content value="privacy" class="tabs-panel">Privacy settings.</Tabs.Content>
		</Tabs.Root>
	</section>

	<section aria-labelledby="tabs-scrollable">
		<h2 id="tabs-scrollable">Scrollable</h2>
		<p>A <code>scrollable</code> list scrolls when its tabs don't fit the width.</p>
		<div class="narrow">
			<Tabs.Root bind:value={month} variant="subtle">
				<Tabs.List scrollable aria-label="Months">
					{#each months as name (name)}
						<Tabs.Trigger value={name}>{name}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each months as name (name)}
					<Tabs.Content value={name} class="tabs-panel">The {name} report.</Tabs.Content>
				{/each}
			</Tabs.Root>
		</div>
	</section>

	<section aria-labelledby="tabs-manual">
		<h2 id="tabs-manual">Manual activation</h2>
		<p>
			With <code>activateOnFocus</code> off the arrow keys only move the focus; Enter or Space shows
			the panel.
		</p>
		<Tabs.Root bind:value={manual} activateOnFocus={false}>
			<Tabs.List aria-label="Manual tabs">
				<Tabs.Trigger value="one">First</Tabs.Trigger>
				<Tabs.Trigger value="two">Second</Tabs.Trigger>
				<Tabs.Trigger value="three">Third</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="one" class="tabs-panel">The first panel.</Tabs.Content>
			<Tabs.Content value="two" class="tabs-panel">The second panel.</Tabs.Content>
			<Tabs.Content value="three" class="tabs-panel">The third panel.</Tabs.Content>
		</Tabs.Root>
	</section>

	<section aria-labelledby="tabs-header-bar">
		<h2 id="tabs-header-bar">In a header bar</h2>
		<p>A <code>HeaderBar</code> shows a tab list in place of its title, as a view switcher.</p>
		<div class="window">
			<Tabs.Root bind:value={view}>
				<HeaderBar>
					{#snippet tabs()}
						<Tabs.List aria-label="Gallery views">
							<Tabs.Trigger value="photos">Photos</Tabs.Trigger>
							<Tabs.Trigger value="albums">Albums</Tabs.Trigger>
						</Tabs.List>
					{/snippet}
				</HeaderBar>
				<Tabs.Content value="photos" class="tabs-panel">All photos.</Tabs.Content>
				<Tabs.Content value="albums" class="tabs-panel">Your albums.</Tabs.Content>
			</Tabs.Root>
		</div>
	</section>
</main>

<style>
	.showcase-page :global(.tabs-panel) {
		padding: var(--oito2-space-md);
	}

	.showcase-page :global(.tabs-vertical) {
		min-height: 160px;
	}

	.narrow {
		max-width: 420px;
	}

	.window {
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}
</style>
