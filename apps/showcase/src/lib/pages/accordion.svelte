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
	import { Accordion, Button, ExpansionPanel } from '@oito2/ui';

	const settings = [
		{ value: 'general', title: 'General', text: 'Language, region and start-up behavior.' },
		{ value: 'privacy', title: 'Privacy', text: 'History, cookies and site permissions.' },
		{ value: 'about', title: 'About', text: 'Version 1.4.2, licensed under the GPL 3.0.' }
	];

	let single = $state<readonly string[]>(['general']);
	let multiple = $state<readonly string[]>(['general', 'privacy']);
	let lastChange = $state('none yet');
</script>

<main class="showcase-page">
	<p>
		An accordion is a stack of headed sections that open and close. By default one section is
		open at a time; with <code>multiple</code> any number of them can be. Each trigger is a
		heading with a button, so the sections are also reachable through the heading list of a
		screen reader. <code>ExpansionPanel</code> is the same component under its Material name.
	</p>

	<section aria-labelledby="accordion-single">
		<h2 id="accordion-single">One section at a time</h2>
		<Accordion.Root
			bind:value={single}
			onItemOpenChange={(value, open) =>
				(lastChange = `${value} ${open ? 'opened' : 'closed'}`)}
		>
			{#each settings as item (item.value)}
				<Accordion.Item value={item.value}>
					<Accordion.Trigger headingLevel={3}>{item.title}</Accordion.Trigger>
					<Accordion.Content><p>{item.text}</p></Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
		<p>Open: {single.join(', ') || 'none'}. Last change: {lastChange}.</p>
	</section>

	<section aria-labelledby="accordion-multiple">
		<h2 id="accordion-multiple">Several sections open</h2>
		<div class="row">
			<Button variant="tonal" onclick={() => (multiple = settings.map((item) => item.value))}>
				Expand all
			</Button>
			<Button variant="text" onclick={() => (multiple = [])}>Collapse all</Button>
		</div>
		<Accordion.Root multiple bind:value={multiple}>
			{#each settings as item (item.value)}
				<Accordion.Item value={item.value}>
					<!-- The titles differ from the first demo, so each section region has its own name. -->
					<Accordion.Trigger headingLevel={3}
						>{item.title} (several open)</Accordion.Trigger
					>
					<Accordion.Content><p>{item.text}</p></Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
		<p>Open: {multiple.join(', ') || 'none'}.</p>
	</section>

	<section aria-labelledby="accordion-options">
		<h2 id="accordion-options">Chevron at the start, no dividers, collapsed summary</h2>
		<p>
			The <code>collapsed</code> snippet of a content part shows while its section is closed, such
			as a summary of what it hides.
		</p>
		<Accordion.Root dividers={false} defaultValue={['network']}>
			<Accordion.Item value="network">
				<Accordion.Trigger headingLevel={3} iconPosition="start">Network</Accordion.Trigger>
				<Accordion.Content>
					{#snippet collapsed()}<p class="note">Proxy off, IPv6 on.</p>{/snippet}
					<p>Proxy server, IPv6 and DNS over HTTPS.</p>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="storage">
				<Accordion.Trigger headingLevel={3} iconPosition="start">Storage</Accordion.Trigger>
				<Accordion.Content>
					{#snippet collapsed()}<p class="note">1.2 GB used.</p>{/snippet}
					<p>Cache size, downloads folder and offline data.</p>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="sync" disabled>
				<Accordion.Trigger headingLevel={3} iconPosition="start">
					Sync (unavailable offline)
				</Accordion.Trigger>
				<Accordion.Content><p>Accounts and synced data.</p></Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>

	<section aria-labelledby="accordion-disabled">
		<h2 id="accordion-disabled">Disabled</h2>
		<Accordion.Root disabled defaultValue={['locked']}>
			<Accordion.Item value="locked">
				<Accordion.Trigger headingLevel={3}>Managed by your organization</Accordion.Trigger>
				<Accordion.Content><p>These settings can't be changed here.</p></Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="policies">
				<Accordion.Trigger headingLevel={3}>Policies</Accordion.Trigger>
				<Accordion.Content><p>Installed policies.</p></Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>

	<section aria-labelledby="accordion-expansion-panel">
		<h2 id="accordion-expansion-panel">As ExpansionPanel</h2>
		<ExpansionPanel.Root multiple>
			<ExpansionPanel.Item value="shipping">
				<ExpansionPanel.Trigger headingLevel={3}>Shipping</ExpansionPanel.Trigger>
				<ExpansionPanel.Content
					><p>Delivered in 3 to 5 business days.</p></ExpansionPanel.Content
				>
			</ExpansionPanel.Item>
			<ExpansionPanel.Item value="returns">
				<ExpansionPanel.Trigger headingLevel={3}>Returns</ExpansionPanel.Trigger>
				<ExpansionPanel.Content><p>Free returns within 30 days.</p></ExpansionPanel.Content>
			</ExpansionPanel.Item>
		</ExpansionPanel.Root>
	</section>
</main>
