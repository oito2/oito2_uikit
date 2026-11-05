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
	import { Marquee, Slider } from '@oito2/ui';

	const headline =
		'Breaking: the oito2 design system now runs on Svelte 5 and Tauri v2, on Linux, Windows and macOS.';
	const builds = [
		'Build 128 passed',
		'Deploy to Pages done',
		'3 new issues',
		'Release 0.1.0 tagged',
		'Goldens updated'
	];

	let speed = $state(40);
</script>

<main class="showcase-page">
	<p>
		<code>Marquee</code> scrolls its content continuously when it is longer than the space it has,
		such as a news ticker or a long song title. It stops while the pointer is on it, stays still when
		the user prefers reduced motion, and leaves content that fits in place. Assistive technologies
		read the content once.
	</p>

	<section aria-labelledby="marquee-basic">
		<h2 id="marquee-basic">Ticker</h2>
		<div class="marquee-box"><Marquee {speed}>{headline}</Marquee></div>
		<div class="marquee-box marquee-short"><Marquee>Fits, so it stays still.</Marquee></div>
		<div class="row">
			<Slider
				bind:value={speed}
				min={10}
				max={160}
				divisions={15}
				label="Speed (pixels per second)"
			/>
		</div>
	</section>

	<section aria-labelledby="marquee-options">
		<h2 id="marquee-options">Direction, gap and edges</h2>
		<div class="column">
			<span class="note">Reversed, with a 96-pixel gap</span>
			<div class="marquee-box">
				<Marquee reverse gap={96}>
					{#each builds as build (build)}<span class="marquee-chip">{build}</span>{/each}
				</Marquee>
			</div>
			<span class="note">Without faded edges, and it keeps moving under the pointer</span>
			<div class="marquee-box">
				<Marquee fadeEdges={false} pauseOnHover={false}>{headline}</Marquee>
			</div>
			<span class="note">Wide fade</span>
			<div class="marquee-box">
				<Marquee fadeExtent={64}>{headline}</Marquee>
			</div>
		</div>
	</section>

	<section aria-labelledby="marquee-vertical">
		<h2 id="marquee-vertical">Vertical</h2>
		<p>A vertical marquee moves up and needs a height.</p>
		<div class="marquee-box marquee-tall">
			<Marquee orientation="vertical" speed={24}>
				<span class="marquee-stack">
					{#each builds as build (build)}<span>{build}</span>{/each}
				</span>
			</Marquee>
		</div>
	</section>
</main>

<style>
	.marquee-box {
		width: min(480px, 100%);
		padding: var(--oito2-space-sm);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.marquee-short {
		width: min(320px, 100%);
	}

	.marquee-tall {
		width: 240px;
		height: 120px;
	}

	.marquee-tall > :global(.oito2-marquee) {
		height: 100%;
	}

	.marquee-chip {
		display: inline-block;
		margin-inline-end: var(--oito2-space-md);
		padding: 0 var(--oito2-space-sm);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-secondary-container);
		color: var(--oito2-color-on-secondary-container);
		white-space: nowrap;
	}

	.marquee-stack {
		display: grid;
		gap: var(--oito2-space-sm);
	}
</style>
