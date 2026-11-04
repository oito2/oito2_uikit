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
  A page of a `Carousel.Viewport`, as wide as the viewport, announced as "slide 2 of 5".
-->
<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../../l10n/locale.js';
	import { useCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The page element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const carousel = useCarousel();
	const locale = useLocale();
	const slide = carousel.register();
	onDestroy(() => carousel.unregister(slide));
	let index = $derived(carousel.indexOf(slide));
	let current = $derived(index === carousel.page);
</script>

<div
	bind:this={ref}
	role="group"
	aria-roledescription="slide"
	aria-label={locale.strings.partOf(index + 1, carousel.count)}
	aria-hidden={current ? undefined : 'true'}
	inert={!current}
	class={['oito2-carousel-item', className]}
	data-oito2-carousel-slide=""
	data-state={current ? 'active' : 'inactive'}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-carousel-item {
			flex: 0 0 100%;
			min-width: 0;
			height: 100%;
			overflow: hidden;
			scroll-snap-align: start;
			scroll-snap-stop: always;
		}
	}
</style>
