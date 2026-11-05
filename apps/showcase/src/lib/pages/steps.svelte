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
	import { Steps, Switch } from '@oito2/ui';

	const checkout = ['Account', 'Shipping', 'Payment', 'Review'];

	let current = $state(1);
	let setup = $state(1);
	let paymentFailed = $state(true);
	let nextLabel = $derived(current >= checkout.length - 1 ? 'Place order' : 'Continue');
</script>

<main class="showcase-page">
	<p>
		Steps show progress through a sequence, such as a checkout or a setup wizard. The steps
		before <code>current</code> are completed and the content of the current one shows. With
		<code>interactive</code> (or <code>onCurrentChange</code>) a step header moves to its step;
		with <code>linear</code> only the completed steps and the current one can be reached.
	</p>

	<section aria-labelledby="steps-wizard">
		<h2 id="steps-wizard">A linear wizard</h2>
		<Steps.Root bind:current interactive>
			{#each checkout as title, index (title)}
				<Steps.Item {title} description="Step {index + 1}">
					<p>The {title.toLowerCase()} form goes here.</p>
				</Steps.Item>
			{/each}
			<div class="row">
				<Steps.Prev />
				<Steps.Next>{nextLabel}</Steps.Next>
			</div>
		</Steps.Root>
		<p>
			{current < checkout.length
				? `Current step: ${checkout[current]}.`
				: 'Every step is done.'}
		</p>
	</section>

	<section aria-labelledby="steps-vertical">
		<h2 id="steps-vertical">Vertical, free order</h2>
		<p>
			In a column the content sits under the current step. With <code>linear</code> off any step
			can be picked.
		</p>
		<Steps.Root bind:current={setup} orientation="vertical" linear={false} interactive>
			<Steps.Item title="Download" description="420 MB">
				<p>Downloading the installer.</p>
			</Steps.Item>
			<Steps.Item title="Install" description="About two minutes">
				<p>Copying files.</p>
			</Steps.Item>
			<Steps.Item title="Configure" description="Optional">
				<p>Choose a theme and your default folders.</p>
			</Steps.Item>
		</Steps.Root>
	</section>

	<section aria-labelledby="steps-error">
		<h2 id="steps-error">Error</h2>
		<p>With <code>error</code> a step shows a cross and is announced as failed.</p>
		<div class="row">
			<Switch bind:checked={paymentFailed} aria-label="Payment failed" />
			<span>Payment failed</span>
		</div>
		<Steps.Root defaultCurrent={2}>
			<Steps.Item title="Cart" description="3 items" />
			<Steps.Item title="Shipping" description="Express" />
			<Steps.Item
				title="Payment"
				description={paymentFailed ? 'Card declined' : 'Card ending in 4242'}
				error={paymentFailed}
			/>
			<Steps.Item title="Done" />
		</Steps.Root>
	</section>
</main>
