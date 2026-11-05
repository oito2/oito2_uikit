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
  A round dial that picks an angle in degrees, from 0 at the top clockwise to just under
  360, such as a rotation or a gradient direction. Dragging or clicking points the dial
  at the pointer, in `step` increments. The arrow keys turn it by `step`, Page Up and Page
  Down by `pageStep`, and Home goes back to 0; the value wraps around. `markers` draws
  ticks at those angles. Assistive technologies read it as a slider. `onValueCommit`
  receives the final angle when a drag ends and after each key press.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { angleOf, snapAngle } from './rating-math.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The angle in degrees, from 0 to under 360. */
		value?: number;
		/** The angle of an uncontrolled dial at first. Defaults to 0. */
		defaultValue?: number;
		/** Called with each new angle. */
		onValueChange?: (value: number) => void;
		/** Called with the final angle when a drag ends and after each key press. */
		onValueCommit?: (value: number) => void;
		/** The increment the angle snaps to and the turn of an arrow key. Defaults to 1. */
		step?: number;
		/** The turn of Page Up and Page Down. Defaults to 15. */
		pageStep?: number;
		/** The angles that get a tick. Defaults to the four quarters. */
		markers?: readonly number[];
		/** The dial diameter, in pixels. Defaults to 96. */
		size?: number;
		/** Whether the angle shows in the middle of the dial. Defaults to true. */
		showValue?: boolean;
		/** Whether the angle can't be changed. */
		readonly?: boolean;
		/** Whether the dial can't be used. */
		disabled?: boolean;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		defaultValue = 0,
		value = $bindable(defaultValue),
		onValueChange,
		onValueCommit,
		step = 1,
		pageStep = 15,
		markers = [0, 90, 180, 270],
		size = 96,
		showValue = true,
		readonly = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let enabled = $derived(!readonly && !disabled);
	let dragging = false;
	let radius = $derived(size / 2);
	let knob = $derived(at(value, radius - 12));

	/** Formats `degrees` with a degree sign, with one decimal only when fractional. */
	function label(degrees: number): string {
		const digits = degrees % 1 === 0 ? 0 : 1;
		return `${new Intl.NumberFormat(locale.locale.replace('_', '-'), {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		}).format(degrees)}°`;
	}

	function set(degrees: number) {
		const next = snapAngle(degrees, step);
		if (next === value) return;
		value = next;
		onValueChange?.(next);
	}

	/** Points the dial at the pointer, ignoring points within 2 pixels of the center. */
	function pointAt(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const dx = event.clientX - (box.left + box.width / 2);
		const dy = event.clientY - (box.top + box.height / 2);
		if (Math.hypot(dx, dy) < 2) return;
		set(angleOf(dx, dy));
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const by: Record<string, number> = {
			ArrowUp: step,
			ArrowRight: step,
			ArrowDown: -step,
			ArrowLeft: -step,
			PageUp: pageStep,
			PageDown: -pageStep
		};
		if (event.key === 'Home') set(0);
		else if (event.key in by) set(value + (by[event.key] ?? 0));
		else return;
		event.preventDefault();
		onValueCommit?.(value);
	}

	/** The point `distance` from the center toward `degrees`. */
	function at(degrees: number, distance: number) {
		const radians = ((degrees - 90) * Math.PI) / 180;
		return {
			x: radius + Math.cos(radians) * distance,
			y: radius + Math.sin(radians) * distance
		};
	}
</script>

{#snippet dial()}
	<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
		<circle class="track" cx={radius} cy={radius} r={radius - 0.5} />
		{#each markers as marker (marker)}
			{@const point = at(marker, radius - 7)}
			<circle class="tick" cx={point.x} cy={point.y} r="1.5" />
		{/each}
		<g transform="rotate({value} {radius} {radius})">
			<rect
				class="hand"
				x={radius - 1}
				y={12}
				width="2"
				height={showValue ? radius - 12 - radius * 0.45 : radius - 12}
				rx="1"
			/>
		</g>
		{#if !showValue}<circle class="hand" cx={radius} cy={radius} r="3" />{/if}
		<circle class="hand" cx={knob.x} cy={knob.y} r="6" />
	</svg>
	{#if showValue}<span class="value">{label(value)}</span>{/if}
{/snippet}

{#if enabled}
	<div
		bind:this={ref}
		role="slider"
		tabindex="0"
		aria-valuemin={0}
		aria-valuemax={359}
		aria-valuenow={value}
		aria-valuetext={label(value)}
		class={['oito2-angle-slider', className]}
		style:--oito2-angle-size="{size}px"
		onpointerdown={(event) => {
			if (event.button !== 0) return;
			event.currentTarget.focus();
			event.currentTarget.setPointerCapture(event.pointerId);
			dragging = true;
			pointAt(event);
		}}
		onpointermove={(event) => {
			if (dragging) pointAt(event);
		}}
		onpointerup={() => {
			if (!dragging) return;
			dragging = false;
			onValueCommit?.(value);
		}}
		onpointercancel={() => (dragging = false)}
		{onkeydown}
		{...rest}
	>
		{@render dial()}
	</div>
{:else}
	<!-- A read-only dial stays focusable and announces its angle; a disabled one leaves the tab order. -->
	<div
		bind:this={ref}
		role="slider"
		tabindex={disabled ? undefined : 0}
		aria-valuemin={0}
		aria-valuemax={359}
		aria-valuenow={value}
		aria-valuetext={label(value)}
		aria-readonly={readonly && !disabled ? true : undefined}
		aria-disabled={disabled || undefined}
		aria-label={label(value)}
		class={['oito2-angle-slider', className]}
		data-disabled={disabled ? '' : undefined}
		style:--oito2-angle-size="{size}px"
		{...rest}
	>
		{@render dial()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-angle-slider {
			position: relative;
			display: inline-grid;
			place-items: center;
			width: var(--oito2-angle-size);
			height: var(--oito2-angle-size);
			border-radius: 50%;
			cursor: grab;
			touch-action: none;
		}

		.oito2-angle-slider:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		svg {
			grid-area: 1 / 1;
		}

		.track {
			fill: var(--oito2-color-surface-container-high);
			stroke: var(--oito2-color-outline);
			stroke-width: 1;
		}

		.tick {
			fill: var(--oito2-color-on-surface-variant);
		}

		.hand {
			fill: var(--oito2-color-selected-fill);
		}

		[data-disabled] {
			cursor: default;
		}

		[data-disabled] .hand {
			fill: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}

		.value {
			grid-area: 1 / 1;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			pointer-events: none;
		}
	}
</style>
