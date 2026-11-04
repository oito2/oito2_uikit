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
  A list of items (the master) next to the page of the selected item (the detail), as in
  settings apps. At or above `breakpoint` wide the master is a resizable pane beside the
  detail and an item is always selected. Below it the master fills the area, selecting an
  item shows its detail instead, and the detail header's back button returns to the list,
  clearing the selection. The selection survives switching between the two layouts.
  Compose it with `MasterDetail.Master` (with `MasterHeader`, `List` of `Tile`s and
  `MasterFooter`) and `MasterDetail.Detail` (with `DetailHeader`).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../../internal/controllable.svelte.js';
	import ResizeHandle from '../../../internal/ResizeHandle.svelte';
	import { directionOf } from '../../../internal/keyboard.js';
	import { useLocale } from '../../../l10n/locale.js';
	import { MasterDetailState, setMasterDetail } from '../master-detail-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the selected item, or `null` for none. */
		value?: string | null;
		/** The selected item of an uncontrolled page. Defaults to `null`. */
		defaultValue?: string | null;
		/** Called with each new selection. */
		onValueChange?: (value: string | null) => void;
		/** The width at which master and detail sit side by side, in pixels. Defaults to 620. */
		breakpoint?: number;
		/** The master pane width, in pixels. */
		paneSize?: number;
		/** The master pane width of an uncontrolled page. Defaults to 280. */
		defaultPaneSize?: number;
		/** Called with the new pane width while it is resized. */
		onPaneSizeChange?: (size: number) => void;
		/** The smallest master pane width, in pixels. Defaults to 180. */
		minPaneSize?: number;
		/** The smallest width left for the detail, in pixels. Defaults to 320. */
		minPageSize?: number;
		/** Whether the master pane can be resized. Defaults to true. */
		resizable?: boolean;
		/** The accessible name of the divider. Defaults to "Resize pane". */
		resizeLabel?: string;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The master and the detail. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		breakpoint = 620,
		paneSize = $bindable(),
		defaultPaneSize = 280,
		onPaneSizeChange,
		minPaneSize = 180,
		minPageSize = 320,
		resizable = true,
		resizeLabel,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const masterDetail = setMasterDetail(
		new MasterDetailState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			}
		})
	);
	const size = new Controllable({
		value: () => paneSize,
		defaultValue: () => defaultPaneSize,
		onChange: (next) => {
			paneSize = next;
			onPaneSizeChange?.(next);
		}
	});

	let width = $state(Number.POSITIVE_INFINITY);
	let max = $derived(Math.max(minPaneSize, width - 1 - minPageSize));
	let current = $derived(Math.min(Math.max(size.current, minPaneSize), max));

	$effect.pre(() => {
		masterDetail.wide = width >= breakpoint;
		masterDetail.measured = Number.isFinite(width);
	});

	/** Sets the pane width to `next` within the limits. */
	function resize(next: number) {
		const clamped = Math.min(Math.max(next, minPaneSize), max);
		if (clamped !== current) size.current = clamped;
	}
</script>

<div
	bind:this={ref}
	bind:clientWidth={width}
	class={['oito2-master-detail', className]}
	data-layout={masterDetail.wide ? 'wide' : 'narrow'}
	style:--oito2-master-width="{current}px"
	{...rest}
>
	{@render children?.()}
	{#if masterDetail.wide}
		<div class="divider">
			{#if resizable}
				<ResizeHandle
					axis="horizontal"
					keyboardStep={16}
					label={resizeLabel ?? locale.strings.resizePane}
					value={current}
					min={minPaneSize}
					{max}
					onMove={(delta) =>
						resize(current + (ref && directionOf(ref) === 'rtl' ? -delta : delta))}
					onKey={(event) => {
						if (event.key === 'Home') resize(minPaneSize);
						else if (event.key === 'End') resize(max);
						else return false;
						return true;
					}}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-master-detail {
			display: grid;
			grid-template-rows: minmax(0, 1fr);
			grid-template-columns: minmax(0, 1fr);
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		[data-layout='wide'] {
			grid-template-columns: var(--oito2-master-width) 1px minmax(0, 1fr);
		}

		.divider {
			position: relative;
			grid-row: 1;
			grid-column: 2;
			background: var(--oito2-color-outline-variant);
		}

		.divider :global(.oito2-resize-handle) {
			left: calc(0.5px - var(--oito2-space-sm) / 2);
		}
	}
</style>
