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
  Panes side by side, or stacked when `orientation` is vertical, with a draggable divider
  between each two. A divider keeps both of its panes within their limits. From the
  keyboard a focused divider moves by `keyboardStep` with the arrow keys, Home and End
  take the pane before it to its smallest and largest size, and Enter or Space collapses
  or restores the collapsible pane next to it, as a double click does. Splitters nest.
  For a single resizable side pane, `PanedView` is simpler.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SplitterState, setSplitter } from '../splitter-state.svelte.js';
	import { setSplitterOptions } from './splitter-options.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the panes sit side by side or stacked. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** Called with the pane sizes, in pixels, after each change. */
		onSizesChange?: (sizes: readonly number[]) => void;
		/** How far one arrow key press moves a divider, in pixels. Defaults to 16. */
		keyboardStep?: number;
		/** The accessible name of the dividers. Defaults to "Resize pane". */
		resizeLabel?: string;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The `Splitter.Pane`s; two or more. */
		children?: Snippet;
	}

	let {
		orientation = 'horizontal',
		onSizesChange,
		keyboardStep = 16,
		resizeLabel,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const splitter = setSplitter(
		new SplitterState({
			orientation: () => orientation,
			onSizesChange: () => onSizesChange
		})
	);
	setSplitterOptions({
		get keyboardStep() {
			return keyboardStep;
		},
		get resizeLabel() {
			return resizeLabel;
		}
	});

	let width = $state(0);
	let height = $state(0);
	$effect.pre(() => {
		splitter.extent = orientation === 'horizontal' ? width : height;
	});
</script>

<div
	bind:this={ref}
	bind:clientWidth={width}
	bind:clientHeight={height}
	class={['oito2-splitter', className]}
	data-orientation={orientation}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-splitter {
			display: flex;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		[data-orientation='vertical'] {
			flex-direction: column;
		}
	}
</style>
