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
	import House from '@lucide/svelte/icons/house';
	import Image from '@lucide/svelte/icons/image';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Settings from '@lucide/svelte/icons/settings';
	import Star from '@lucide/svelte/icons/star';
	import {
		Accordion,
		Banner,
		BorderContainer,
		Button,
		Carousel,
		Expandable,
		HeaderBar,
		InfoBadge,
		InfoBox,
		MasterDetail,
		NavigationPage,
		NavigationRail,
		PageIndicator,
		Pagination,
		PanedView,
		Section,
		SelectableContainer,
		Splitter,
		Steps,
		Switch,
		TableOfContents,
		Tabs,
		Tile,
		TileList,
		Watermark,
		infoTypes,
		type IconComponent,
		type NavigationRailStyle
	} from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const destinations = [
		{ value: 'home', label: 'Home', icon: icon(House) },
		{ value: 'inbox', label: 'Inbox', icon: icon(Inbox) },
		{ value: 'alerts', label: 'Alerts', icon: icon(Bell) },
		{ value: 'settings', label: 'Settings', icon: icon(Settings) }
	];
	const railStyles: NavigationRailStyle[] = ['compact', 'labelled', 'labelledExtended'];
	const people = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Reis', 'Elisa Prado'];
	const sections = [
		{ id: 'toc-intro', title: 'Introduction' },
		{ id: 'toc-setup', title: 'Setup' },
		{ id: 'toc-setup-linux', title: 'Linux', depth: 1 },
		{ id: 'toc-setup-windows', title: 'Windows', depth: 1 },
		{ id: 'toc-usage', title: 'Usage' }
	];

	let railStyle = $state<NavigationRailStyle>('labelled');
	let destination = $state('home');
	let chosen = $state('b');
	let notifications = $state(true);
	let page = $state(3);
	let pageSize = $state(25);
	let step = $state(1);
	let dot = $state(0);
	let view = $state('photos');
	let tocView = $state<HTMLElement | null>(null);
</script>

{#snippet star()}<Star size={20} aria-hidden="true" />{/snippet}

<main>
	<h1>Layout and navigation</h1>
	<p>
		Containers, tabs, rails, paged and split views of phase F7. Resize the window to see the
		navigation page and the master-detail page change layout.
	</p>

	<section aria-labelledby="containers">
		<h2 id="containers">Containers</h2>
		<div class="grid">
			<Section.Root>
				<Section.Header headline="Notifications">
					{#snippet actions()}<Button variant="text">Reset</Button>{/snippet}
				</Section.Header>
				<Section.Content>
					<TileList>
						<Tile title="Show previews" subtitle="On the lock screen" leading={star}>
							{#snippet trailing()}
								<Switch aria-label="Show previews" bind:checked={notifications} />
							{/snippet}
						</Tile>
						<Tile title="Sounds" subtitle="Default" onclick={() => {}} />
						<Tile title="Do not disturb" subtitle="Managed by the system" disabled />
					</TileList>
				</Section.Content>
			</Section.Root>
			<div class="stack">
				<BorderContainer class="padded">A bordered container.</BorderContainer>
				<BorderContainer class="padded" tint="var(--oito2-color-warning)">
					A container tinted with the warning color.
				</BorderContainer>
				<Watermark class="watermark">
					{#snippet watermark()}<Image size={96} />{/snippet}
					<p>Content over a faint watermark.</p>
				</Watermark>
			</div>
		</div>
	</section>

	<section aria-labelledby="info">
		<h2 id="info">Messages and status</h2>
		<div class="row">
			{#each infoTypes as type (type)}<InfoBadge {type} label={type} />{/each}
		</div>
		<div class="grid">
			{#each infoTypes as type (type)}
				<InfoBox
					{type}
					title={type}
					subtitle="A message of this kind, tinted by its type."
				/>
			{/each}
		</div>
	</section>

	<section aria-labelledby="selectable">
		<h2 id="selectable">Selectable surfaces</h2>
		<div class="row">
			{#each ['a', 'b', 'c'] as option (option)}
				<SelectableContainer selected={chosen === option} onclick={() => (chosen = option)}>
					Option {option.toUpperCase()}
				</SelectableContainer>
			{/each}
		</div>
		<div class="grid">
			<Banner title="Photos" subtitle="Browse your library" icon={star} onclick={() => {}} />
			<Banner
				title="Tinted banner"
				subtitle="With a light wash of color"
				tint="var(--oito2-color-success)"
				onclick={() => {}}
			/>
		</div>
	</section>

	<section aria-labelledby="expandable">
		<h2 id="expandable">Expandable and accordion</h2>
		<div class="grid">
			<Expandable.Root>
				<Expandable.Trigger>Advanced options</Expandable.Trigger>
				<Expandable.Content>
					{#snippet collapsed()}<p class="note">Three options hidden.</p>{/snippet}
					<p>Proxy, cache size and logging level.</p>
				</Expandable.Content>
			</Expandable.Root>
			<Accordion.Root defaultValue={['general']}>
				{#each ['general', 'privacy', 'about'] as item (item)}
					<Accordion.Item value={item}>
						<Accordion.Trigger headingLevel={3}>{item}</Accordion.Trigger>
						<Accordion.Content><p>Settings of the {item} section.</p></Accordion.Content
						>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>
	</section>

	<section aria-labelledby="tabs">
		<h2 id="tabs">Tabs</h2>
		{#each ['pill', 'subtle'] as const as variant (variant)}
			<Tabs.Root defaultValue="overview" {variant}>
				<Tabs.List aria-label="{variant} tabs">
					<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
					<Tabs.Trigger value="details">Details</Tabs.Trigger>
					<Tabs.Trigger value="history">History</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="overview" class="panel">The {variant} overview.</Tabs.Content>
				<Tabs.Content value="details" class="panel">The {variant} details.</Tabs.Content>
				<Tabs.Content value="history" class="panel">The {variant} history.</Tabs.Content>
			</Tabs.Root>
		{/each}
		<Tabs.Root defaultValue="general" orientation="vertical" class="vertical-tabs">
			<Tabs.List aria-label="Vertical tabs">
				<Tabs.Trigger value="general" icon={icon(Settings)}>General</Tabs.Trigger>
				<Tabs.Trigger value="alerts" icon={icon(Bell)}>Alerts</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="general" class="panel">General settings.</Tabs.Content>
			<Tabs.Content value="alerts" class="panel">Alert settings.</Tabs.Content>
		</Tabs.Root>
		<h3>In a header bar</h3>
		<Tabs.Root bind:value={view}>
			<HeaderBar>
				{#snippet tabs()}
					<Tabs.List aria-label="Library">
						<Tabs.Trigger value="photos">Photos</Tabs.Trigger>
						<Tabs.Trigger value="albums">Albums</Tabs.Trigger>
					</Tabs.List>
				{/snippet}
			</HeaderBar>
			<Tabs.Content value="photos" class="panel">All photos.</Tabs.Content>
			<Tabs.Content value="albums" class="panel">Your albums.</Tabs.Content>
		</Tabs.Root>
	</section>

	<section aria-labelledby="rail">
		<h2 id="rail">Navigation rail</h2>
		<div class="row">
			{#each railStyles as style (style)}
				<Button
					variant={railStyle === style ? 'tonal' : 'text'}
					onclick={() => (railStyle = style)}>{style}</Button
				>
			{/each}
		</div>
		<div class="frame short">
			<NavigationRail.Root {railStyle} bind:value={destination} aria-label="Rail sample">
				{#each destinations as item (item.value)}
					<NavigationRail.Item value={item.value} label={item.label} icon={item.icon} />
				{/each}
			</NavigationRail.Root>
			<div class="fill">Selected: {destination}</div>
		</div>
	</section>

	<section aria-labelledby="navigation-page">
		<h2 id="navigation-page">Navigation page</h2>
		<p class="note">
			Compact rail below 600 pixels, labels beside the icons from 900; a bottom bar on touch
			screens when narrow.
		</p>
		<div class="frame resizable">
			<NavigationPage.Root
				items={destinations}
				extendedBreakpoint={900}
				navigationLabel="Sample"
				class="fill"
			>
				{#each destinations as item (item.value)}
					<NavigationPage.Content value={item.value}>
						<div class="padded">{item.label} page</div>
					</NavigationPage.Content>
				{/each}
			</NavigationPage.Root>
		</div>
	</section>

	<section aria-labelledby="master-detail">
		<h2 id="master-detail">Master-detail</h2>
		<p class="note">Side by side from 620 pixels; resize the frame to see one at a time.</p>
		<div class="frame resizable">
			<MasterDetail.Root class="fill">
				<MasterDetail.Master>
					<MasterDetail.List aria-label="People">
						{#each people as person (person)}
							<MasterDetail.Tile
								value={person}
								title={person}
								subtitle="Team member"
							/>
						{/each}
					</MasterDetail.List>
				</MasterDetail.Master>
				<MasterDetail.Detail>
					{#snippet children(person)}
						<MasterDetail.DetailHeader title={person} />
						<div class="padded">Details of {person}.</div>
					{/snippet}
				</MasterDetail.Detail>
			</MasterDetail.Root>
		</div>
	</section>

	<section aria-labelledby="split">
		<h2 id="split">Paned view and splitter</h2>
		<div class="frame">
			<PanedView class="fill" minPageSize={200}>
				{#snippet pane()}<div class="padded">Pane</div>{/snippet}
				<div class="padded">Page</div>
			</PanedView>
		</div>
		<div class="frame">
			<Splitter.Root class="fill">
				<Splitter.Pane initialFraction={0.25} collapsible
					><div class="padded">Collapsible</div></Splitter.Pane
				>
				<Splitter.Pane><div class="padded">Middle</div></Splitter.Pane>
				<Splitter.Pane minSize={120}><div class="padded">End</div></Splitter.Pane>
			</Splitter.Root>
		</div>
	</section>

	<section aria-labelledby="paging">
		<h2 id="paging">Steps, pagination and pages</h2>
		<Steps.Root bind:current={step} onCurrentChange={() => {}}>
			<Steps.Item title="Account" description="Sign in">
				<p>Sign in to your account.</p>
			</Steps.Item>
			<Steps.Item title="Profile" description="Your details">
				<p>Tell us about yourself.</p>
			</Steps.Item>
			<Steps.Item title="Review"><p>Check everything.</p></Steps.Item>
			<div class="row"><Steps.Prev /><Steps.Next /></div>
		</Steps.Root>
		<Steps.Root defaultCurrent={1} orientation="vertical" linear={false}>
			<Steps.Item title="Download" description="Done" />
			<Steps.Item title="Install"><p>Installing…</p></Steps.Item>
			<Steps.Item title="Configure" error description="Needs attention" />
		</Steps.Root>
		<Pagination bind:page pageCount={20} bind:pageSize pageSizes={[10, 25, 50]} />
		<PageIndicator length={6} bind:page={dot} onPageChange={() => {}} />
		<Carousel.Root aria-label="Sample carousel" class="carousel">
			<Carousel.Viewport height={160}>
				{#each ['One', 'Two', 'Three', 'Four'] as name (name)}
					<Carousel.Item><div class="slide">Slide {name}</div></Carousel.Item>
				{/each}
				<Carousel.Prev />
				<Carousel.Next />
			</Carousel.Viewport>
			<Carousel.Indicators />
		</Carousel.Root>
	</section>

	<section aria-labelledby="toc">
		<h2 id="toc">Table of contents</h2>
		<div class="frame toc">
			<TableOfContents entries={sections} scrollContainer={tocView} aria-label="Contents" />
			<div class="toc-view" bind:this={tocView}>
				{#each sections as entry (entry.id)}
					<h3 id={entry.id}>{entry.title}</h3>
					<p>
						The {entry.title} section. Scroll this view to move the highlight in the list
						beside it.
					</p>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	h3,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--oito2-space-md);
	}

	.stack {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	.note {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-body-small);
	}

	.frame {
		display: flex;
		height: 280px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.frame.short {
		height: 260px;
	}

	.frame.resizable {
		height: 320px;
		min-width: 320px;
		max-width: 100%;
		resize: horizontal;
	}

	.frame :global(.fill),
	.fill {
		flex: 1;
		min-width: 0;
	}

	.fill {
		padding: var(--oito2-space-lg);
	}

	:global(.padded),
	.padded {
		padding: var(--oito2-space-lg);
	}

	:global(.watermark) {
		min-height: 140px;
		padding: var(--oito2-space-lg);
	}

	:global(.panel) {
		padding: var(--oito2-space-md);
	}

	:global(.vertical-tabs) {
		min-height: 120px;
	}

	:global(.carousel) {
		max-width: 520px;
	}

	.slide {
		display: grid;
		height: 100%;
		place-items: center;
		background: var(--oito2-color-surface-container);
		font: var(--oito2-type-title-large);
	}

	.toc {
		gap: var(--oito2-space-md);
	}

	.toc > :global(nav) {
		flex: none;
		width: 200px;
		padding: var(--oito2-space-md) 0;
	}

	.toc-view {
		flex: 1;
		padding: var(--oito2-space-md);
		overflow-y: auto;
	}

	.toc-view p {
		min-height: 180px;
	}
</style>
