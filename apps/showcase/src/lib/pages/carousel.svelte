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
	import { Button, Carousel, Switch } from '@oito2/ui';

	const slides = [
		{ name: 'Mountains', tone: 'primary' },
		{ name: 'Forest', tone: 'secondary' },
		{ name: 'Desert', tone: 'tertiary' },
		{ name: 'Coast', tone: 'primary' },
		{ name: 'Lakes', tone: 'secondary' }
	];

	let page = $state(0);
	let loop = $state(true);
</script>

{#snippet slide(name: string, tone: string)}
	<div class="slide {tone}">{name}</div>
{/snippet}

<main class="showcase-page">
	<p>
		A carousel shows a row of pages one at a time. The pages change with the previous and next
		buttons, the dots below, the Left and Right arrow keys while the carousel has focus, or a
		swipe, also with a mouse. <code>Carousel.Root</code> creates a
		<code>CarouselController</code> and shares it with its parts; an app drives it by binding
		<code>page</code>.
	</p>

	<section aria-labelledby="carousel-basic">
		<h2 id="carousel-basic">Buttons and indicators</h2>
		<Carousel.Root aria-label="Landscapes" class="carousel">
			<Carousel.Viewport height={200}>
				{#each slides as item (item.name)}
					<Carousel.Item>{@render slide(item.name, item.tone)}</Carousel.Item>
				{/each}
				<Carousel.Prev />
				<Carousel.Next />
			</Carousel.Viewport>
			<Carousel.Indicators />
		</Carousel.Root>
	</section>

	<section aria-labelledby="carousel-controlled">
		<h2 id="carousel-controlled">Controlled page</h2>
		<p>
			Setting the bound <code>page</code> scrolls to it. Without <code>loop</code> the buttons stop
			at both ends.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (page = 0)}>First</Button>
			<Button variant="tonal" onclick={() => (page = 2)}>Third</Button>
			<Button variant="tonal" onclick={() => (page = slides.length - 1)}>Last</Button>
			<Switch bind:checked={loop} aria-label="Loop" />
			<span>Loop</span>
		</div>
		<Carousel.Root aria-label="Controlled landscapes" bind:page {loop} class="carousel">
			<Carousel.Viewport height={200}>
				{#each slides as item (item.name)}
					<Carousel.Item>{@render slide(item.name, item.tone)}</Carousel.Item>
				{/each}
				<Carousel.Prev />
				<Carousel.Next />
			</Carousel.Viewport>
			<Carousel.Indicators />
		</Carousel.Root>
		<p>Page {page + 1} of {slides.length}: {slides[page]?.name}.</p>
	</section>

	<section aria-labelledby="carousel-auto">
		<h2 id="carousel-auto">Automatic scrolling</h2>
		<p>
			With <code>autoScroll</code> it advances every <code>interval</code> milliseconds. It
			pauses while the pointer is over it, something inside has focus or the window is hidden,
			and never moves when the system asks for reduced motion. <code>Carousel.PlayPause</code>
			stops and restarts it; bind <code>playing</code> to control it from outside.
		</p>
		<Carousel.Root
			aria-label="Automatic landscapes"
			autoScroll
			interval={2500}
			class="carousel"
		>
			<Carousel.Viewport height={160}>
				{#each slides as item (item.name)}
					<Carousel.Item>{@render slide(item.name, item.tone)}</Carousel.Item>
				{/each}
			</Carousel.Viewport>
			<Carousel.Indicators />
			<Carousel.PlayPause />
		</Carousel.Root>
	</section>
</main>

<style>
	.showcase-page :global(.carousel) {
		max-width: 560px;
	}

	.slide {
		display: grid;
		height: 100%;
		place-items: center;
		font: var(--oito2-type-headline-small);
	}

	.slide.primary {
		background: var(--oito2-color-primary-container);
		color: var(--oito2-color-on-primary-container);
	}

	.slide.secondary {
		background: var(--oito2-color-secondary-container);
		color: var(--oito2-color-on-secondary-container);
	}

	.slide.tertiary {
		background: var(--oito2-color-tertiary-container);
		color: var(--oito2-color-on-tertiary-container);
	}
</style>
