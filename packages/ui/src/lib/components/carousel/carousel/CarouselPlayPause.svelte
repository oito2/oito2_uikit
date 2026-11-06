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
  The button that stops and restarts the automatic rotation of a carousel with
  `autoScroll`, turning its `playing` off and on. It renders nothing without `autoScroll`.
  Place it outside `Carousel.Viewport`, such as next to `Carousel.Indicators`.
-->
<script lang="ts">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { mergeProps } from '../../../internal/merge-props.js';
	import { useLocale } from '../../../l10n/locale.js';
	import IconButton from '../../button/IconButton.svelte';
	import type { IconComponent } from '../../icon.js';
	import { useCarousel } from '../carousel-controller.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The accessible name while rotating. Defaults to "Pause automatic rotation". */
		pauseLabel?: string;
		/** The accessible name while stopped. Defaults to "Start automatic rotation". */
		playLabel?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { pauseLabel, playLabel, ref = $bindable(null), ...rest }: Props = $props();

	const carousel = useCarousel();
	const locale = useLocale();
</script>

{#if carousel.autoScroll}
	<IconButton
		bind:ref
		{...mergeProps(rest, {
			class: 'oito2-carousel-play-pause',
			onclick: () => (carousel.playing = !carousel.playing)
		})}
		icon={(carousel.playing ? Pause : Play) as IconComponent}
		label={carousel.playing
			? (pauseLabel ?? locale.strings.pauseRotation)
			: (playLabel ?? locale.strings.startRotation)}
	/>
{/if}
