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

/** Returns the ISO 8601 week number of `date`: weeks start on Monday and week 1 holds the year's first Thursday. */
export function isoWeekNumber(date: Date): number {
	const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	const weekday = new Date(day).getUTCDay() || 7;
	const thursday = new Date(day + (4 - weekday) * 86_400_000);
	const firstOfYear = Date.UTC(thursday.getUTCFullYear(), 0, 1);
	return Math.floor((thursday.getTime() - firstOfYear) / 86_400_000 / 7) + 1;
}

/** Returns the number of days of `month` (0 to 11) in `year`. */
export function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/** Returns `date` moved by `days` days, at midnight. */
export function addDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Returns the same day number `months` months away, kept within that month's length. */
export function addMonths(date: Date, months: number): Date {
	const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
	const length = daysInMonth(first.getFullYear(), first.getMonth());
	return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), length));
}

/** Whether `a` and `b` fall on the same day. */
export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
	return (
		!!a &&
		!!b &&
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/**
 * Returns the first day of the week of `locale`, from 0 (Sunday) to 6 (Saturday): Sunday
 * for English and Portuguese, as Flutter's Material calendar has it, else the engine's
 * week info for the locale when it has one, else Monday.
 */
export function firstDayOfWeek(locale: string): number {
	const intl = new Intl.Locale(locale.replace('_', '-'));
	if (intl.language === 'en' || intl.language === 'pt') return 0;
	type WithWeekInfo = Intl.Locale & {
		getWeekInfo?: () => { firstDay: number };
		weekInfo?: { firstDay: number };
	};
	const info = (intl as WithWeekInfo).getWeekInfo?.() ?? (intl as WithWeekInfo).weekInfo;
	return info ? info.firstDay % 7 : 1;
}

/**
 * Returns the weeks of the month of `month` (any day in it) as rows of seven days, the
 * week starting on `weekStart` (0 is Sunday); days of the neighboring months are `null`.
 */
export function monthWeeks(month: Date, weekStart: number): (Date | null)[][] {
	const year = month.getFullYear();
	const index = month.getMonth();
	const offset = (new Date(year, index, 1).getDay() - weekStart + 7) % 7;
	const length = daysInMonth(year, index);
	const weeks: (Date | null)[][] = [];
	for (let start = -offset; start < length; start += 7) {
		const week: (Date | null)[] = [];
		for (let i = 0; i < 7; i++) {
			const day = start + i + 1;
			week.push(day >= 1 && day <= length ? new Date(year, index, day) : null);
		}
		weeks.push(week);
	}
	return weeks;
}

/** A range of dates, both days included. */
export interface DateRange {
	readonly start: Date;
	readonly end: Date;
}
