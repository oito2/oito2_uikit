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
  A month grid that picks a date, or a range of dates with `range`. The header changes the
  month. The grid has one Tab stop, the focused day: the arrows move by a day or a week,
  Home and End to the start and end of the week, Page Up and Page Down by a month (a year
  with Shift), and Enter or Space picks the focused day. A range takes two picks, in any
  order. Days outside `min` and `max`, or refused by `isDateAllowed`, can't be picked.
  Week numbers follow ISO 8601. Bind `value`, or `rangeValue` in range mode.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { tick, untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import { dateTimeStrings } from '../../l10n/material.js';
	import IconButton from '../button/IconButton.svelte';
	import { dateOnly } from '../entries/date-time.js';
	import type { IconComponent } from '../icon.js';
	import {
		addDays,
		addMonths,
		firstDayOfWeek,
		isoWeekNumber,
		monthWeeks,
		sameDay,
		type DateRange
	} from './calendar-math.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The picked date, in single mode. */
		value?: Date | null;
		/** Called with each picked date, in single mode. */
		onValueChange?: (value: Date) => void;
		/** Whether the calendar picks a range. */
		range?: boolean;
		/** The picked range, in range mode. */
		rangeValue?: DateRange | null;
		/** Called with each completed range. */
		onRangeChange?: (range: DateRange) => void;
		/** The earliest date that can be picked. */
		min?: Date;
		/** The latest date that can be picked. */
		max?: Date;
		/** Decides which days within the limits can be picked. */
		isDateAllowed?: (date: Date) => boolean;
		/** The day marked as today. Defaults to the current date. */
		today?: Date;
		/** Whether a week number column shows. */
		showWeekNumbers?: boolean;
		/** Whether the focused day takes focus when the calendar shows. */
		autofocus?: boolean;
		/** The calendar element. */
		ref?: HTMLDivElement | null;
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
		today = new Date(),
		showWeekNumbers = false,
		autofocus = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	const locale = useLocale();
	let strings = $derived(dateTimeStrings(locale.locale));
	let intl = $derived(locale.locale.replace('_', '-'));
	let weekStart = $derived(firstDayOfWeek(locale.locale));
	let todayDate = $derived(dateOnly(today));

	/** Returns `day` kept within the limits. */
	function clamp(day: Date): Date {
		if (min && day < dateOnly(min)) return dateOnly(min);
		if (max && day > dateOnly(max)) return dateOnly(max);
		return day;
	}

	function canPick(day: Date): boolean {
		return clamp(day).getTime() === day.getTime() && (isDateAllowed?.(day) ?? true);
	}

	let focused = $state(untrack(() => clamp(dateOnly(value ?? rangeValue?.start ?? today))));
	let month = $derived(new Date(focused.getFullYear(), focused.getMonth(), 1));
	let pending = $state<Date | null>(null);
	let hovered = $state<Date | null>(null);
	let gridFocused = $state(false);
	let grid = $state<HTMLTableElement | null>(null);

	// A selection changed from outside moves the focused day there.
	$effect.pre(() => {
		const selected = value ?? rangeValue?.start ?? null;
		if (selected && !untrack(() => sameDay(selected, focused)))
			focused = clamp(dateOnly(selected));
	});

	let canGoBack = $derived(
		!min || month > new Date(dateOnly(min).getFullYear(), dateOnly(min).getMonth(), 1)
	);
	let canGoForward = $derived(
		!max || month < new Date(dateOnly(max).getFullYear(), dateOnly(max).getMonth(), 1)
	);
	let weeks = $derived(monthWeeks(month, weekStart));
	let weekdays = $derived.by(() => {
		const narrow = new Intl.DateTimeFormat(intl, { weekday: 'narrow' });
		const long = new Intl.DateTimeFormat(intl, { weekday: 'long' });
		// 2023-01-01 was a Sunday.
		return Array.from({ length: 7 }, (_, i) => {
			const day = new Date(2023, 0, 1 + ((weekStart + i) % 7));
			return { narrow: narrow.format(day), long: long.format(day) };
		});
	});
	let title = $derived(
		new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric' }).format(month)
	);
	let fullDate = $derived(new Intl.DateTimeFormat(intl, { dateStyle: 'full' }));

	/** Moves the focused day to `day`, kept within the limits, and focuses it. */
	async function focusDay(day: Date) {
		focused = clamp(day);
		await tick();
		grid?.querySelector<HTMLElement>('[data-focused]')?.focus();
	}

	/** Shows the month `delta` months away, focusing the same day number in it. */
	function showMonth(delta: number) {
		focused = clamp(addMonths(focused, delta));
	}

	/** Picks `day`: reports it, or starts or completes a range. */
	function pick(day: Date) {
		if (!canPick(day)) return;
		focused = day;
		if (!range) {
			value = day;
			onValueChange?.(day);
			return;
		}
		if (!pending) {
			pending = day;
			return;
		}
		const next = day < pending ? { start: day, end: pending } : { start: pending, end: day };
		pending = null;
		hovered = null;
		rangeValue = next;
		onRangeChange?.(next);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const rtl = grid ? directionOf(grid) === 'rtl' : false;
		const offset = (focused.getDay() - weekStart + 7) % 7;
		let target: Date;
		switch (event.key) {
			case 'ArrowLeft':
				target = addDays(focused, rtl ? 1 : -1);
				break;
			case 'ArrowRight':
				target = addDays(focused, rtl ? -1 : 1);
				break;
			case 'ArrowUp':
				target = addDays(focused, -7);
				break;
			case 'ArrowDown':
				target = addDays(focused, 7);
				break;
			case 'Home':
				target = addDays(focused, -offset);
				break;
			case 'End':
				target = addDays(focused, 6 - offset);
				break;
			case 'PageUp':
			case 'PageDown':
				target = addMonths(
					focused,
					(event.shiftKey ? 12 : 1) * (event.key === 'PageUp' ? -1 : 1)
				);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				pick(focused);
				return;
			default:
				return;
		}
		event.preventDefault();
		void focusDay(target);
	}

	/** Where `day` sits in the shown selection; a range in progress previews to the hovered or focused day. */
	function stateOf(day: Date) {
		if (!range)
			return { selected: sameDay(day, value), inRange: false, start: false, end: false };
		let start: Date | null = null;
		let end: Date | null = null;
		if (pending) {
			const other = hovered ?? (gridFocused ? focused : null) ?? pending;
			[start, end] = other < pending ? [other, pending] : [pending, other];
		} else if (rangeValue) {
			start = dateOnly(rangeValue.start);
			end = dateOnly(rangeValue.end);
		}
		if (!start || !end) return { selected: false, inRange: false, start: false, end: false };
		const isStart = sameDay(day, start);
		const isEnd = sameDay(day, end);
		return {
			selected: isStart || isEnd,
			inRange: day >= start && day <= end,
			start: isStart,
			end: isEnd
		};
	}

	$effect(() => {
		if (autofocus) untrack(() => grid?.querySelector<HTMLElement>('[data-focused]')?.focus());
	});
</script>

<div
	bind:this={ref}
	class={['oito2-calendar', className]}
	data-week-numbers={showWeekNumbers ? '' : undefined}
	{...rest}
>
	<div class="header">
		<span class="title" id="{id}-title" aria-live="polite">{title}</span>
		<IconButton
			class="oito2-calendar-nav"
			icon={ChevronLeft as IconComponent}
			label={strings.previousMonth}
			disabled={!canGoBack}
			onclick={() => showMonth(-1)}
		/>
		<IconButton
			class="oito2-calendar-nav"
			icon={ChevronRight as IconComponent}
			label={strings.nextMonth}
			disabled={!canGoForward}
			onclick={() => showMonth(1)}
		/>
	</div>
	<table
		bind:this={grid}
		role="grid"
		aria-labelledby="{id}-title"
		aria-multiselectable={range || undefined}
		onfocusin={() => (gridFocused = true)}
		onfocusout={(event) => {
			if (!grid?.contains(event.relatedTarget as Node | null)) gridFocused = false;
		}}
		onpointerleave={() => (hovered = null)}
		{onkeydown}
	>
		<thead>
			<tr>
				{#if showWeekNumbers}<th scope="col" class="muted"
						><abbr title={locale.strings.weekNumberHeading}
							>{locale.strings.weekNumberHeading}</abbr
						></th
					>{/if}
				{#each weekdays as weekday (weekday.long)}
					<th scope="col" class="muted"
						><abbr title={weekday.long}>{weekday.narrow}</abbr></th
					>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each weeks as week, row (row)}
				<tr>
					{#if showWeekNumbers}
						{@const known = week.find((day) => day !== null) ?? month}
						{@const week1 = isoWeekNumber(addDays(known, 3 - week.indexOf(known)))}
						<th
							scope="row"
							class="muted week"
							aria-label={locale.strings.weekNumber(week1)}
						>
							{week1}
						</th>
					{/if}
					{#each week as day, column (column)}
						<td role="gridcell" aria-selected={day ? stateOf(day).selected : undefined}>
							{#if day}
								{@const state = stateOf(day)}
								{@const enabled = canPick(day)}
								<button
									type="button"
									tabindex={sameDay(day, focused) ? 0 : -1}
									aria-label={fullDate.format(day)}
									aria-current={sameDay(day, todayDate) ? 'date' : undefined}
									aria-disabled={enabled ? undefined : true}
									class="day"
									data-focused={sameDay(day, focused) ? '' : undefined}
									data-selected={state.selected ? '' : undefined}
									data-in-range={state.inRange && !(state.start && state.end)
										? ''
										: undefined}
									data-range-start={state.start ? '' : undefined}
									data-range-end={state.end ? '' : undefined}
									data-today={sameDay(day, todayDate) ? '' : undefined}
									data-disabled={enabled ? undefined : ''}
									onclick={() => {
										focused = day;
										pick(day);
									}}
									onpointerenter={() => {
										if (pending) hovered = day;
									}}
								>
									{day.getDate()}
								</button>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	@layer oito2 {
		.oito2-calendar {
			--oito2-calendar-cell: calc(var(--oito2-control-height) + 2px);
			display: inline-flex;
			flex-direction: column;
			width: calc(var(--oito2-calendar-cell) * 7);
			color: var(--oito2-color-on-surface);
		}

		[data-week-numbers] {
			width: calc(var(--oito2-calendar-cell) * 8);
		}

		.header {
			display: flex;
			align-items: center;
		}

		.title {
			flex: 1;
			padding-inline-start: var(--oito2-space-sm);
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
		}

		.header :global(.oito2-calendar-nav:dir(rtl) svg) {
			scale: -1 1;
		}

		table {
			border-collapse: collapse;
			border-spacing: 0;
			table-layout: fixed;
		}

		th,
		td {
			width: var(--oito2-calendar-cell);
			padding: 0;
			text-align: center;
		}

		th {
			height: calc(var(--oito2-calendar-cell) * 0.75);
			font-weight: normal;
		}

		.muted {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-small);
			letter-spacing: var(--oito2-type-label-small-tracking);
		}

		.week {
			height: var(--oito2-calendar-cell);
		}

		abbr {
			text-decoration: none;
		}

		td {
			height: var(--oito2-calendar-cell);
		}

		.day {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: var(--oito2-calendar-cell);
			height: var(--oito2-calendar-cell);
			margin: 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: none;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			cursor: pointer;
		}

		.day:not([data-disabled]):not([data-selected]):hover {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 8%, transparent);
		}

		.day:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: calc(-1 * var(--oito2-size-focus-border-width));
		}

		[data-today] {
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
			font-weight: 600;
		}

		[data-in-range] {
			border-radius: 0;
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		[data-in-range][data-range-start] {
			background: linear-gradient(
				to var(--oito2-calendar-band-end, right),
				transparent 50%,
				var(--oito2-color-secondary-container) 50%
			);
		}

		[data-in-range][data-range-end] {
			background: linear-gradient(
				to var(--oito2-calendar-band-start, left),
				transparent 50%,
				var(--oito2-color-secondary-container) 50%
			);
		}

		.oito2-calendar:dir(rtl) {
			--oito2-calendar-band-end: left;
			--oito2-calendar-band-start: right;
		}

		[data-selected]::before {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-selected-fill);
		}

		[data-selected] {
			z-index: 0;
			box-shadow: none;
			color: var(--oito2-color-on-selected-fill);
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}
	}
</style>
