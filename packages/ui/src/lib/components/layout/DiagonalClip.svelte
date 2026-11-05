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
  Clips its content along a diagonal, keeping the triangle on the side of `corner`. Place
  two of them on top of each other to split an area diagonally, for example to preview
  light and dark themes in one swatch.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** The corner whose triangle a `DiagonalClip` keeps. */
	type DiagonalCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The corner whose triangle is kept, cut by the diagonal between its two neighbors. */
		corner: DiagonalCorner;
		/** The clipped content. */
		children?: Snippet;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let { corner, children, ref = $bindable(null), class: className, ...rest }: Props = $props();

	const polygons: Record<DiagonalCorner, string> = {
		'top-left': 'polygon(0 0, 100% 0, 0 100%)',
		'top-right': 'polygon(0 0, 100% 0, 100% 100%)',
		'bottom-left': 'polygon(0 0, 100% 100%, 0 100%)',
		'bottom-right': 'polygon(100% 0, 100% 100%, 0 100%)'
	};
</script>

<div
	bind:this={ref}
	class={['oito2-diagonal-clip', className]}
	data-corner={corner}
	style:clip-path={polygons[corner]}
	{...rest}
>
	{@render children?.()}
</div>
