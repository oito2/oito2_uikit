// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/** A time of day, without a date. */
export interface TimeOfDay {
	/** The hour, from 0 to 23. */
	readonly hour: number;
	/** The minute, from 0 to 59. */
	readonly minute: number;
}

/** Maps a BCP 47 locale such as `pt_BR` to the form `Intl` takes. */
function intlLocale(locale: string): string {
	return locale.replace('_', '-');
}

/** The numeric compact date format of `locale`: day, month and year in the locale's order. */
function compactFormat(locale: string): Intl.DateTimeFormat {
	return new Intl.DateTimeFormat(intlLocale(locale), {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});
}

/** Formats `date` in the compact numeric form of `locale`, such as `2/3/2026` or `03/02/2026`. */
export function formatCompactDate(date: Date, locale: string): string {
	return compactFormat(locale).format(date);
}

/** The bidirectional marks some locales put around date separators. */
const directionMarks = /[\u200e\u200f\u061c]/gu;

/**
 * Returns the ten digits `format` writes, from zero to nine: Arabic-Indic ones such as
 * `٣` for `ar-EG`, Latin ones for most locales.
 */
function digitsOf(locale: string, format: Intl.DateTimeFormat): string[] {
	return [
		...new Intl.NumberFormat(intlLocale(locale), {
			useGrouping: false,
			numberingSystem: format.resolvedOptions().numberingSystem
		}).format(9876543210)
	].reverse();
}

/**
 * Parses `text` written in the compact numeric date form of `locale` (the day, month and
 * year in the locale's order, separated as the locale separates them, with or without
 * leading zeros, in the locale's digits or Latin ones) and returns the local date at
 * midnight, or `null` when it isn't a real date in that form.
 */
export function parseCompactDate(text: string, locale: string): Date | null {
	const format = compactFormat(locale);
	const parts = format.formatToParts(new Date(2001, 10, 22));
	const digits = digitsOf(locale, format);
	const digit = `[0-9${digits.join('').replace(/[\]\\^-]/g, '\\$&')}]`;
	const order: ('day' | 'month' | 'year')[] = [];
	let pattern = '^';
	for (const part of parts) {
		if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
			order.push(part.type);
			pattern += part.type === 'year' ? `(${digit}{1,4})` : `(${digit}{1,2})`;
		} else if (part.type === 'literal') {
			pattern += part.value
				.replace(directionMarks, '')
				.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
				.replace(/\s+/g, '\\s*');
		}
	}
	const match = new RegExp(`${pattern}$`, 'u').exec(text.replace(directionMarks, '').trim());
	if (!match) return null;
	/** Reads a number written in the locale's digits or Latin ones. */
	const toNumber = (written: string) =>
		Number(
			[...written]
				.map((char) => {
					const index = digits.indexOf(char);
					return index >= 0 ? String(index) : char;
				})
				.join('')
		);
	const value = { day: 0, month: 0, year: 0 };
	order.forEach((field, index) => (value[field] = toNumber(match[index + 1] ?? '')));
	const date = new Date(value.year, value.month - 1, value.day);
	date.setFullYear(value.year);
	const valid =
		date.getFullYear() === value.year &&
		date.getMonth() === value.month - 1 &&
		date.getDate() === value.day;
	return valid ? date : null;
}

/** Returns `date` at midnight. */
export function dateOnly(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const timePattern = /^\s*(\D*?)\s*(\d{1,2})\s*[:.hH]\s*(\d{2})\s*(\S*)\s*$/u;

/**
 * Parses `text` as `H:MM` or `HH:MM` (also with `.` or `h` as the separator), with an
 * optional day-period marker before or after the time: `am` or `pm` (any case, or the
 * locale's own markers), or the letters a and p. Without a marker the hour must be 0 to
 * 23; with one, 1 to 12. Returns `null` for anything else.
 */
export function parseTime(text: string, am = 'AM', pm = 'PM'): TimeOfDay | null {
	const match = timePattern.exec(text);
	if (!match) return null;
	const prefix = (match[1] ?? '').toLowerCase();
	let hour = Number(match[2]);
	const minute = Number(match[3]);
	const suffix = (match[4] ?? '').toLowerCase();
	if (minute > 59) return null;
	if (prefix && suffix) return null;
	const marker = suffix || prefix;
	if (!marker) return hour > 23 ? null : { hour, minute };
	const isAm = marker === am.toLowerCase() || marker === 'a' || marker === 'am';
	const isPm = marker === pm.toLowerCase() || marker === 'p' || marker === 'pm';
	if (!isAm && !isPm) return null;
	if (hour < 1 || hour > 12) return null;
	hour = (hour % 12) + (isPm ? 12 : 0);
	return { hour, minute };
}

/** Whether `locale` writes times with a 12-hour clock. */
export function uses12HourClock(locale: string): boolean {
	const cycle = new Intl.DateTimeFormat(intlLocale(locale), { hour: 'numeric' }).resolvedOptions()
		.hourCycle;
	return cycle === 'h11' || cycle === 'h12';
}

/**
 * Formats `time` as Flutter's Material widgets do: `9:30 PM` with a 12-hour clock and
 * `21:30` (hour zero-padded) with a 24-hour one, which defaults to the locale's.
 */
export function formatTime(
	time: TimeOfDay,
	options: { use24Hour: boolean; am?: string; pm?: string }
): string {
	const minute = String(time.minute).padStart(2, '0');
	if (options.use24Hour) return `${String(time.hour).padStart(2, '0')}:${minute}`;
	const hour = time.hour % 12 === 0 ? 12 : time.hour % 12;
	return `${hour}:${minute} ${time.hour < 12 ? (options.am ?? 'AM') : (options.pm ?? 'PM')}`;
}
