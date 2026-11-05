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
	import { AnimatedIcon, Button, animatedIcons, type AnimatedIconName } from '@oito2/ui';

	const names = Object.keys(animatedIcons) as AnimatedIconName[];
	const colors = [
		'var(--oito2-color-primary-text)',
		'var(--oito2-color-success)',
		'var(--oito2-color-warning)',
		'var(--oito2-color-error-text)'
	];

	let replay = $state(0);
	let liked = $state(false);
	let starred = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>AnimatedIcon</code> draws one of the <code>animatedIcons</code> in SVG and plays it
		once, on repeat or not at all. The icons follow the stroke style of the Lucide icons on a
		24-pixel grid; the <code>Filled</code> variants cut their inner mark out of the fill. When
		the user prefers reduced motion the icon shows its final frame. Without a <code>label</code> it
		is decorative and hidden from assistive technologies.
	</p>

	<section aria-labelledby="animated-icon-all">
		<h2 id="animated-icon-all">Every icon</h2>
		<div class="row">
			{#key replay}
				{#each names as name (name)}
					<span class="animated-icon-cell">
						<AnimatedIcon data={animatedIcons[name]} size={32} label={name} />
						<code>{name}</code>
					</span>
				{/each}
			{/key}
		</div>
		<div class="row">
			<Button variant="text" onclick={() => replay++}>Play again</Button>
		</div>
	</section>

	<section aria-labelledby="animated-icon-modes">
		<h2 id="animated-icon-modes">Modes, colors and duration</h2>
		<div class="row">
			<span class="animated-icon-cell">
				<AnimatedIcon
					data={animatedIcons.compass}
					mode="repeat"
					size={40}
					label="Searching"
				/>
				<span class="note">repeat</span>
			</span>
			<span class="animated-icon-cell">
				<AnimatedIcon
					data={animatedIcons.compass}
					mode="repeat"
					duration={4000}
					size={40}
					label="Searching slowly"
				/>
				<span class="note">repeat, 4 s</span>
			</span>
			<span class="animated-icon-cell">
				<AnimatedIcon data={animatedIcons.compass} mode="still" size={40} label="Compass" />
				<span class="note">still</span>
			</span>
			{#each colors as color (color)}
				<span class="animated-icon-cell">
					<AnimatedIcon data={animatedIcons.starFilled} mode="repeat" {color} size={40} />
				</span>
			{/each}
		</div>
	</section>

	<section aria-labelledby="animated-icon-toggles">
		<h2 id="animated-icon-toggles">In toggles</h2>
		<p>Changing the icon plays the new one, so a toggle animates as it turns on.</p>
		<div class="row">
			<Button variant="outlined" aria-pressed={liked} onclick={() => (liked = !liked)}>
				{#key liked}
					<AnimatedIcon
						data={liked ? animatedIcons.heartFilled : animatedIcons.heart}
						color={liked ? 'var(--oito2-color-error-text)' : undefined}
					/>
				{/key}
				Like
			</Button>
			<Button variant="outlined" aria-pressed={starred} onclick={() => (starred = !starred)}>
				{#key starred}
					<AnimatedIcon data={starred ? animatedIcons.starFilled : animatedIcons.star} />
				{/key}
				Star
			</Button>
		</div>
	</section>
</main>

<style>
	.animated-icon-cell {
		display: inline-grid;
		justify-items: center;
		gap: var(--oito2-space-xs);
		min-width: 88px;
	}
</style>
