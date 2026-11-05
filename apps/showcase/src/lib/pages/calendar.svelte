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

<script lang="ts">
	import { Calendar, DatePicker, type DateRange } from '@oito2/ui';

	const today = new Date();

	/** Returns the date `days` days after today, at midnight. */
	function fromToday(days: number): Date {
		return new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
	}

	/** Formats a range as "start – end", or "none". */
	function formatRange(value: DateRange | null): string {
		return value
			? `${value.start.toLocaleDateString()} – ${value.end.toLocaleDateString()}`
			: 'none';
	}

	let date = $state<Date | null>(today);
	let range = $state<DateRange | null>({ start: fromToday(2), end: fromToday(6) });
	let workday = $state<Date | null>(null);
	let due = $state<Date | null>(null);
	let trip = $state<DateRange | null>(null);

	const min = fromToday(-7);
	const max = fromToday(30);
</script>

<main class="showcase-page">
	<p>
		<code>Calendar</code> is a month grid that picks one date, or a range with
		<code>range</code>. Arrows move by day and week, Page Up and Page Down by month, Home and
		End to the ends of the week. <code>DatePicker</code> is a button that opens the same calendar
		in a popover.
	</p>

	<section aria-labelledby="calendar-single">
		<h2 id="calendar-single">Single date and range</h2>
		<p>The first calendar shows ISO week numbers; the second selects a range in two clicks.</p>
		<div class="row top">
			<Calendar bind:value={date} showWeekNumbers />
			<Calendar range bind:rangeValue={range} />
		</div>
		<p class="note">
			Date: {date?.toLocaleDateString() ?? 'none'} · Range: {formatRange(range)}
		</p>
	</section>

	<section aria-labelledby="calendar-limits">
		<h2 id="calendar-limits">Limits and allowed dates</h2>
		<p>
			<code>min</code> and <code>max</code> bound the dates from a week ago to thirty days
			ahead;
			<code>isDateAllowed</code> turns weekends off.
		</p>
		<div class="row top">
			<Calendar
				bind:value={workday}
				{min}
				{max}
				isDateAllowed={(day) => day.getDay() !== 0 && day.getDay() !== 6}
			/>
		</div>
		<p class="note">Workday: {workday?.toLocaleDateString() ?? 'none'}</p>
	</section>

	<section aria-labelledby="calendar-picker">
		<h2 id="calendar-picker">Date picker</h2>
		<p>The button shows the chosen date, or the placeholder until there is one.</p>
		<div class="row">
			<DatePicker bind:value={due} placeholder="Pick a due date" aria-label="Due date" />
			<DatePicker range bind:rangeValue={trip} placeholder="Trip dates" aria-label="Trip" />
			<DatePicker
				bind:value={workday}
				{min}
				{max}
				showWeekNumbers
				aria-label="Workday with week numbers"
			/>
		</div>
		<p class="note">Due: {due?.toLocaleDateString() ?? 'none'} · Trip: {formatRange(trip)}</p>
	</section>
</main>
