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
  A decorative square that stands in for a missing picture, such as an album cover or an
  app icon that has not loaded: a rounded square in a container tone with a picture
  outline in its center. It is hidden from assistive technologies.
-->
<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
		/** The width and height in pixels. Defaults to 48. */
		size?: number;
		/** The corner radius: a radius token (`small`, `medium`, `large`) or a number of pixels. Defaults to `medium`. */
		radius?: 'none' | 'small' | 'medium' | 'large' | number;
		/** The element. */
		ref?: SVGSVGElement | null;
	}

	let {
		size = 48,
		radius = 'medium',
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let corner = $derived(
		typeof radius === 'number'
			? `${radius}px`
			: radius === 'none'
				? '0'
				: `var(--oito2-radius-${radius})`
	);
</script>

<svg
	bind:this={ref}
	viewBox="0 0 48 48"
	width={size}
	height={size}
	aria-hidden="true"
	class={['oito2-placeholder-icon', className]}
	style:border-radius={corner}
	{...rest}
>
	<g transform="translate(12 12)" class="ink">
		<path
			fill-rule="evenodd"
			d="M5 3H19A3 3 0 0 1 22 6V18A3 3 0 0 1 19 21H5A3 3 0 0 1 2 18V6A3 3 0 0 1 5 3ZM5.5 5H18.5A1.5 1.5 0 0 1 20 6.5V17.5A1.5 1.5 0 0 1 18.5 19H5.5A1.5 1.5 0 0 1 4 17.5V6.5A1.5 1.5 0 0 1 5.5 5Z"
		/>
		<circle cx="8.5" cy="9.5" r="1.75" />
		<path d="M4 19L10 12.5L13.5 16L16 13.5L20 17.5V19Z" />
	</g>
</svg>

<style>
	@layer oito2 {
		.oito2-placeholder-icon {
			display: block;
			flex: none;
			background: var(--oito2-color-surface-container-highest);
		}

		.ink {
			fill: color-mix(in srgb, var(--oito2-color-on-surface-variant) 55%, transparent);
		}
	}
</style>
