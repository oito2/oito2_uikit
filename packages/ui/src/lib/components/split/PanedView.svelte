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
  Splits its area between a `pane` and the page (the children), separated by a divider.
  When `resizable`, the divider can be dragged or, once focused, moved with the arrow
  keys, and assistive technologies read it as an adjustable separator. The pane never
  shrinks below `minPaneSize` and never leaves less than `minPageSize` for the page.
  Bind `paneSize`, or set `defaultPaneSize` and listen to `onPaneSizeChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import ResizeHandle from '../../internal/ResizeHandle.svelte';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';

	/** The side of a `PanedView` its pane is on; `start` and `end` follow the text direction. */
	type PaneSide = 'start' | 'end' | 'top' | 'bottom';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The side content, such as a list. */
		pane: Snippet;
		/** Which side the pane is on. Defaults to `start`. */
		paneSide?: PaneSide;
		/** The pane width (or height, when stacked), in pixels. */
		paneSize?: number;
		/** The pane size of an uncontrolled view. Defaults to 280. */
		defaultPaneSize?: number;
		/** Called with the new pane size while it is resized. */
		onPaneSizeChange?: (size: number) => void;
		/** The smallest pane size, in pixels. Defaults to 180. */
		minPaneSize?: number;
		/** The smallest size left for the page, in pixels. Defaults to 320. */
		minPageSize?: number;
		/** Whether the divider can be moved. Defaults to true. */
		resizable?: boolean;
		/** How far one arrow key press moves the divider, in pixels. Defaults to 16. */
		keyboardStep?: number;
		/** The accessible name of the divider. Defaults to "Resize pane". */
		resizeLabel?: string;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The main content. */
		children?: Snippet;
	}

	let {
		pane,
		paneSide = 'start',
		paneSize = $bindable(),
		defaultPaneSize = 280,
		onPaneSizeChange,
		minPaneSize = 180,
		minPageSize = 320,
		resizable = true,
		keyboardStep = 16,
		resizeLabel,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const size = new Controllable({
		value: () => paneSize,
		defaultValue: () => defaultPaneSize,
		onChange: (next) => {
			paneSize = next;
			onPaneSizeChange?.(next);
		}
	});

	let vertical = $derived(paneSide === 'top' || paneSide === 'bottom');
	let width = $state(0);
	let height = $state(0);
	let available = $derived(vertical ? height : width);
	let max = $derived(Math.max(minPaneSize, available - 1 - minPageSize));
	let current = $derived(Math.min(Math.max(size.current, minPaneSize), max));
	let paneFirst = $derived(paneSide === 'start' || paneSide === 'top');

	/** Sets the pane size to `value` within the limits. */
	function resize(value: number) {
		const next = Math.min(Math.max(value, minPaneSize), max);
		if (next !== current) size.current = next;
	}

	/** Whether moving the divider toward the right or the bottom grows the pane. */
	function growsForward(element: HTMLElement): boolean {
		if (paneSide === 'top') return true;
		if (paneSide === 'bottom') return false;
		const rtl = directionOf(element) === 'rtl';
		return paneSide === 'start' ? !rtl : rtl;
	}
</script>

<div
	bind:this={ref}
	bind:clientWidth={width}
	bind:clientHeight={height}
	class={['oito2-paned-view', className]}
	data-orientation={vertical ? 'vertical' : 'horizontal'}
	data-pane-first={paneFirst ? '' : undefined}
	{...rest}
>
	<div class="pane" style:flex="0 0 {current}px">{@render pane()}</div>
	<div class="divider">
		{#if resizable}
			<ResizeHandle
				axis={vertical ? 'vertical' : 'horizontal'}
				{keyboardStep}
				label={resizeLabel ?? locale.strings.resizePane}
				value={current}
				min={minPaneSize}
				{max}
				onMove={(delta) => resize(current + (ref && growsForward(ref) ? delta : -delta))}
				onKey={(event) => {
					if (event.key === 'Home') resize(minPaneSize);
					else if (event.key === 'End') resize(max);
					else return false;
					return true;
				}}
			/>
		{/if}
	</div>
	<div class="page">{@render children?.()}</div>
</div>

<style>
	@layer oito2 {
		.oito2-paned-view {
			display: flex;
			flex-direction: row-reverse;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		[data-pane-first] {
			flex-direction: row;
		}

		[data-orientation='vertical'] {
			flex-direction: column-reverse;
		}

		[data-orientation='vertical'][data-pane-first] {
			flex-direction: column;
		}

		.pane {
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		.page {
			flex: 1 0 0;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		.divider {
			position: relative;
			flex: 0 0 1px;
			background: var(--oito2-color-outline-variant);
		}

		.divider :global(.oito2-resize-handle[data-axis='horizontal']) {
			left: calc(0.5px - var(--oito2-space-sm) / 2);
		}

		.divider :global(.oito2-resize-handle[data-axis='vertical']) {
			top: calc(0.5px - var(--oito2-space-sm) / 2);
		}
	}
</style>
