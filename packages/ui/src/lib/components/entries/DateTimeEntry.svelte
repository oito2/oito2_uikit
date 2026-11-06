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
  A `DateEntry` and a `TimeEntry` side by side that report one combined date. An empty
  time means midnight; without a date the value is `null`. While either field holds
  invalid text the value isn't reported; once both parse it reports the combination if
  it changed. `onErrorChange` gets the date error, or else the time error.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { dateOnly, type TimeOfDay } from './date-time.js';
	import DateEntry from './DateEntry.svelte';
	import TimeEntry from './TimeEntry.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The date and time, or `null` without a date. */
		value?: Date | null;
		/** Called with each new valid combination, or `null` without a date. */
		onValueChange?: (value: Date | null) => void;
		/** Called with the date error, or else the time error, and `null` when both parse. */
		onErrorChange?: (error: string | null) => void;
		/** The earliest accepted date. */
		min?: Date;
		/** The latest accepted date. */
		max?: Date;
		/** The accessible name of the date field. Defaults to "Enter Date". */
		dateLabel?: string;
		/** The accessible name of the time field. Defaults to "Enter time". */
		timeLabel?: string;
		/** Whether both fields can't be used. */
		disabled?: boolean;
	}

	let {
		value = $bindable(null),
		onValueChange,
		onErrorChange,
		min,
		max,
		dateLabel,
		timeLabel,
		disabled,
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let strings = $derived(locale.strings);
	let date = $state<Date | null>(null);
	let time = $state<TimeOfDay | null>(null);
	let dateError: string | null = null;
	let timeError: string | null = null;
	let reportedError: string | null = null;
	let reported: Date | null = null;

	// A value set from outside splits into the two fields.
	$effect.pre(() => {
		const next = value;
		if (next === reported || (next && reported && next.getTime() === reported.getTime()))
			return;
		reported = next;
		date = next ? dateOnly(next) : null;
		time = next ? { hour: next.getHours(), minute: next.getMinutes() } : null;
	});

	function combined(): Date | null {
		if (!date) return null;
		const at = time ?? { hour: 0, minute: 0 };
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), at.hour, at.minute);
	}

	function report() {
		const error = dateError ?? timeError;
		if (error !== reportedError) {
			reportedError = error;
			onErrorChange?.(error);
		}
		if (error) return;
		const next = combined();
		if (next === reported || (next && reported && next.getTime() === reported.getTime()))
			return;
		reported = next;
		value = next;
		onValueChange?.(next);
	}
</script>

<div class={['oito2-date-time-entry', className]} {...rest}>
	<DateEntry
		class="date"
		{min}
		{max}
		{disabled}
		aria-label={dateLabel ?? strings.dateInput}
		bind:value={date}
		onValueChange={() => report()}
		onErrorChange={(error) => {
			dateError = error;
			report();
		}}
	/>
	<TimeEntry
		class="time"
		{disabled}
		aria-label={timeLabel ?? strings.timeInput}
		bind:value={time}
		onValueChange={() => report()}
		onErrorChange={(error) => {
			timeError = error;
			report();
		}}
	/>
</div>

<style>
	@layer oito2 {
		.oito2-date-time-entry {
			display: flex;
			align-items: flex-start;
			gap: var(--oito2-space-sm);
			min-width: 0;
		}

		.oito2-date-time-entry > :global(.date) {
			flex: 3;
		}

		.oito2-date-time-entry > :global(.time) {
			flex: 2;
		}
	}
</style>
