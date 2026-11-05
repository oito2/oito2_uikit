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
	import { Rating } from '@oito2/ui';

	let whole = $state(3);
	let half = $state(3.5);
	let score = $state(7);
	let changes = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>Rating</code> is a row of stars showing <code>value</code>, which the user changes by
		clicking or with the keyboard. Hovering previews the value under the pointer, and a star
		pops when it fills. The arrow keys change it by one step, Home and End jump to 0 and the
		maximum, and the digit keys pick that whole value.
	</p>

	<section aria-labelledby="rating-basic">
		<h2 id="rating-basic">Whole and half stars</h2>
		<p>
			With <code>allowHalf</code> the value moves in halves: the start half of a star gives
			the half value. <code>onValueChange</code> reports each change.
		</p>
		<div class="row">
			<Rating
				bind:value={whole}
				onValueChange={() => changes++}
				aria-label="Rating in whole stars"
			/>
			<span class="note">{whole} of 5</span>
		</div>
		<div class="row">
			<Rating bind:value={half} allowHalf aria-label="Rating in half stars" />
			<span class="note">{half} of 5</span>
		</div>
		<p class="note">Changes of the first rating: {changes}</p>
	</section>

	<section aria-labelledby="rating-max">
		<h2 id="rating-max">Maximum, size and color</h2>
		<p>
			<code>max</code> sets the number of stars, 5 by default; <code>size</code> sets the star
			size in pixels and <code>color</code> the fill.
		</p>
		<div class="row">
			<Rating bind:value={score} max={10} size={20} aria-label="Score out of ten" />
			<span class="note">{score} of 10</span>
		</div>
		<div class="row">
			<Rating value={4} size={32} color="#e62d42" aria-label="Red rating" />
			<Rating
				value={2}
				size={16}
				color="var(--oito2-color-primary)"
				aria-label="Small rating"
			/>
		</div>
	</section>

	<section aria-labelledby="rating-states">
		<h2 id="rating-states">Read-only and disabled</h2>
		<p>
			A read-only or disabled rating is an image named by its value, such as an average score;
			it ignores the pointer and the keyboard.
		</p>
		<div class="row">
			<Rating value={4.5} readonly />
			<Rating value={2} disabled />
		</div>
	</section>
</main>
