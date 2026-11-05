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
	import { Button, CircularProgress, LinearProgress, Slider } from '@oito2/ui';

	const steps = [0, 0.25, 0.6, 1];

	let progress = $state(0.35);
	let download = $state<number | null>(null);
	let running = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;

	function percent(value: number) {
		return `${Math.round(value * 100)}%`;
	}

	function stop() {
		clearInterval(timer);
		timer = undefined;
		running = false;
	}

	function start() {
		stop();
		download = 0;
		running = true;
		timer = setInterval(() => {
			download = Math.min(1, (download ?? 0) + 0.05);
			if (download >= 1) stop();
		}, 150);
	}

	$effect(() => stop);
</script>

<main class="showcase-page">
	<p>
		<code>CircularProgress</code> and <code>LinearProgress</code> show the progress of a task.
		With a <code>value</code> from 0 to 1 they fill in proportion; without one they turn or
		slide while the work has no known end. Name them with <code>label</code>.
	</p>

	<section aria-labelledby="progress-circular">
		<h2 id="progress-circular">Circular</h2>
		<div class="row">
			{#each steps as value (value)}
				<CircularProgress {value} label="Circular, {percent(value)}" />
			{/each}
			<CircularProgress label="Loading" />
		</div>
	</section>

	<section aria-labelledby="progress-circular-size">
		<h2 id="progress-circular-size">Size and stroke</h2>
		<p><code>size</code> sets the diameter and <code>strokeWidth</code> the ring thickness.</p>
		<div class="row">
			<CircularProgress value={0.7} size={20} strokeWidth={3} label="Small, 70%" />
			<CircularProgress value={0.7} label="Default, 70%" />
			<CircularProgress value={0.7} size={56} strokeWidth={6} label="Large, 70%" />
			<CircularProgress size={56} strokeWidth={2} label="Large and thin, loading" />
		</div>
	</section>

	<section aria-labelledby="progress-linear">
		<h2 id="progress-linear">Linear</h2>
		<p>The bar takes the width of its container; <code>height</code> sets its thickness.</p>
		<div class="bars">
			{#each steps as value (value)}
				<LinearProgress {value} label="Linear, {percent(value)}" />
			{/each}
			<LinearProgress label="Loading" />
			<LinearProgress value={0.5} height={12} label="Thick, 50%" />
		</div>
	</section>

	<section aria-labelledby="progress-live">
		<h2 id="progress-live">Live value</h2>
		<div class="bars">
			<Slider label="Progress" bind:value={progress} valueText={percent} />
			<div class="row">
				<CircularProgress value={progress} label="Progress, circular" />
				<span>{percent(progress)}</span>
			</div>
			<LinearProgress value={progress} label="Progress, linear" />
		</div>
	</section>

	<section aria-labelledby="progress-task">
		<h2 id="progress-task">A running task</h2>
		<div class="bars">
			<div class="row">
				<Button variant="tonal" onclick={start} disabled={running}>
					{download === 1 ? 'Download again' : 'Start the download'}
				</Button>
				<span>
					{download === null
						? 'Not started.'
						: download < 1
							? `Downloading… ${percent(download)}`
							: 'Done.'}
				</span>
			</div>
			<LinearProgress value={download ?? 0} label="Download" />
		</div>
	</section>
</main>

<style>
	.bars {
		display: grid;
		gap: var(--oito2-space-md);
		max-width: 360px;
	}
</style>
