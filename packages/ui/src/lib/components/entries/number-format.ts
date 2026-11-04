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

/** Maps a BCP 47 locale such as `pt_BR` to the form `Intl` takes. */
function intlLocale(locale: string): string {
	return locale.replace('_', '-');
}

/** Formats `value` in the number format of `locale` with exactly `decimals` decimal places. */
export function formatNumber(value: number, locale: string, decimals: number): string {
	return new Intl.NumberFormat(intlLocale(locale), {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(value);
}

/**
 * Parses `text` written in the number format of `locale` (its group and decimal
 * separators, its digits, a leading sign and any spaces) and returns the number, or
 * `null` when it isn't one.
 */
export function parseNumber(text: string, locale: string): number | null {
	const format = new Intl.NumberFormat(intlLocale(locale), { useGrouping: true });
	const parts = format.formatToParts(-12345.6);
	const group = parts.find((part) => part.type === 'group')?.value ?? ',';
	const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
	const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
	const digits = [
		...new Intl.NumberFormat(intlLocale(locale), { useGrouping: false }).format(9876543210)
	]
		.reverse()
		.join('');
	let normalized = '';
	for (const char of text.trim()) {
		if (/\s/u.test(char) || char === group) continue;
		const digit = digits.indexOf(char);
		if (digit >= 0) normalized += String(digit);
		else if (/\d/.test(char)) normalized += char;
		else if (char === decimal) normalized += '.';
		else if (char === minus || char === '-' || char === '−') normalized += '-';
		else if (char === '+') normalized += '+';
		else return null;
	}
	if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
	const value = Number(normalized);
	return Number.isFinite(value) ? value : null;
}

/** Rounds `value` to `decimals` places and keeps it between `min` and `max`. */
export function normalizeNumber(value: number, decimals: number, min: number, max: number): number {
	const rounded = Number(value.toFixed(decimals));
	return Math.min(Math.max(rounded, min), max);
}
