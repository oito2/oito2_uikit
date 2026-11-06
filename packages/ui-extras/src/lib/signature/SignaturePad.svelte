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
  An area to sign with a mouse, finger or pen.

  Strokes get thinner as the pointer moves faster, between `minWidth` and `maxWidth`, like
  ink, and a pen's pressure makes them wider. With `showActions`, undo and clear buttons sit
  in a corner. Assistive technologies hear whether the pad is empty or signed.
-->
<script lang="ts">
	import { IconButton, useLocale, type IconComponent } from '@oito2/ui';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		paintStrokes,
		type SignatureController,
		type SignaturePoint,
		type SignatureSize
	} from './signature-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The controller that holds the drawn strokes. */
		controller: SignatureController;
		/** The pad height in pixels; it takes the available width. Defaults to 180. */
		height?: number;
		/** The ink color, as a CSS color; defaults to the text color. */
		color?: string;
		/** The thinnest stroke in pixels. Defaults to 1.2. */
		minWidth?: number;
		/** The thickest stroke in pixels. Defaults to 3.6. */
		maxWidth?: number;
		/** Whether undo and clear buttons show. Defaults to true. */
		showActions?: boolean;
		/** The text shown on the empty pad; defaults to the localized "Sign here". */
		placeholder?: string;
		/** The accessible name; defaults to the localized "Signature". */
		label?: string;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		controller,
		height = 180,
		color,
		minWidth = 1.2,
		maxWidth = 3.6,
		showActions = true,
		placeholder,
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();

	let canvas: HTMLCanvasElement | null = $state(null);
	let pointer: number | null = null;
	let last: { x: number; y: number; time: number } | null = null;
	/** The last point of the stroke being drawn. */
	let previous: SignaturePoint | null = null;
	let width = 0;

	/** What the canvas shows, so the strokes the pad draws itself aren't painted again. */
	let painted: {
		controller: SignatureController;
		version: number;
		size: SignatureSize;
		color: string | undefined;
		ink: string;
		width: number;
		height: number;
	} | null = null;

	// Sizes the canvas to the pad at the device pixel ratio and records the pad size in the
	// current controller.
	$effect(() => {
		const element = canvas;
		const target = controller;
		if (!element) return;
		const observer = new ResizeObserver(() => {
			const ratio = window.devicePixelRatio || 1;
			const box = element.getBoundingClientRect();
			element.width = Math.max(1, Math.round(box.width * ratio));
			element.height = Math.max(1, Math.round(box.height * ratio));
			target.size = { width: box.width, height: box.height };
		});
		observer.observe(element);
		return () => observer.disconnect();
	});

	/** Clears the canvas and paints every stroke of the controller. */
	function repaint(element: HTMLCanvasElement): void {
		const context = element.getContext('2d');
		if (!context) return;
		const target = controller;
		const ratio = element.width / Math.max(1, target.size.width);
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, element.width, element.height);
		const ink = color ?? getComputedStyle(element).color;
		paintStrokes(context, target.strokes, ink);
		painted = {
			controller: target,
			version: target.version,
			size: target.size,
			color,
			ink,
			width: element.width,
			height: element.height
		};
	}

	// Repaints every stroke when they change by other means than drawing on the pad, such
	// as undo or clear, and when the canvas, the color or the controller change.
	$effect(() => {
		const element = canvas;
		const target = controller;
		const version = target.version;
		const size = target.size;
		const ink = color;
		if (!element) return;
		untrack(() => {
			if (
				painted?.controller === target &&
				painted.version === version &&
				painted.size === size &&
				painted.color === ink &&
				painted.width === element.width &&
				painted.height === element.height
			)
				return;
			repaint(element);
		});
	});

	/**
	 * Paints `points`, a new dot or segment the pad just added to the controller, over what
	 * the canvas shows; repaints everything instead when the canvas was not up to date with
	 * the strokes before the change (`before` is the version then) or the ink changed.
	 */
	function paintAdded(before: number, points: SignaturePoint[]): void {
		const element = canvas;
		if (!element) return;
		const context = element.getContext('2d');
		const current =
			painted !== null &&
			painted.controller === controller &&
			painted.version === before &&
			painted.size === controller.size &&
			painted.color === color &&
			painted.width === element.width &&
			painted.height === element.height &&
			(points.length > 1 || painted.ink === (color ?? getComputedStyle(element).color));
		if (!context || !painted || !current) {
			repaint(element);
			return;
		}
		paintStrokes(context, [points], painted.ink);
		painted.version = controller.version;
	}

	/** The width factor from a pen's pressure, from 0.6 to 1.4; 1 for other pointers. */
	function pressureWidth(event: PointerEvent): number {
		return event.pointerType === 'pen' && event.pressure > 0 ? 0.6 + 0.8 * event.pressure : 1;
	}

	/** Returns the position of `event` in the pad's pixels. */
	function positionOf(event: PointerEvent): { x: number; y: number } {
		const box = (canvas as HTMLCanvasElement).getBoundingClientRect();
		return { x: event.clientX - box.left, y: event.clientY - box.top };
	}

	function onpointerdown(event: PointerEvent): void {
		if (pointer !== null || !canvas) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		event.preventDefault();
		pointer = event.pointerId;
		try {
			canvas.setPointerCapture(event.pointerId);
		} catch {
			// A pointer that is no longer active can't be captured; the stroke still follows it.
		}
		const position = positionOf(event);
		last = { ...position, time: event.timeStamp };
		width = (minWidth + maxWidth) / 2;
		const point = { ...position, width: width * pressureWidth(event) };
		const before = controller.version;
		controller.beginStroke(point);
		previous = point;
		paintAdded(before, [point]);
	}

	function onpointermove(event: PointerEvent): void {
		if (event.pointerId !== pointer || !last) return;
		const position = positionOf(event);
		const distance = Math.hypot(position.x - last.x, position.y - last.y);
		if (distance < 1) return;
		const speed = distance / Math.max(1, event.timeStamp - last.time);
		// Faster strokes are thinner; the width eases toward its target so it doesn't jump.
		const target = Math.min(maxWidth, Math.max(minWidth, maxWidth - speed * 1.2));
		width = width * 0.6 + target * 0.4;
		last = { ...position, time: event.timeStamp };
		const point = { ...position, width: width * pressureWidth(event) };
		const before = controller.version;
		controller.extendStroke(point);
		if (previous) paintAdded(before, [previous, point]);
		previous = point;
	}

	function onpointerup(event: PointerEvent): void {
		if (event.pointerId !== pointer) return;
		pointer = null;
		last = null;
		previous = null;
	}
</script>

<div
	bind:this={ref}
	role="group"
	aria-label="{label ?? locale.strings.signature}: {controller.isEmpty
		? locale.strings.empty
		: locale.strings.signed}"
	class={['oito2-signature-pad', className]}
	style:height="{height}px"
	data-empty={controller.isEmpty ? '' : undefined}
	{...rest}
>
	{#if controller.isEmpty}
		<span class="oito2-signature-pad-placeholder" aria-hidden="true"
			>{placeholder ?? locale.strings.signHere}</span
		>
	{/if}
	<span class="oito2-signature-pad-line" aria-hidden="true"></span>
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		style:color
		{onpointerdown}
		{onpointermove}
		{onpointerup}
		onpointercancel={onpointerup}
		onlostpointercapture={onpointerup}
	></canvas>
	{#if showActions}
		<div class="oito2-signature-pad-actions">
			<IconButton
				icon={Undo2 as IconComponent}
				label={locale.strings.undo}
				disabled={controller.isEmpty}
				onclick={() => controller.undo()}
			/>
			<IconButton
				icon={Eraser as IconComponent}
				label={locale.strings.clear}
				disabled={controller.isEmpty}
				onclick={() => controller.clear()}
			/>
		</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-signature-pad {
			position: relative;
			box-sizing: border-box;
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
		}

		canvas {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			color: var(--oito2-color-on-surface);
			cursor: crosshair;
			touch-action: none;
		}

		.oito2-signature-pad-placeholder {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
			pointer-events: none;
		}

		.oito2-signature-pad-line {
			position: absolute;
			inset-inline: var(--oito2-space-lg);
			bottom: var(--oito2-space-xl);
			height: 1px;
			background: var(--oito2-color-outline-variant);
			pointer-events: none;
		}

		.oito2-signature-pad-actions {
			position: absolute;
			top: var(--oito2-space-xs);
			inset-inline-end: var(--oito2-space-xs);
			display: flex;
		}
	}
</style>
