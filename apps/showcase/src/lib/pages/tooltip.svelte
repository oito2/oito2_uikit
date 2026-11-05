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
	import { Button, Switch, Tooltip } from '@oito2/ui';

	const placements = ['top', 'right', 'bottom', 'left'] as const;

	let pinned = $state(false);
	let silenced = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>Tooltip</code> shows a short label next to its trigger after the pointer rests on it,
		or at once when the trigger gets keyboard focus. Compose it with
		<code>Tooltip.Trigger</code>, which renders your element through <code>child</code>, and
		<code>Tooltip.Content</code>. Icon buttons already show their label as a tooltip.
	</p>

	<section aria-labelledby="tooltip-basic">
		<h2 id="tooltip-basic">On a button</h2>
		<div class="row">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button variant="outlined" {...props}>Hover or focus me</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Saves a copy in your downloads folder</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</section>

	<section aria-labelledby="tooltip-placement">
		<h2 id="tooltip-placement">Placement</h2>
		<p>
			The tooltip goes below its trigger by default; <code>placement</code> moves it and
			<code>offset</code> sets the gap.
		</p>
		<div class="row">
			{#each placements as placement (placement)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button variant="tonal" {...props}>{placement}</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content {placement} offset={8}
						>Placed at the {placement}</Tooltip.Content
					>
				</Tooltip.Root>
			{/each}
		</div>
	</section>

	<section aria-labelledby="tooltip-delay">
		<h2 id="tooltip-delay">Delay</h2>
		<p>
			<code>delay</code> is how long the pointer rests on the trigger before the tooltip shows;
			the default is 500 milliseconds.
		</p>
		<div class="row">
			{#each [0, 500, 1500] as delay (delay)}
				<Tooltip.Root {delay}>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button variant="text" {...props}>{delay} ms</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Shown after {delay} ms</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</section>

	<section aria-labelledby="tooltip-controlled">
		<h2 id="tooltip-controlled">Controlled and disabled</h2>
		<p>
			Bind <code>open</code> to show the tooltip from your code; <code>disabled</code> silences
			it.
		</p>
		<div class="row">
			<span class="labelled">
				<Switch id="tooltip-pin" bind:checked={pinned} />
				<label for="tooltip-pin">Show the tooltip</label>
			</span>
			<Tooltip.Root bind:open={pinned}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button variant="outlined" {...props}>Controlled</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content placement="right">Open while the switch is on</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<div class="row">
			<span class="labelled">
				<Switch id="tooltip-silence" bind:checked={silenced} />
				<label for="tooltip-silence">Disable the tooltip</label>
			</span>
			<Tooltip.Root disabled={silenced}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button variant="outlined" {...props}
							>{silenced ? 'Silent' : 'Talkative'}</Button
						>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Tooltips can be turned off</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</section>
</main>

<style>
	.labelled {
		display: inline-flex;
		align-items: center;
		gap: var(--oito2-space-sm);
	}
</style>
