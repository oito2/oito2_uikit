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

<!--
  @component
  The dots of a carousel, below the pages: a `PageIndicator` that fits the width and moves
  to the page of the activated dot. Hidden with fewer than two pages.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PageIndicator from '../../navigation/PageIndicator.svelte';
	import { useCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The indicator element. */
		ref?: HTMLDivElement | null;
	}

	let { ref = $bindable(null), ...rest }: Props = $props();

	const carousel = useCarousel();
</script>

{#if carousel.count > 1}
	<PageIndicator
		bind:ref
		length={carousel.count}
		page={carousel.page}
		layout="bounded"
		onPageChange={(page) => carousel.goTo(page)}
		{...rest}
	/>
{/if}
