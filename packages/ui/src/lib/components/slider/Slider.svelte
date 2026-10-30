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
  A slider that picks a value, or a range with two thumbs, between `min` and `max`:
  a 6-pixel track (8 where filled) with 20-pixel ring thumbs. `divisions` snaps it to even
  steps; `marks` label points under the track; `label` and `valueText` add a header.
  The arrows move a thumb by a division (or a tenth of the range), Home and End to the
  ends. Bind `value` (a number, or two for a range), or set `defaultValue`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { on } from 'svelte/events';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { sliderFraction, sliderStep, snapSliderValue, type SliderMark } from './slider-math.js';

	type Value = number | [number, number];

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue'> {
		/** The value, or the start and end of a range. */
		value?: Value;
		/** The value of an uncontrolled slider. Defaults to `min`. */
		defaultValue?: Value;
		/** Called with each new value while the user drags or presses keys. */
		onValueChange?: (value: Value) => void;
		/** Called with the final value when a drag or key press ends. */
		onValueCommit?: (value: Value) => void;
		/** The smallest value. Defaults to 0. */
		min?: number;
		/** The largest value. Defaults to 1. */
		max?: number;
		/** The number of even steps the range snaps to. */
		divisions?: number;
		/** The heading above the slider; it also names the thumbs. */
		label?: string | Snippet;
		/** Formats a value for the header, the value indicator and screen readers. */
		valueText?: (value: number) => string;
		/** Whether a bubble with the value shows over the thumb while dragging. */
		showValueIndicator?: boolean;
		/** Labeled points under the track. */
		marks?: readonly SliderMark[];
		/** The direction of the track; a vertical slider grows upward. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** The length of a vertical slider in pixels. Defaults to 192. */
		length?: number;
		/** The accessible names of a range's two thumbs. */
		thumbLabels?: [string, string];
		/** Whether the slider can't be used. */
		disabled?: boolean;
		/** The form field name; a range submits two values under it. */
		name?: string;
	}

	let {
		value = $bindable(),
		defaultValue,
		onValueChange,
		onValueCommit,
		min = 0,
		max = 1,
		divisions,
		label,
		valueText,
		showValueIndicator = false,
		marks = [],
		orientation = 'horizontal',
		length = 192,
		thumbLabels,
		disabled = false,
		name,
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	const model = new Controllable<Value>({
		value: () => value,
		defaultValue: () => defaultValue ?? min,
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		}
	});

	let values = $derived(Array.isArray(model.current) ? model.current : [model.current]);
	let range = $derived(values.length === 2);
	let vertical = $derived(orientation === 'vertical');
	let fractions = $derived(values.map((v) => sliderFraction(v, min, max)));
	let dragging: number | null = $state(null);
	let rail: HTMLElement | null = $state(null);

	const format = (v: number) => (valueText ? valueText(v) : String(Math.round(v * 1000) / 1000));
	let headerText = $derived(
		valueText
			? range
				? `${format(values[0] ?? min)} – ${format(values[1] ?? max)}`
				: format(values[0] ?? min)
			: null
	);

	/** Sets thumb `index` to `next`, keeping a range's thumbs in order. */
	function setThumb(index: number, next: number) {
		const snapped = snapSliderValue(next, min, max, divisions);
		if (!range) {
			model.current = snapped;
			return;
		}
		const [start, end] = values as [number, number];
		model.current =
			index === 0 ? [Math.min(snapped, end), end] : [start, Math.max(snapped, start)];
	}

	/** Returns the value under a pointer position. */
	function valueAt(event: PointerEvent): number {
		const box = (rail as HTMLElement).getBoundingClientRect();
		let t: number;
		if (vertical) t = (box.bottom - event.clientY) / box.height;
		else {
			t = (event.clientX - box.left) / box.width;
			if (directionOf(rail as HTMLElement) === 'rtl') t = 1 - t;
		}
		return min + Math.min(1, Math.max(0, t)) * (max - min);
	}

	function onpointerdown(event: PointerEvent) {
		if (disabled || !rail || event.button !== 0) return;
		event.preventDefault();
		const target = valueAt(event);
		const index = range
			? Math.abs(target - (values[0] ?? 0)) <= Math.abs(target - (values[1] ?? 0)) &&
				!(target > (values[1] ?? 0))
				? 0
				: 1
			: 0;
		dragging = index;
		setThumb(index, target);
		const control = event.currentTarget as HTMLElement;
		control.setPointerCapture(event.pointerId);
		(
			control.querySelectorAll<HTMLElement>('[role="slider"]')[index] as
				HTMLElement | undefined
		)?.focus({
			preventScroll: true
		});
		const move = (e: PointerEvent) => setThumb(index, valueAt(e));
		const end = () => {
			dragging = null;
			control.removeEventListener('pointermove', move);
			control.removeEventListener('pointerup', end);
			control.removeEventListener('pointercancel', end);
			onValueCommit?.(model.current);
		};
		control.addEventListener('pointermove', move);
		control.addEventListener('pointerup', end);
		control.addEventListener('pointercancel', end);
	}

	function onkeydown(index: number, event: KeyboardEvent) {
		if (disabled) return;
		const step = sliderStep(min, max, divisions);
		const current = values[index] ?? min;
		const rtl = !vertical && directionOf(event.currentTarget as HTMLElement) === 'rtl';
		let next: number;
		switch (event.key) {
			case 'ArrowUp':
				next = current + step;
				break;
			case 'ArrowDown':
				next = current - step;
				break;
			case 'ArrowRight':
				next = current + (rtl ? -step : step);
				break;
			case 'ArrowLeft':
				next = current + (rtl ? step : -step);
				break;
			case 'Home':
				next = min;
				break;
			case 'End':
				next = max;
				break;
			default:
				return;
		}
		event.preventDefault();
		setThumb(index, next);
	}

	function onkeyup(event: KeyboardEvent) {
		if (
			['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
		) {
			onValueCommit?.(model.current);
		}
	}

	/** The position of a fraction along the rail, as CSS. */
	const along = (t: number) => `${t * 100}%`;
	let fillStart = $derived(range ? (fractions[0] ?? 0) : 0);
	let fillEnd = $derived(range ? (fractions[1] ?? 0) : (fractions[0] ?? 0));
	const reached = (mark: number) =>
		range
			? mark >= (values[0] ?? min) && mark <= (values[1] ?? max)
			: mark <= (values[0] ?? min);
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<div
	class={['oito2-slider', className]}
	data-orientation={orientation}
	data-disabled={disabled ? '' : undefined}
	style:--oito2-slider-length={vertical ? `${length}px` : undefined}
	{...rest}
>
	{#if label || headerText !== null}
		<div class="header">
			{#if label}<span class="label" id="{id}-label">{@render text(label)}</span>{/if}
			{#if headerText !== null}<span class="value-text" aria-hidden="true">{headerText}</span
				>{/if}
		</div>
	{/if}
	<div class="body">
		<div class="control" {@attach (node) => on(node, 'pointerdown', onpointerdown)}>
			<div class="rail" bind:this={rail}>
				<div class="track"></div>
				<div
					class="fill"
					style:--start={along(fillStart)}
					style:--end={along(fillEnd)}
				></div>
				{#each values as thumbValue, index (index)}
					<span
						role="slider"
						tabindex={disabled ? -1 : 0}
						aria-valuemin={min}
						aria-valuemax={max}
						aria-valuenow={thumbValue}
						aria-valuetext={valueText?.(thumbValue)}
						aria-orientation={orientation}
						aria-disabled={disabled || undefined}
						aria-label={thumbLabels?.[index]}
						aria-labelledby={!thumbLabels && label ? `${id}-label` : undefined}
						class="thumb"
						data-dragging={dragging === index ? '' : undefined}
						style:--at={along(fractions[index] ?? 0)}
						onkeydown={(event) => onkeydown(index, event)}
						{onkeyup}
					>
						{#if showValueIndicator && dragging === index}
							<span class="indicator" aria-hidden="true">{format(thumbValue)}</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
		{#if marks.length > 0}
			<div class="marks" data-labeled={marks.some((m) => m.label) ? '' : undefined}>
				{#each marks as mark (mark.value)}
					<span
						class="mark"
						data-reached={reached(mark.value) ? '' : undefined}
						style:--at={along(sliderFraction(mark.value, min, max))}
						style:--t={sliderFraction(mark.value, min, max)}
					>
						<span class="dot"></span>
						{#if mark.label}<span class="mark-label">{mark.label}</span>{/if}
					</span>
				{/each}
			</div>
		{/if}
	</div>
	{#if name}
		{#each values as thumbValue, index (index)}
			<input type="hidden" {name} value={thumbValue} />
		{/each}
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-slider {
			--thumb: 20px;
			--edge: calc(var(--thumb) / 2);
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-xs);
			min-width: 0;
			color: var(--oito2-color-on-surface);
		}

		[data-orientation='vertical'] {
			align-items: flex-start;
		}

		.header {
			display: flex;
			gap: var(--oito2-space-sm);
			font: var(--oito2-type-body-medium);
			font-weight: 500;
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		.label {
			flex: 1;
		}

		[data-orientation='vertical'] .label {
			flex: none;
		}

		.body {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-xs);
		}

		[data-orientation='vertical'] .body {
			flex-direction: row;
		}

		.control {
			position: relative;
			height: max(32px, var(--oito2-target-min));
			touch-action: none;
			cursor: pointer;
		}

		[data-orientation='vertical'] .control {
			width: max(32px, var(--oito2-target-min));
			height: var(--oito2-slider-length);
		}

		[data-disabled] .control {
			cursor: default;
		}

		.rail {
			position: absolute;
			inset: 0 var(--edge);
		}

		[data-orientation='vertical'] .rail {
			inset: var(--edge) 0;
		}

		.track,
		.fill {
			position: absolute;
			border-radius: 4px;
		}

		.track {
			top: calc(50% - 3px);
			right: 0;
			left: 0;
			height: 6px;
			background: var(--oito2-color-surface-container-highest);
		}

		.fill {
			top: calc(50% - 4px);
			inset-inline-start: var(--start);
			width: calc(var(--end) - var(--start));
			height: 8px;
			background: var(--oito2-color-primary-text);
		}

		[data-orientation='vertical'] .track {
			top: 0;
			bottom: 0;
			left: calc(50% - 3px);
			width: 6px;
			height: auto;
		}

		[data-orientation='vertical'] .fill {
			top: auto;
			bottom: var(--start);
			left: calc(50% - 4px);
			width: 8px;
			height: calc(var(--end) - var(--start));
		}

		.thumb {
			position: absolute;
			top: calc(50% - var(--edge));
			inset-inline-start: calc(var(--at) - var(--edge));
			box-sizing: border-box;
			width: var(--thumb);
			height: var(--thumb);
			border: 2px solid var(--oito2-color-primary-text);
			border-radius: 50%;
			outline: none;
			background: var(--oito2-color-surface);
			box-shadow: 0 1px 1px rgb(0 0 0 / 30%);
		}

		[data-orientation='vertical'] .thumb {
			top: auto;
			bottom: calc(var(--at) - var(--edge));
			left: calc(50% - var(--edge));
		}

		/* The overlay: a 32-pixel circle in the primary tone at 12%. */
		.thumb::before {
			content: '';
			position: absolute;
			inset: -8px;
			border-radius: 50%;
			background: var(--oito2-color-primary-text);
			opacity: 0;
			transition: opacity 100ms ease-out;
		}

		.control:hover .thumb::before,
		.thumb:focus-visible::before,
		.thumb[data-dragging]::before {
			opacity: 0.12;
		}

		[data-disabled] .thumb::before {
			display: none;
		}

		[data-disabled] .fill {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}

		[data-disabled] .track {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
		}

		[data-disabled] .thumb {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			box-shadow: none;
		}

		.indicator {
			position: absolute;
			bottom: calc(100% + 12px);
			left: 50%;
			translate: -50% 0;
			padding: var(--oito2-space-xxs) var(--oito2-space-sm);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-inverse-surface);
			color: var(--oito2-color-on-inverse-surface);
			font: var(--oito2-type-label-medium);
			letter-spacing: var(--oito2-type-label-medium-tracking);
			white-space: nowrap;
			pointer-events: none;
		}

		.marks {
			position: relative;
			height: 4px;
			margin: 0 var(--edge);
		}

		.marks[data-labeled] {
			height: 24px;
		}

		[data-orientation='vertical'] .marks {
			width: auto;
			height: var(--oito2-slider-length);
			margin: 0;
		}

		.mark {
			position: absolute;
			top: 0;
			inset-inline-start: var(--at);
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: var(--oito2-space-xxs);
			translate: -50% 0;
		}

		.mark:dir(rtl) {
			translate: 50% 0;
		}

		[data-orientation='vertical'] .mark {
			top: auto;
			bottom: calc(var(--edge) + (var(--oito2-slider-length) - var(--thumb)) * var(--t));
			inset-inline-start: 0;
			flex-direction: row;
			gap: var(--oito2-space-xs);
			translate: 0 50%;
		}

		.dot {
			width: 4px;
			height: 4px;
			border-radius: 50%;
			background: var(--oito2-color-outline-variant);
		}

		[data-reached] .dot {
			background: var(--oito2-color-primary-text);
		}

		.mark-label {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
			white-space: nowrap;
		}
	}
</style>
