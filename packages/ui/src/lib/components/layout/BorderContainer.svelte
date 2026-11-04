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
  A container with a thin `outline-variant` border, the large radius and the surface as
  background. `tint` washes it with a color instead: a border in that color over a fill
  of it at `tintOpacity`, such as a status color for a highlighted note.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** A CSS color the container is tinted with; replaces the background and the border. */
		tint?: string;
		/** The opacity of the tinted fill, from 0 to 1. Defaults to 0.1. */
		tintOpacity?: number;
		/** The container element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		tint,
		tintOpacity = 0.1,
		ref = $bindable(null),
		class: className,
		style,
		children,
		...rest
	}: Props = $props();

	let tintStyle = $derived(
		tint === undefined
			? undefined
			: `--oito2-border-container-tint: ${tint}; --oito2-border-container-tint-opacity: ${Math.min(1, Math.max(0, tintOpacity)) * 100}%`
	);
</script>

<div
	bind:this={ref}
	class={['oito2-border-container', className]}
	data-tinted={tint === undefined ? undefined : ''}
	style={[tintStyle, style].filter(Boolean).join('; ') || undefined}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-border-container {
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
		}

		[data-tinted] {
			border-color: var(--oito2-border-container-tint);
			background: color-mix(
				in srgb,
				var(--oito2-border-container-tint) var(--oito2-border-container-tint-opacity),
				transparent
			);
		}
	}
</style>
