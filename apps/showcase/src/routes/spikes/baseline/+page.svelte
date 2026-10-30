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
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { runBaseline, type FeatureCheck } from '#lib/spikes/baseline.js';
	import { spikeReport } from '#lib/spikes/bridge.js';

	let checks = $state<FeatureCheck[]>([]);
	let missing = $derived(checks.filter((check) => !check.supported).length);
	// Machine-readable report for headless runners, available once the checks finish.
	let report = $derived(
		checks.length > 0 ? JSON.stringify({ userAgent: navigator.userAgent, checks }) : undefined
	);

	onMount(async () => {
		checks = await runBaseline();
		if (page.url.searchParams.has('report')) {
			await spikeReport({ userAgent: navigator.userAgent, checks });
		}
	});
</script>

<main data-report={report}>
	<h1>Baseline</h1>
	<p class="agent">{navigator.userAgent}</p>
	{#if checks.length === 0}
		<p>Running checks…</p>
	{:else}
		<p>{checks.length - missing} of {checks.length} supported.</p>
		<table>
			<thead>
				<tr><th>Group</th><th>Feature</th><th>Supported</th><th>Detail</th></tr>
			</thead>
			<tbody>
				{#each checks as check (check.name)}
					<tr class:missing={!check.supported}>
						<td>{check.group}</td>
						<td>{check.name}</td>
						<td>{check.supported ? 'yes' : 'no'}</td>
						<td>{check.detail ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>

<style>
	main {
		padding: 20px;
	}

	.agent {
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
	}

	table {
		border-collapse: collapse;
	}

	th,
	td {
		padding: 4px 12px;
		border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		text-align: left;
	}

	.missing {
		color: #c01c28;
	}
</style>
