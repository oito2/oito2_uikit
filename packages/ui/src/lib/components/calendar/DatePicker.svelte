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
  A field-like button that shows a date, or a date range with `range`, and opens a
  `Calendar` in a popover to change it. Enter, Space or Alt+Down opens the calendar, which
  takes focus; a pick closes it. Bind `value`, or `rangeValue` in range mode.
-->
<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { dateTimeStrings } from '../../l10n/material.js';
	import { formatCompactDate } from '../entries/date-time.js';
	import * as Popover from '../popover/popover/index.js';
	import Calendar from './Calendar.svelte';
	import type { DateRange } from './calendar-math.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The picked date, in single mode. */
		value?: Date | null;
		/** Called with each picked date. */
		onValueChange?: (value: Date) => void;
		/** Whether the picker picks a range. */
		range?: boolean;
		/** The picked range, in range mode. */
		rangeValue?: DateRange | null;
		/** Called with each picked range. */
		onRangeChange?: (range: DateRange) => void;
		/** The earliest date that can be picked. */
		min?: Date;
		/** The latest date that can be picked. */
		max?: Date;
		/** Decides which days within the limits can be picked. */
		isDateAllowed?: (date: Date) => boolean;
		/** The text shown when nothing is picked. Defaults to the date format hint. */
		placeholder?: string;
		/** Whether the calendar shows week numbers. */
		showWeekNumbers?: boolean;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		value = $bindable(null),
		onValueChange,
		range = false,
		rangeValue = $bindable(null),
		onRangeChange,
		min,
		max,
		isDateAllowed,
		placeholder,
		showWeekNumbers = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		'aria-label': ariaLabel,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let strings = $derived(dateTimeStrings(locale.locale));
	let open = $state(false);
	let display = $derived.by(() => {
		if (range)
			return rangeValue
				? locale.strings.dateRange(
						formatCompactDate(rangeValue.start, locale.locale),
						formatCompactDate(rangeValue.end, locale.locale)
					)
				: '';
		return value ? formatCompactDate(value, locale.locale) : '';
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				type="button"
				{disabled}
				class={['oito2-date-picker', className]}
				data-empty={display ? undefined : ''}
				aria-label={ariaLabel
					? `${ariaLabel}: ${display || placeholder || strings.dateHelp}`
					: undefined}
				{...rest}
				{...props}
				onkeydown={(event) => {
					if (event.altKey && event.key === 'ArrowDown') {
						event.preventDefault();
						open = true;
					}
				}}
			>
				<span class="text">{display || placeholder || strings.dateHelp}</span>
				<CalendarIcon size={18} aria-hidden="true" />
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		aria-label={strings.selectDate}
		focusOnOpen={false}
		class="oito2-date-picker-panel"
	>
		<Calendar
			{value}
			{range}
			{rangeValue}
			{min}
			{max}
			{isDateAllowed}
			{showWeekNumbers}
			autofocus
			onValueChange={(next) => {
				value = next;
				onValueChange?.(next);
				open = false;
			}}
			onRangeChange={(next) => {
				rangeValue = next;
				onRangeChange?.(next);
				open = false;
			}}
		/>
	</Popover.Content>
</Popover.Root>

<style>
	@layer oito2 {
		.oito2-date-picker {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			min-width: 0;
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
			text-align: start;
			cursor: pointer;
		}

		.oito2-date-picker:focus-visible,
		.oito2-date-picker[data-state='open'] {
			border-color: var(--oito2-color-primary-text);
			outline: none;
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		[data-empty] .text {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
		}

		.text {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.oito2-date-picker :global(svg) {
			flex: none;
			color: var(--oito2-color-on-surface-variant);
		}

		.oito2-date-picker:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		:global(.oito2-date-picker-panel) {
			padding: var(--oito2-space-sm);
		}
	}
</style>
