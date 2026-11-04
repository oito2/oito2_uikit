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
  The row or column of tabs of a `Tabs.Root`, with a rounded marker that slides to the
  selected tab. It is one Tab stop: the arrow keys, Home and End move between the tabs.
  In a row, the pill tabs share the width equally unless `scrollable`; the subtle tabs
  always keep their own width, start at the leading edge and scroll.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { rovingFocus } from '../../../internal/roving-focus.js';
	import { useTabs } from '../tabs-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the tabs of a row keep their own width and scroll. */
		scrollable?: boolean;
		/** The list element. */
		ref?: HTMLDivElement | null;
		/** The triggers. */
		children?: Snippet;
	}

	let {
		scrollable = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const tabs = useTabs();
	let marker = $state<{ x: number; y: number; width: number; height: number } | null>(null);
	let animate = $state(false);
	// The subtle marker of a row is inset from the sides of its tab.
	let inset = $derived(tabs.variant === 'subtle' && tabs.orientation === 'horizontal');

	/** Places the marker over the selected trigger of `list`. */
	function measure(list: HTMLElement) {
		const selected = list.querySelector<HTMLElement>(`[role='tab'][aria-selected='true']`);
		marker = selected
			? {
					x: selected.offsetLeft,
					y: selected.offsetTop,
					width: selected.offsetWidth,
					height: selected.offsetHeight
				}
			: null;
	}

	/** Keeps the marker on the selected trigger as the selection and the sizes change. */
	function track(list: HTMLElement) {
		const observer = new ResizeObserver(() => measure(list));
		observer.observe(list);
		for (const child of list.children) observer.observe(child);
		const mutations = new MutationObserver(() => measure(list));
		mutations.observe(list, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['aria-selected']
		});
		measure(list);
		// The first placement is not animated.
		const frame = requestAnimationFrame(() => (animate = true));
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			mutations.disconnect();
		};
	}
</script>

<div
	bind:this={ref}
	role="tablist"
	aria-orientation={tabs.orientation}
	class={['oito2-tabs-list', className]}
	data-orientation={tabs.orientation}
	data-variant={tabs.variant}
	data-scrollable={scrollable || tabs.variant === 'subtle' ? '' : undefined}
	{@attach rovingFocus({
		orientation: tabs.orientation,
		onFocusItem: (item) => {
			const value = item.dataset.value;
			if (tabs.activateOnFocus && value !== undefined) tabs.select(value);
		}
	})}
	{@attach track}
	{...rest}
>
	{#if marker}
		<span
			class="marker"
			aria-hidden="true"
			data-animate={animate ? '' : undefined}
			data-inset={inset ? '' : undefined}
			style:translate="{marker.x}px {marker.y}px"
			style:width={inset
				? `calc(${marker.width}px - 2 * var(--oito2-space-xxs))`
				: `${marker.width}px`}
			style:height="{marker.height}px"
		></span>
	{/if}
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-tabs-list {
			position: relative;
			display: flex;
			flex: none;
			gap: var(--oito2-space-xxs);
			padding: var(--oito2-space-xs);
		}

		[data-orientation='horizontal'][data-scrollable] {
			overflow-x: auto;
			scrollbar-width: none;
		}

		[data-orientation='vertical'] {
			flex-direction: column;
			width: var(--oito2-tabs-list-width, 200px);
			overflow-y: auto;
		}

		.marker {
			position: absolute;
			top: 0;
			left: 0;
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-secondary-container);
			pointer-events: none;
		}

		[data-variant='subtle'] > .marker {
			background: color-mix(in srgb, var(--oito2-color-primary-text) 12%, transparent);
		}

		.marker[data-inset] {
			margin-left: var(--oito2-space-xxs);
		}

		.marker[data-animate] {
			transition:
				translate 250ms ease,
				width 250ms ease,
				height 250ms ease;
		}

		@media (prefers-reduced-motion: reduce) {
			.marker[data-animate] {
				transition: none;
			}
		}
	}
</style>
