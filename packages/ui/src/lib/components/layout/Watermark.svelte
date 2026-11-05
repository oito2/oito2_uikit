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
  Places a faint `watermark` behind the content, for example a large icon in an empty
  page. The watermark is hidden from assistive technologies and ignores the pointer. It
  covers the area the content takes; give the element a size to watermark a whole page.
-->
<script lang="ts" module>
	/** Where a watermark sits, along each axis. */
	export type WatermarkAlignment = 'start' | 'center' | 'end';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The decorative content. */
		watermark: Snippet;
		/** The horizontal position of the watermark, following the text direction. Defaults to `end`. */
		alignX?: WatermarkAlignment;
		/** The vertical position of the watermark. Defaults to `center`. */
		alignY?: WatermarkAlignment;
		/** The watermark opacity, from 0 to 1. Defaults to 0.1. */
		opacity?: number;
		/** The element. */
		ref?: HTMLDivElement | null;
		/** The content drawn over the watermark. */
		children?: Snippet;
	}

	let {
		watermark,
		alignX = 'end',
		alignY = 'center',
		opacity = 0.1,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class={['oito2-watermark', className]} {...rest}>
	<div
		class="mark"
		aria-hidden="true"
		data-align-x={alignX}
		data-align-y={alignY}
		style:opacity={Math.min(1, Math.max(0, opacity))}
	>
		{@render watermark()}
	</div>
	<div class="content">{@render children?.()}</div>
</div>

<style>
	@layer oito2 {
		.oito2-watermark {
			position: relative;
			display: grid;
		}

		.mark {
			position: absolute;
			inset: 0;
			display: flex;
			padding: var(--oito2-space-page);
			overflow: hidden;
			pointer-events: none;
			user-select: none;
		}

		[data-align-x='start'] {
			justify-content: flex-start;
		}

		[data-align-x='center'] {
			justify-content: center;
		}

		[data-align-x='end'] {
			justify-content: flex-end;
		}

		[data-align-y='start'] {
			align-items: flex-start;
		}

		[data-align-y='center'] {
			align-items: center;
		}

		[data-align-y='end'] {
			align-items: flex-end;
		}

		.content {
			position: relative;
			min-width: 0;
		}
	}
</style>
