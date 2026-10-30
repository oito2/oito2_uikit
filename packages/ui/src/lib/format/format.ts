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

import { en } from '../l10n/en.js';
import { useLocale } from '../l10n/locale.js';
import type { Localizations, TimeUnit } from '../l10n/localizations.js';

/** The units of `Format.bytes`: powers of 1000 (kB, MB) or of 1024 (KiB, MiB). */
export type ByteUnits = 'si' | 'iec';

const unitNames: Readonly<Record<ByteUnits, readonly string[]>> = {
	si: ['B', 'kB', 'MB', 'GB', 'TB', 'PB'],
	iec: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
};

// Returns a locale the runtime formats numbers for, or English.
function supportedLocale(locale: string): string {
	const tag = locale.replaceAll('_', '-');
	try {
		return Intl.NumberFormat.supportedLocalesOf([tag])[0] ?? 'en';
	} catch {
		// Malformed tags throw a RangeError.
		return 'en';
	}
}

/**
 * Locale-aware formatting of byte sizes, compact numbers and relative times, such as
 * "1.5 MB", "1.23K" and "3 minutes ago". Numbers follow `locale` through `Intl`; relative
 * times use the localized `strings`. Plain numbers, dates and times use `Intl` directly.
 */
export class Format {
	/** The BCP 47 locale of the number formats; unknown locales fall back to `en`. */
	readonly locale: string;

	/** The relative-time strings. */
	readonly strings: Localizations;

	constructor(options: { locale?: string; strings?: Localizations } = {}) {
		this.locale = supportedLocale(options.locale ?? 'en');
		this.strings = options.strings ?? en;
	}

	/**
	 * Formats a byte count, such as `1536` as "1.5 kB" (or "1,5 kB" in Portuguese), with
	 * at most `fractionDigits` decimals. Picks the largest unit, up to petabytes, that keeps
	 * the value at least 1; counts below one kilobyte keep no decimals, and a value that
	 * rounds up to the base moves to the next unit. Negative counts keep their sign.
	 */
	bytes(bytes: number, options: { units?: ByteUnits; fractionDigits?: number } = {}): string {
		const units = options.units ?? 'si';
		const fractionDigits = options.fractionDigits ?? 1;
		const base = units === 'si' ? 1000 : 1024;
		const names = unitNames[units];
		const sign = bytes < 0 ? '-' : '';
		let value = Math.abs(bytes);
		let unit = 0;
		while (value >= base && unit < names.length - 1) {
			value /= base;
			unit++;
		}
		const factor = 10 ** (unit === 0 ? 0 : fractionDigits);
		if (unit > 0 && unit < names.length - 1 && Math.round(value * factor) / factor >= base) {
			value /= base;
			unit++;
		}
		const number = new Intl.NumberFormat(this.locale, {
			maximumFractionDigits: unit === 0 ? 0 : fractionDigits
		}).format(value);
		return `${sign}${number} ${names[unit]}`;
	}

	/** Formats `value` compactly with three significant digits, such as `1234` as "1.23K". */
	compactNumber(value: number): string {
		return new Intl.NumberFormat(this.locale, {
			notation: 'compact',
			maximumSignificantDigits: 3
		}).format(value);
	}

	/**
	 * Describes `time` relative to `now`, such as "3 minutes ago" or "in 2 days". Within 45
	 * seconds it reads as `strings.justNow`; larger differences round to minutes below 45
	 * minutes, hours below 22 hours, days below six and a half days, weeks below 30 days,
	 * months (of 30 days) below 365 days and years beyond.
	 */
	relativeTime(time: Date, now: Date = new Date()): string {
		const difference = time.getTime() - now.getTime();
		const future = difference >= 0;
		const seconds = Math.abs(Math.trunc(difference / 1000));
		if (seconds < 45) return this.strings.justNow;
		let count: number;
		let unit: TimeUnit;
		if (seconds < 45 * 60) [count, unit] = [Math.max(1, Math.round(seconds / 60)), 'minute'];
		else if (seconds < 22 * 3600) [count, unit] = [Math.round(seconds / 3600), 'hour'];
		// Six and a half days round to a week, not to "7 days".
		else if (seconds < 13 * 43200) [count, unit] = [Math.round(seconds / 86400), 'day'];
		else if (seconds < 30 * 86400) [count, unit] = [Math.round(seconds / (7 * 86400)), 'week'];
		else if (seconds < 365 * 86400) {
			[count, unit] = [Math.max(1, Math.round(seconds / (30 * 86400))), 'month'];
		} else [count, unit] = [Math.round(seconds / (365 * 86400)), 'year'];
		return future ? this.strings.timeFromNow(count, unit) : this.strings.timeAgo(count, unit);
	}
}

/** A live view of the formatter for the current locale: `current` always reads the latest. */
export interface FormatRef {
	readonly current: Format;
}

/**
 * Returns a formatter for the locale and strings of the closest `LocaleProvider`, or
 * English when there is none. Must be called during component initialization.
 */
export function useFormat(): FormatRef {
	const locale = useLocale();
	let cached: Format | undefined;
	return {
		get current() {
			if (
				cached?.locale !== supportedLocale(locale.locale) ||
				cached.strings !== locale.strings
			) {
				cached = new Format({ locale: locale.locale, strings: locale.strings });
			}
			return cached;
		}
	};
}
