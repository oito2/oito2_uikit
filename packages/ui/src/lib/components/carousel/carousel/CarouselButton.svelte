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
  Internal: a previous or next button of a carousel, on a translucent pill over the
  pages. Its chevron follows the text direction.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../../l10n/locale.js';
	import { materialStrings } from '../../../l10n/material.js';
	import IconButton from '../../button/IconButton.svelte';
	import type { IconComponent } from '../../icon.js';
	import { useCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** Which way the button moves. */
		direction: 'previous' | 'next';
		/** The accessible name. Defaults to "Previous page" or "Next page". */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		direction,
		label,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const carousel = useCarousel();
	const locale = useLocale();
	let previous = $derived(direction === 'previous');
	let strings = $derived(materialStrings(locale.locale));
</script>

<span class={['oito2-carousel-button', className]} data-direction={direction}>
	<IconButton
		bind:ref
		icon={(previous ? ChevronLeft : ChevronRight) as IconComponent}
		label={label ?? (previous ? strings.previousPage : strings.nextPage)}
		disabled={disabled || !(previous ? carousel.canGoBack : carousel.canGoForward)}
		onclick={() => carousel.step(previous ? -1 : 1)}
		{...rest}
	/>
</span>

<style>
	@layer oito2 {
		.oito2-carousel-button {
			position: absolute;
			top: 50%;
			z-index: 1;
			display: inline-flex;
			border-radius: var(--oito2-radius-medium);
			background: color-mix(
				in srgb,
				var(--oito2-color-surface-container-highest) 85%,
				transparent
			);
			translate: 0 -50%;
		}

		[data-direction='previous'] {
			inset-inline-start: var(--oito2-space-sm);
		}

		[data-direction='next'] {
			inset-inline-end: var(--oito2-space-sm);
		}

		.oito2-carousel-button:dir(rtl) :global(svg) {
			scale: -1 1;
		}
	}
</style>
