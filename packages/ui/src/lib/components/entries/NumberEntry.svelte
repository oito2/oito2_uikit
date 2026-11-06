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
  A number field with decrease and increase buttons, like a GNOME spin button. It shows
  `value` in the locale's number format with `decimals` places. Typed text is read when
  the field loses focus or on Enter, rounded, kept between `min` and `max` and reported;
  text that isn't a number is replaced by the current value. The Up and Down arrows step
  by `step`, Page Up and Page Down by `pageStep`, and Home and End jump to finite limits.
  With focus in the field the mouse wheel steps too, and dragging sideways on the buttons
  scrubs the value one step per 4 pixels. Assistive technologies read it as a spin button.
  Bind `value`, or set `defaultValue` and listen to `onValueChange`.
-->
<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { mergeProps } from '../../internal/merge-props.js';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import TextField from '../field/TextField.svelte';
	import type { IconComponent } from '../icon.js';
	import { formatNumber, normalizeNumber, parseNumber } from './number-format.js';

	interface Props extends Omit<
		HTMLInputAttributes,
		'children' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
	> {
		/** The value. */
		value?: number;
		/** The value of an uncontrolled entry at first. Defaults to 0. */
		defaultValue?: number;
		/** Called with each new value. */
		onValueChange?: (value: number) => void;
		/** The smallest value. Defaults to no limit. */
		min?: number;
		/** The largest value. Defaults to no limit. */
		max?: number;
		/** The change of the arrows, the buttons and the wheel. Defaults to 1. */
		step?: number;
		/** The change of Page Up and Page Down. Defaults to ten steps. */
		pageStep?: number;
		/** The decimal places shown and kept, from 0 to 20. Defaults to 0. */
		decimals?: number;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(),
		defaultValue = 0,
		onValueChange,
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
		step = 1,
		pageStep,
		decimals = 0,
		readonly = false,
		disabled,
		ref = $bindable(null),
		onblur,
		onkeydown,
		...rest
	}: Props = $props();

	const model = new Controllable<number>({
		value: () => value,
		defaultValue: () => defaultValue,
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		}
	});

	const locale = useLocale();
	let text = $state('');
	let editing = $state(false);
	let scrub = 0;
	let scrubbing = false;
	let enabled = $derived(!readonly && !disabled);
	let current = $derived(model.current);
	let typed = $derived(parseNumber(text, locale.locale) ?? current);

	// Shows the value in the locale's format, unless the text is being edited.
	$effect.pre(() => {
		const formatted = formatNumber(current, locale.locale, decimals);
		if (!editing) text = formatted;
	});

	/** Rounds, clamps and reports `next`, then shows the resulting value. */
	function set(next: number) {
		model.current = normalizeNumber(next, decimals, min, max);
		text = formatNumber(model.current, locale.locale, decimals);
	}

	/** Applies the typed text, or restores the current value. */
	function commit() {
		editing = false;
		const parsed = parseNumber(text, locale.locale);
		if (parsed === null || !enabled) text = formatNumber(current, locale.locale, decimals);
		else set(parsed);
	}

	/** Adds `delta` to the typed number, or to the value when the text isn't one. */
	function stepBy(delta: number) {
		if (!enabled) return;
		set(typed + delta);
	}

	function handleKey(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
		const page = pageStep ?? step * 10;
		switch (event.key) {
			case 'ArrowUp':
				stepBy(step);
				break;
			case 'ArrowDown':
				stepBy(-step);
				break;
			case 'PageUp':
				stepBy(page);
				break;
			case 'PageDown':
				stepBy(-page);
				break;
			case 'Home':
				if (!enabled || !Number.isFinite(min)) return;
				set(min);
				break;
			case 'End':
				if (!enabled || !Number.isFinite(max)) return;
				set(max);
				break;
			case 'Enter':
				commit();
				break;
			default:
				return;
		}
		event.preventDefault();
	}

	/** Steps on a vertical wheel scroll while the field has focus. */
	function wheel(node: HTMLElement) {
		const onWheel = (event: WheelEvent) => {
			if (!ref || document.activeElement !== ref || event.deltaY === 0) return;
			event.preventDefault();
			stepBy(event.deltaY < 0 ? step : -step);
		};
		node.addEventListener('wheel', onWheel, { passive: false });
		return () => node.removeEventListener('wheel', onWheel);
	}

	/** Scrubs the value by dragging sideways on the buttons, one step per 4 pixels. */
	function scrubber(node: HTMLElement) {
		let last = 0;
		let moved = false;
		let captured = false;
		const onDown = (event: PointerEvent) => {
			if (!enabled || event.button !== 0) return;
			scrubbing = true;
			moved = false;
			captured = false;
			scrub = 0;
			last = event.clientX;
		};
		const onMove = (event: PointerEvent) => {
			if (!scrubbing) return;
			// The pointer is captured only once it drags, so a plain press still clicks a button.
			if (!captured) {
				captured = true;
				node.setPointerCapture(event.pointerId);
			}
			const rtl = directionOf(node) === 'rtl';
			scrub += (event.clientX - last) * (rtl ? -1 : 1);
			last = event.clientX;
			while (Math.abs(scrub) >= 4) {
				moved = true;
				const up = scrub > 0;
				scrub += up ? -4 : 4;
				stepBy(up ? step : -step);
			}
		};
		const onUp = (event: PointerEvent) => {
			scrubbing = false;
			if (node.hasPointerCapture(event.pointerId))
				node.releasePointerCapture(event.pointerId);
		};
		// A drag that scrubbed doesn't also click the button under the pointer.
		const onClick = (event: MouseEvent) => {
			if (moved) {
				event.stopPropagation();
				event.preventDefault();
				moved = false;
			}
		};
		node.addEventListener('pointerdown', onDown);
		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerup', onUp);
		node.addEventListener('pointercancel', onUp);
		node.addEventListener('click', onClick, true);
		return () => {
			node.removeEventListener('pointerdown', onDown);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerup', onUp);
			node.removeEventListener('pointercancel', onUp);
			node.removeEventListener('click', onClick, true);
		};
	}
</script>

{#snippet buttons()}
	<span
		class="oito2-number-entry-buttons"
		data-enabled={enabled ? '' : undefined}
		{@attach scrubber}
	>
		<IconButton
			class="oito2-field-button"
			icon={Minus as IconComponent}
			label={locale.strings.decrease}
			tabindex={-1}
			disabled={!enabled || typed <= min}
			onclick={() => stepBy(-step)}
		/>
		<IconButton
			class="oito2-field-button"
			icon={Plus as IconComponent}
			label={locale.strings.increase}
			tabindex={-1}
			disabled={!enabled || typed >= max}
			onclick={() => stepBy(step)}
		/>
	</span>
{/snippet}

<div class="oito2-number-entry" {@attach wheel}>
	<TextField
		bind:ref
		bind:value={text}
		role="spinbutton"
		inputmode={decimals > 0 ? 'decimal' : 'numeric'}
		autocomplete="off"
		{readonly}
		{disabled}
		aria-valuenow={current}
		aria-valuemin={Number.isFinite(min) ? min : undefined}
		aria-valuemax={Number.isFinite(max) ? max : undefined}
		aria-valuetext={formatNumber(current, locale.locale, decimals)}
		trailing={buttons}
		{...mergeProps(rest, { oninput: () => (editing = true) })}
		onkeydown={handleKey}
		onblur={(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			commit();
			onblur?.(event);
		}}
	/>
</div>

<style>
	@layer oito2 {
		.oito2-number-entry {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		.oito2-number-entry :global(input) {
			text-align: end;
			font-variant-numeric: tabular-nums;
		}

		.oito2-number-entry-buttons {
			display: inline-flex;
			touch-action: none;
		}

		.oito2-number-entry-buttons[data-enabled] {
			cursor: ew-resize;
		}
	}
</style>
