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
	import { Button, TimerController, TimerText } from '@oito2/ui';
	import { onDestroy } from 'svelte';

	let laps = $state<number[]>([]);
	let finished = $state(false);
	let ticks = $state(0);

	const stopwatch = new TimerController({ interval: 100 });
	const countdown = new TimerController({
		countdown: 10_000,
		interval: 100,
		onComplete: () => (finished = true)
	});
	const pomodoro = new TimerController({
		countdown: 25 * 60_000,
		onTick: () => ticks++
	});

	onDestroy(() => {
		stopwatch.dispose();
		countdown.dispose();
		pomodoro.dispose();
	});

	/** Formats `ms` milliseconds as seconds with tenths. */
	function seconds(ms: number): string {
		return `${(ms / 1000).toFixed(1)} s`;
	}
</script>

<main class="showcase-page">
	<p>
		<code>TimerController</code> is a stopwatch, or a countdown when <code>countdown</code> is
		set, that ticks every <code>interval</code> while it runs. Time is measured from the clock,
		so it stays exact however late the ticks arrive. <code>TimerText</code> shows the remaining time
		of a countdown or the elapsed time of a stopwatch, in tabular figures so the digits don't shift,
		with tenths when asked.
	</p>

	<section aria-labelledby="timer-stopwatch">
		<h2 id="timer-stopwatch">Stopwatch</h2>
		<div class="row">
			<span class="timer-time"><TimerText controller={stopwatch} tenths /></span>
			<Button onclick={() => (stopwatch.isRunning ? stopwatch.pause() : stopwatch.start())}
				>{stopwatch.isRunning ? 'Pause' : 'Start'}</Button
			>
			<Button
				variant="tonal"
				disabled={!stopwatch.isRunning}
				onclick={() => (laps = [...laps, stopwatch.elapsed])}>Lap</Button
			>
			<Button
				variant="text"
				onclick={() => {
					stopwatch.reset();
					laps = [];
				}}>Reset</Button
			>
		</div>
		{#if laps.length > 0}
			<ol class="timer-laps">
				{#each laps as lap, index (index)}<li>{seconds(lap)}</li>{/each}
			</ol>
		{/if}
	</section>

	<section aria-labelledby="timer-countdown">
		<h2 id="timer-countdown">Countdown</h2>
		<p>A countdown stops by itself at zero and calls <code>onComplete</code>.</p>
		<div class="row">
			<span class="timer-time"><TimerText controller={countdown} tenths /></span>
			<Button
				onclick={() => {
					finished = false;
					countdown.restart();
				}}>Count down 10 s</Button
			>
			<Button variant="text" disabled={!countdown.isRunning} onclick={() => countdown.pause()}
				>Pause</Button
			>
			<span role="status">{finished ? 'Time is up' : ''}</span>
		</div>
		<p class="note">
			Remaining: {seconds(countdown.remaining ?? 0)} · Completed: {countdown.isCompleted
				? 'yes'
				: 'no'}
		</p>
	</section>

	<section aria-labelledby="timer-long">
		<h2 id="timer-long">Long countdown</h2>
		<p>
			Twenty-five minutes, ticking once a second (the default interval); <code>onTick</code>
			counts the ticks.
		</p>
		<div class="row">
			<span class="timer-time"><TimerText controller={pomodoro} /></span>
			<Button onclick={() => (pomodoro.isRunning ? pomodoro.pause() : pomodoro.start())}
				>{pomodoro.isRunning ? 'Pause' : 'Start'}</Button
			>
			<Button variant="text" onclick={() => pomodoro.reset()}>Reset</Button>
			<span class="note">{ticks} ticks</span>
		</div>
	</section>
</main>

<style>
	.timer-time {
		min-width: 96px;
		font: var(--oito2-type-title-large);
	}

	.timer-laps {
		margin: 0;
		color: var(--oito2-color-on-surface-variant);
	}
</style>
