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
  Internal: a focusable divider that resizes the panes beside it by dragging, the arrow
  keys and assistive technologies. It is 8 pixels thick across `axis` and fills the
  other direction; its line is highlighted while hovered or focused and thicker while
  focused. Movements are reported in screen coordinates: positive toward the right for a
  horizontal axis and toward the bottom for a vertical one, whatever the text direction.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The axis the divider moves along. */
		axis: 'horizontal' | 'vertical';
		/** Called with each movement along `axis`, from a drag or an arrow key. */
		onMove: (delta: number) => void;
		/** The movement of one arrow key press, in pixels. */
		keyboardStep: number;
		/** The accessible name. */
		label: string;
		/** The current value for assistive technologies, such as the pane size. */
		value: number;
		/** The smallest value. */
		min: number;
		/** The largest value. */
		max: number;
		/** The value as read out, such as "40%". */
		valueText?: string;
		/** Called on a double click, Enter or Space, such as to collapse a pane. */
		onToggle?: () => void;
		/** Handles other keys before the arrows; returns whether it handled the key. */
		onKey?: (event: KeyboardEvent) => boolean;
	}

	let {
		axis,
		onMove,
		keyboardStep,
		label,
		value,
		min,
		max,
		valueText,
		onToggle,
		onKey,
		class: className,
		...rest
	}: Props = $props();

	let horizontal = $derived(axis === 'horizontal');
	let dragging = $state(false);
	let last = 0;

	function onpointerdown(event: PointerEvent & { currentTarget: HTMLDivElement }) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.currentTarget.focus();
		event.currentTarget.setPointerCapture(event.pointerId);
		dragging = true;
		last = horizontal ? event.clientX : event.clientY;
	}

	function onpointermove(event: PointerEvent) {
		if (!dragging) return;
		const position = horizontal ? event.clientX : event.clientY;
		const delta = position - last;
		last = position;
		if (delta !== 0) onMove(delta);
	}

	function onpointerup(event: PointerEvent & { currentTarget: HTMLDivElement }) {
		if (!dragging) return;
		dragging = false;
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
	}

	function onkeydown(event: KeyboardEvent) {
		if (onKey?.(event)) {
			event.preventDefault();
			return;
		}
		const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
		const backward = horizontal ? 'ArrowLeft' : 'ArrowUp';
		if (event.key === forward) onMove(keyboardStep);
		else if (event.key === backward) onMove(-keyboardStep);
		else if (onToggle && (event.key === 'Enter' || event.key === ' ')) onToggle();
		else return;
		event.preventDefault();
	}
</script>

<!-- A focusable separator is a widget (WAI-ARIA window splitter pattern). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="separator"
	tabindex="0"
	aria-label={label}
	aria-orientation={horizontal ? 'vertical' : 'horizontal'}
	aria-valuenow={Math.round(value)}
	aria-valuemin={Math.round(min)}
	aria-valuemax={Math.round(max)}
	aria-valuetext={valueText}
	class={['oito2-resize-handle', className]}
	data-axis={axis}
	data-dragging={dragging ? '' : undefined}
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	onpointercancel={onpointerup}
	ondblclick={onToggle}
	{onkeydown}
	{...rest}
></div>

<style>
	@layer oito2 {
		.oito2-resize-handle {
			position: absolute;
			z-index: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			touch-action: none;
			outline: none;
		}

		[data-axis='horizontal'] {
			top: 0;
			bottom: 0;
			width: var(--oito2-space-sm);
			cursor: col-resize;
		}

		[data-axis='vertical'] {
			right: 0;
			left: 0;
			height: var(--oito2-space-sm);
			cursor: row-resize;
		}

		.oito2-resize-handle::before {
			content: '';
			background: transparent;
		}

		[data-axis='horizontal']::before {
			width: 1px;
			height: 100%;
		}

		[data-axis='vertical']::before {
			width: 100%;
			height: 1px;
		}

		.oito2-resize-handle:hover::before,
		.oito2-resize-handle:focus-visible::before,
		[data-dragging]::before {
			background: var(--oito2-color-primary-text);
		}

		[data-axis='horizontal']:focus-visible::before {
			width: 2px;
		}

		[data-axis='vertical']:focus-visible::before {
			height: 2px;
		}
	}
</style>
