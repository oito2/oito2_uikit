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
	import { DateEntry, DateTimeEntry, TimeEntry, type TimeOfDay } from '@oito2/ui';

	const today = new Date();
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const limit = new Date(start.getFullYear(), start.getMonth() + 2, start.getDate());

	const formatTime = (time: TimeOfDay | null) =>
		time ? `${time.hour}:${String(time.minute).padStart(2, '0')}` : 'none';

	let date = $state<Date | null>(start);
	let booking = $state<Date | null>(null);
	let bookingError = $state<string | null>(null);
	let birthday = $state<Date | null>(null);
	let time = $state<TimeOfDay | null>({ hour: 9, minute: 30 });
	let alarm = $state<TimeOfDay | null>({ hour: 21, minute: 15 });
	let meeting = $state<Date | null>(null);
	let meetingError = $state<string | null>(null);
</script>

<main class="showcase-page">
	<p>
		<code>DateEntry</code> and <code>TimeEntry</code> are text fields that read a date or a time
		as the locale writes it, with the format as their hint. <code>DateTimeEntry</code> puts both side
		by side and reports one combined date. Errors show only after the field loses focus or Enter is
		pressed, and invalid text keeps the last valid value.
	</p>

	<section aria-labelledby="date-time-entry-date">
		<h2 id="date-time-entry-date">Date entry</h2>
		<p>
			It accepts the locale's compact numeric date, such as <code>2/3/2026</code> in English.
			The button at the end opens a calendar in a popover. Bind <code>value</code>, a local
			date at midnight or <code>null</code>.
		</p>
		<div class="fields">
			<DateEntry bind:value={date} aria-label="Date" />
		</div>
		<p class="note">Date: {date?.toDateString() ?? 'none'}</p>
	</section>

	<section aria-labelledby="date-time-entry-range">
		<h2 id="date-time-entry-range">Allowed dates</h2>
		<p>
			Dates outside <code>min</code> and <code>max</code>, or refused by
			<code>isDateAllowed</code>, are out of range. This one takes the next two months,
			weekdays only; <code>onErrorChange</code> reports the error text.
		</p>
		<div class="fields">
			<DateEntry
				bind:value={booking}
				min={start}
				max={limit}
				isDateAllowed={(day) => day.getDay() !== 0 && day.getDay() !== 6}
				onErrorChange={(error) => (bookingError = error)}
				aria-label="Booking date"
			/>
		</div>
		<p class="note">
			Booking: {booking?.toDateString() ?? 'none'} · Error: {bookingError ?? 'none'}
		</p>
	</section>

	<section aria-labelledby="date-time-entry-options">
		<h2 id="date-time-entry-options">Without the picker, and disabled</h2>
		<p>
			<code>pickerButton=&#123;false&#125;</code> leaves only the text field. A disabled entry can't
			be edited and its button doesn't open.
		</p>
		<div class="fields">
			<DateEntry bind:value={birthday} pickerButton={false} aria-label="Birthday" />
			<DateEntry value={start} disabled aria-label="Date (disabled)" />
		</div>
	</section>

	<section aria-labelledby="date-time-entry-time">
		<h2 id="date-time-entry-time">Time entry</h2>
		<p>
			It accepts <code>H:MM</code> and <code>HH:MM</code> with an optional AM/PM marker and
			shows the time as the locale writes it, unless <code>use24Hour</code> says otherwise.
			Bind
			<code>value</code>, an object with <code>hour</code> and <code>minute</code>.
		</p>
		<div class="fields">
			<TimeEntry bind:value={time} aria-label="Start time" />
			<TimeEntry bind:value={alarm} use24Hour aria-label="Alarm, 24-hour clock" />
			<TimeEntry bind:value={alarm} use24Hour={false} aria-label="Alarm, 12-hour clock" />
			<TimeEntry value={{ hour: 12, minute: 0 }} disabled aria-label="Time (disabled)" />
		</div>
		<p class="note">Start: {formatTime(time)} · Alarm: {formatTime(alarm)}</p>
	</section>

	<section aria-labelledby="date-time-entry-combined">
		<h2 id="date-time-entry-combined">Date and time</h2>
		<p>
			An empty time means midnight; without a date the value is <code>null</code>. While
			either field holds invalid text the value isn't reported. <code>dateLabel</code> and
			<code>timeLabel</code> name the two fields.
		</p>
		<DateTimeEntry
			bind:value={meeting}
			min={start}
			onErrorChange={(error) => (meetingError = error)}
			dateLabel="Meeting date"
			timeLabel="Meeting time"
		/>
		<p class="note">
			Meeting: {meeting?.toLocaleString() ?? 'none'} · Error: {meetingError ?? 'none'}
		</p>
		<DateTimeEntry
			value={start}
			disabled
			dateLabel="Date (disabled)"
			timeLabel="Time (disabled)"
		/>
	</section>
</main>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
		gap: var(--oito2-space-md);
	}
</style>
