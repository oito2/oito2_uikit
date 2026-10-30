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

/** A color with 8-bit red, green, blue and alpha channels (0–255). */
export interface Rgba {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
}

const hexPattern = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Parses a hex color (`#RGB`, `#RGBA`, `#RRGGBB` or `#RRGGBBAA`, with or
 * without `#`). Throws a `TypeError` for anything else.
 */
export function parseHex(value: string): Rgba {
	const match = hexPattern.exec(value.trim());
	if (!match?.[1]) throw new TypeError(`Invalid hex color: ${value}`);
	let digits = match[1];
	if (digits.length <= 4) digits = [...digits].map((digit) => digit + digit).join('');
	const channel = (index: number) => Number.parseInt(digits.slice(index, index + 2), 16);
	return {
		r: channel(0),
		g: channel(2),
		b: channel(4),
		a: digits.length === 8 ? channel(6) : 255
	};
}

/** Formats a color as uppercase `#RRGGBB`, or `#RRGGBBAA` when it isn't opaque. */
export function formatHex(color: Rgba): string {
	const pair = (value: number) => value.toString(16).padStart(2, '0');
	const alpha = color.a === 255 ? '' : pair(color.a);
	return `#${pair(color.r)}${pair(color.g)}${pair(color.b)}${alpha}`.toUpperCase();
}

/** Rounds half away from zero, like Dart's `round()`. */
export function roundHalfAway(value: number): number {
	return Math.sign(value) * Math.round(Math.abs(value));
}

/** A color in the HSL model: hue in degrees (0–360), the rest from 0 to 1. */
export interface Hsla {
	readonly h: number;
	readonly s: number;
	readonly l: number;
	readonly a: number;
}

/** Converts an 8-bit color to HSL. */
export function toHsl(color: Rgba): Hsla {
	const r = color.r / 255;
	const g = color.g / 255;
	const b = color.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	let h: number;
	if (max === 0 || delta === 0) {
		// Grays (and black) have no hue.
		h = 0;
	} else if (max === r) {
		// Dart's % is Euclidean: the remainder is never negative.
		const remainder = ((g - b) / delta) % 6;
		h = 60 * (remainder < 0 ? remainder + 6 : remainder);
	} else if (max === g) h = 60 * ((b - r) / delta + 2);
	else h = 60 * ((r - g) / delta + 4);
	const l = (max + min) / 2;
	// Saturation can exceed 1 through rounding errors, so it is clamped.
	const s = min === max ? 0 : Math.min(1, Math.max(0, delta / (1 - Math.abs(2 * l - 1))));
	return { h, s, l, a: color.a / 255 };
}

/** Converts an HSL color to 8 bits per channel, rounding half away from zero. */
export function fromHsl(color: Hsla): Rgba {
	const chroma = (1 - Math.abs(2 * color.l - 1)) * color.s;
	const secondary = chroma * (1 - Math.abs(((color.h / 60) % 2) - 1));
	const match = color.l - chroma / 2;
	const [r, g, b] =
		color.h < 60
			? [chroma, secondary, 0]
			: color.h < 120
				? [secondary, chroma, 0]
				: color.h < 180
					? [0, chroma, secondary]
					: color.h < 240
						? [0, secondary, chroma]
						: color.h < 300
							? [secondary, 0, chroma]
							: [chroma, 0, secondary];
	const channel = (value: number) => roundHalfAway((value + match) * 255);
	return { r: channel(r), g: channel(g), b: channel(b), a: roundHalfAway(color.a * 255) };
}
