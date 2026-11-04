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
  A pane of a `Splitter.Root`, with a divider after it unless it is the last one. Its
  size starts at `initialFraction` of the space (the panes without one share the rest)
  and stays between `minSize` and `maxSize`. A `collapsible` pane collapses to
  `collapsedSize` from the divider next to it.
-->
<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ResizeHandle from '../../../internal/ResizeHandle.svelte';
	import { directionOf } from '../../../internal/keyboard.js';
	import { useLocale } from '../../../l10n/locale.js';
	import { useSplitter } from '../splitter-state.svelte.js';
	import { useSplitterOptions } from './splitter-options.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The share of the space at start, from 0 to 1. */
		initialFraction?: number;
		/** The smallest size, in pixels. Defaults to 48. */
		minSize?: number;
		/** The largest size, in pixels. Defaults to no limit. */
		maxSize?: number;
		/** Whether the pane can collapse to `collapsedSize`. */
		collapsible?: boolean;
		/** The size of the collapsed pane, in pixels. Defaults to 0. */
		collapsedSize?: number;
		/** Whether the pane starts collapsed; needs `collapsible`. */
		defaultCollapsed?: boolean;
		/** The pane element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		initialFraction,
		minSize = 48,
		maxSize = Number.POSITIVE_INFINITY,
		collapsible = false,
		collapsedSize = 0,
		defaultCollapsed = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const splitter = useSplitter();
	const options = useSplitterOptions();
	const locale = useLocale();
	const pane = splitter.register(
		() => ({ initialFraction, minSize, maxSize, collapsible, collapsedSize }),
		// The initial state is read once, at registration.
		untrack(() => collapsible && defaultCollapsed)
	);
	onDestroy(() => splitter.unregister(pane));

	let index = $derived(splitter.indexOf(pane));
	let size = $derived(splitter.size(index));
	let horizontal = $derived(splitter.orientation === 'horizontal');
	let hidden = $derived(splitter.collapsed(index) && collapsedSize === 0);
	let last = $derived(index === splitter.count - 1);
	let divider = $state<HTMLDivElement | null>(null);

	/** Formats a size as its share of the space. */
	const share = (value: number) =>
		`${splitter.available <= 0 ? 0 : Math.round((value / splitter.available) * 100)}%`;

	/** Home and End take this pane to its smallest and largest size. */
	function onKey(event: KeyboardEvent): boolean {
		const current = splitter.size(index) ?? 0;
		if (event.key === 'Home') splitter.move(index, splitter.min(index) - current);
		else if (event.key === 'End')
			splitter.move(index, (splitter.size(index + 1) ?? 0) - splitter.min(index + 1));
		else return false;
		return true;
	}
</script>

<div
	bind:this={ref}
	class={['oito2-splitter-pane', className]}
	data-collapsed={splitter.collapsed(index) ? '' : undefined}
	style:flex="0 0 {size ?? 0}px"
	{...rest}
>
	{#if !hidden}{@render children?.()}{/if}
</div>
{#if !last}
	<div class="oito2-splitter-divider" data-orientation={splitter.orientation} bind:this={divider}>
		<ResizeHandle
			axis={splitter.orientation}
			keyboardStep={options.keyboardStep}
			label={options.resizeLabel ?? locale.strings.resizePane}
			value={size ?? 0}
			min={splitter.min(index)}
			max={splitter.max(index)}
			valueText={share(size ?? 0)}
			onMove={(delta) => {
				// In right-to-left rows the pane before the divider is on its right.
				const rtl = horizontal && divider !== null && directionOf(divider) === 'rtl';
				splitter.move(index, rtl ? -delta : delta);
			}}
			onToggle={() => splitter.toggle(index)}
			{onKey}
		/>
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-splitter-pane {
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		.oito2-splitter-divider {
			position: relative;
			flex: 0 0 1px;
			background: var(--oito2-color-outline-variant);
		}

		.oito2-splitter-divider :global(.oito2-resize-handle[data-axis='horizontal']) {
			left: calc(0.5px - var(--oito2-space-sm) / 2);
		}

		.oito2-splitter-divider :global(.oito2-resize-handle[data-axis='vertical']) {
			top: calc(0.5px - var(--oito2-space-sm) / 2);
		}
	}
</style>
