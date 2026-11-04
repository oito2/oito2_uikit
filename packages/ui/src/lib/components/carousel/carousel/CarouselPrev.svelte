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
  The button of a carousel that shows the previous page, at the start side over the
  pages. Place it inside `Carousel.Viewport`.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CarouselButton from './CarouselButton.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The accessible name. Defaults to "Previous page". */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { ref = $bindable(null), ...rest }: Props = $props();
</script>

<CarouselButton bind:ref direction="previous" {...rest} />
