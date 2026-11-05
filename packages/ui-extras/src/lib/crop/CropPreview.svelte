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
  The current crop of a `CropController` at `width`, updated as the user zooms, pans,
  rotates and flips. It is hidden from assistive technologies.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CropController } from './crop-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLCanvasElement>, 'children'> {
		/** The controller whose crop is shown. */
		controller: CropController;
		/** The preview width in pixels; the height follows the crop box. Defaults to 96. */
		width?: number;
		/** Whether the preview is cut to a circle. */
		circle?: boolean;
		/** The element. */
		ref?: HTMLCanvasElement | null;
	}

	let {
		controller,
		width = 96,
		circle = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let box = $derived(controller.boxSize);
	let height = $derived(box.width > 0 ? (width * box.height) / box.width : width);

	// Paints the crop scaled to the preview size whenever it changes.
	$effect(() => {
		const element = ref;
		void controller.image;
		void controller.zoom;
		void controller.offset;
		void controller.quarterTurns;
		void controller.flipped;
		if (!element) return;
		const ratio = window.devicePixelRatio || 1;
		element.width = Math.round(width * ratio);
		element.height = Math.round(height * ratio);
		const context = element.getContext('2d');
		if (!context || box.width <= 0) return;
		context.setTransform((ratio * width) / box.width, 0, 0, (ratio * width) / box.width, 0, 0);
		controller.paintCrop(context);
	});
</script>

<canvas
	bind:this={ref}
	aria-hidden="true"
	class={['oito2-crop-preview', className]}
	data-circle={circle ? '' : undefined}
	style:width="{width}px"
	style:height="{height}px"
	{...rest}
></canvas>

<style>
	@layer oito2 {
		.oito2-crop-preview {
			display: block;
			border-radius: var(--oito2-radius-medium);
		}

		[data-circle] {
			border-radius: 50%;
		}
	}
</style>
