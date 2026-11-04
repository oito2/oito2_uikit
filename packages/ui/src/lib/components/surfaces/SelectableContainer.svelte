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
  A container that can be selected, such as an option in a grid of choices. Selection
  shows as a tinted background with a 2-pixel border in the text-safe primary tone. With
  `onclick` it is a toggle button (`aria-pressed`).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import InteractiveSurface from './InteractiveSurface.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Whether the container is selected. */
		selected?: boolean;
		/** Whether the container can't be used. */
		disabled?: boolean;
		/** A CSS color for the selected tint. Defaults to the primary color at 12%. */
		selectionColor?: string;
		/** The container element. */
		ref?: HTMLElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		selected = false,
		disabled = false,
		selectionColor,
		ref = $bindable(null),
		style,
		children,
		...rest
	}: Props = $props();
</script>

<InteractiveSurface
	bind:ref
	kind="selectable"
	{selected}
	{disabled}
	style={[selectionColor ? `--oito2-surface-selection: ${selectionColor}` : '', style]
		.filter(Boolean)
		.join('; ') || undefined}
	{...rest}
>
	{@render children?.()}
</InteractiveSurface>
