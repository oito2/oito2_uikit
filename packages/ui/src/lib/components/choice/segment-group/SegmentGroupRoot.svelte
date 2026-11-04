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
  A row (or column) of mutually exclusive choices on a recessed track, with a raised
  marker that slides to the selected one. The group is one Tab stop: the arrow keys
  select the previous or next enabled segment, wrapping at the ends. Assistive
  technologies read it as a group of radio buttons. Bind `value`, or set `defaultValue`
  and listen to `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { rovingFocus } from '../../../internal/roving-focus.js';
	import { SegmentGroupState, setSegmentGroup } from './segment-group-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the selected segment, or `null`. */
		value?: string | null;
		/** The selected segment of an uncontrolled group. Defaults to `null`. */
		defaultValue?: string | null;
		/** Called with the value of each newly selected segment. */
		onValueChange?: (value: string | null) => void;
		/** Whether the segments run across or down. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** Whether every segment is disabled. */
		disabled?: boolean;
		/** The group element. */
		ref?: HTMLDivElement | null;
		/** The `SegmentGroup.Item`s. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		orientation = 'horizontal',
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const group = setSegmentGroup(
		new SegmentGroupState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			disabled: () => disabled
		})
	);

	let marker = $state<{ x: number; y: number; width: number; height: number } | null>(null);
	let animate = $state(false);

	/** Keeps the marker on the selected segment as the selection and the sizes change. */
	function track(track: HTMLElement) {
		const measure = () => {
			const selected = track.querySelector<HTMLElement>(
				"[role='radio'][aria-checked='true']"
			);
			marker = selected
				? {
						x: selected.offsetLeft,
						y: selected.offsetTop,
						width: selected.offsetWidth,
						height: selected.offsetHeight
					}
				: null;
		};
		const resize = new ResizeObserver(measure);
		resize.observe(track);
		const mutations = new MutationObserver(measure);
		mutations.observe(track, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['aria-checked']
		});
		measure();
		const frame = requestAnimationFrame(() => (animate = true));
		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			mutations.disconnect();
		};
	}
</script>

<div
	bind:this={ref}
	role="radiogroup"
	aria-orientation={orientation}
	aria-disabled={disabled || undefined}
	class={['oito2-segment-group', className]}
	data-orientation={orientation}
	{@attach rovingFocus({
		orientation,
		loop: true,
		onFocusItem: (item) => {
			const itemValue = item.dataset.value;
			if (itemValue !== undefined) group.select(itemValue);
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
			style:translate="{marker.x}px {marker.y}px"
			style:width="{marker.width}px"
			style:height="{marker.height}px"
		></span>
	{/if}
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-segment-group {
			position: relative;
			display: inline-flex;
			padding: var(--oito2-space-xs);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
		}

		[data-orientation='vertical'] {
			flex-direction: column;
		}

		.marker {
			position: absolute;
			top: 0;
			left: 0;
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-surface);
			box-shadow: 0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 12%, transparent);
			pointer-events: none;
		}

		.marker[data-animate] {
			transition:
				translate 150ms ease-out,
				width 150ms ease-out,
				height 150ms ease-out;
		}

		@media (prefers-reduced-motion: reduce) {
			.marker[data-animate] {
				transition: none;
			}
		}
	}
</style>
