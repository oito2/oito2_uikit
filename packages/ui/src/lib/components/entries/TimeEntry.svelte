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
  A time text field that accepts `H:MM` and `HH:MM`, with an optional AM/PM marker. It
  shows times as the locale writes them, `9:30 PM` or `21:30`, unless `use24Hour` says
  otherwise. The error shows after the field loses focus or Enter is pressed; invalid text
  keeps the last valid value. Bind `value` (`{ hour, minute }`, or `null`).
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { formatTime, parseTime, uses12HourClock, type TimeOfDay } from './date-time.js';
	import ParsedEntry from './ParsedEntry.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value'> {
		/** The time, or `null` for none. */
		value?: TimeOfDay | null;
		/** Called with each new valid time, or `null` when the field is emptied. */
		onValueChange?: (value: TimeOfDay | null) => void;
		/** Called with the error when the text stops being a valid time, and `null` when it is again. */
		onErrorChange?: (error: string | null) => void;
		/** Whether times show with a 24-hour clock. Defaults to the locale's clock. */
		use24Hour?: boolean;
		/** Whether an empty field is valid. Defaults to true. */
		acceptEmpty?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(null),
		onValueChange,
		onErrorChange,
		use24Hour,
		acceptEmpty = true,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const locale = useLocale();
	let strings = $derived(locale.strings);
	let twentyFour = $derived(use24Hour ?? !uses12HourClock(locale.locale));

	function parse(text: string): { value: TimeOfDay | null } | { error: string } {
		if (!text.trim()) return acceptEmpty ? { value: null } : { error: strings.invalidTime };
		const time = parseTime(text, strings.am, strings.pm);
		return time ? { value: time } : { error: strings.invalidTime };
	}
</script>

<ParsedEntry
	bind:ref
	{value}
	format={(time: TimeOfDay) =>
		formatTime(time, { use24Hour: twentyFour, am: strings.am, pm: strings.pm })}
	{parse}
	same={(a: TimeOfDay | null, b: TimeOfDay | null) =>
		a === null ? b === null : b !== null && a.hour === b.hour && a.minute === b.minute}
	onValueChange={(next: TimeOfDay | null) => {
		value = next;
		onValueChange?.(next);
	}}
	{onErrorChange}
	autocomplete="off"
	{...rest}
/>
