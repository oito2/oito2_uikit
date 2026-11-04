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
  A date text field that accepts the locale's compact numeric date (such as `2/3/2026` in
  English or `03/02/2026` in Portuguese), with the format as its hint. Dates outside `min`
  and `max`, or refused by `isDateAllowed`, are out of range. The error shows after the
  field loses focus or Enter is pressed; invalid text keeps the last valid value. Bind
  `value` (a local date at midnight, or `null`).
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { dateTimeStrings } from '../../l10n/material.js';
	import { dateOnly, formatCompactDate, parseCompactDate } from './date-time.js';
	import ParsedEntry from './ParsedEntry.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value' | 'min' | 'max'> {
		/** The date, or `null` for none. */
		value?: Date | null;
		/** Called with each new valid date, or `null` when the field is emptied. */
		onValueChange?: (value: Date | null) => void;
		/** Called with the error when the text stops being a valid date, and `null` when it is again. */
		onErrorChange?: (error: string | null) => void;
		/** The earliest accepted date. */
		min?: Date;
		/** The latest accepted date. */
		max?: Date;
		/** Decides which days within the limits are accepted. */
		isDateAllowed?: (date: Date) => boolean;
		/** Whether an empty field is valid. Defaults to true. */
		acceptEmpty?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(null),
		onValueChange,
		onErrorChange,
		min,
		max,
		isDateAllowed,
		acceptEmpty = true,
		placeholder,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const locale = useLocale();
	let strings = $derived(dateTimeStrings(locale.locale));

	function parse(text: string): { value: Date | null } | { error: string } {
		if (!text.trim())
			return acceptEmpty ? { value: null } : { error: strings.invalidDateFormat };
		const date = parseCompactDate(text, locale.locale);
		if (!date) return { error: strings.invalidDateFormat };
		const tooEarly = min !== undefined && date < dateOnly(min);
		const tooLate = max !== undefined && date > dateOnly(max);
		if (tooEarly || tooLate || !(isDateAllowed?.(date) ?? true))
			return { error: strings.dateOutOfRange };
		return { value: date };
	}
</script>

<ParsedEntry
	bind:ref
	{value}
	format={(date: Date) => formatCompactDate(date, locale.locale)}
	{parse}
	same={(a: Date | null, b: Date | null) =>
		a === null ? b === null : b !== null && a.getTime() === b.getTime()}
	onValueChange={(next: Date | null) => {
		value = next;
		onValueChange?.(next);
	}}
	{onErrorChange}
	inputmode="numeric"
	autocomplete="off"
	placeholder={placeholder ?? strings.dateHelp}
	{...rest}
/>
