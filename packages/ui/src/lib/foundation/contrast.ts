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

import { formatHex, fromHsl, parseHex, toHsl, type Rgba } from './color.js';

const black = '#000000';
const white = '#FFFFFF';

// Converts one sRGB channel (0–1) to linear light.
function linearize(component: number): number {
	return component <= 0.03928 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
}

// Relative luminance from 0 (black) to 1 (white); the alpha channel is ignored.
function luminance(color: Rgba): number {
	return (
		0.2126 * linearize(color.r / 255) +
		0.7152 * linearize(color.g / 255) +
		0.0722 * linearize(color.b / 255)
	);
}

/** Color contrast helpers based on WCAG 2.2 relative luminance. Colors are hex strings. */
export const Contrast = {
	/** Minimum contrast ratio for normal text at WCAG level AA. */
	textAA: 4.5,

	/** Minimum contrast ratio for large text, components and graphics at WCAG level AA. */
	nonTextAA: 3,

	/** Minimum contrast ratio for normal text at WCAG level AAA. */
	textAAA: 7,

	/**
	 * Returns the WCAG contrast ratio between `a` and `b`, from 1 (no contrast) to 21
	 * (black on white). The alpha channel is ignored.
	 */
	ratio(a: string, b: string): number {
		const la = luminance(parseHex(a));
		const lb = luminance(parseHex(b));
		const lighter = Math.max(la, lb);
		const darker = Math.min(la, lb);
		return (lighter + 0.05) / (darker + 0.05);
	},

	/** Returns black or white, whichever has the higher contrast ratio against `background`. */
	foregroundFor(background: string): string {
		return Contrast.ratio(black, background) >= Contrast.ratio(white, background)
			? black
			: white;
	},

	/** Returns the lowest contrast ratio between `color` and any of `backgrounds`, or 21 when empty. */
	minRatio(color: string, backgrounds: Iterable<string>): number {
		let lowest = 21;
		for (const background of backgrounds)
			lowest = Math.min(lowest, Contrast.ratio(color, background));
		return lowest;
	},

	/**
	 * Returns the color closest to `color` that reaches `target` contrast against every
	 * color in `backgrounds`.
	 *
	 * Keeps hue, saturation and alpha and moves only the HSL lightness, in steps of 0.005,
	 * darker before lighter at each distance, and returns the first lightness that reaches
	 * `target`. Returns `color` unchanged when it already does or when `backgrounds` is
	 * empty. When no lightness reaches it, returns black or white, whichever reaches the
	 * higher minimum ratio.
	 */
	ensure(color: string, backgrounds: Iterable<string>, target: number): string {
		const list = [...backgrounds];
		if (Contrast.minRatio(color, list) >= target) return color;
		const hsl = toHsl(parseHex(color));
		for (let step = 1; step <= 200; step++) {
			for (const sign of [-1, 1]) {
				const lightness = hsl.l + sign * step * 0.005;
				if (lightness < 0 || lightness > 1) continue;
				const candidate = formatHex(fromHsl({ ...hsl, l: lightness }));
				if (Contrast.minRatio(candidate, list) >= target) return candidate;
			}
		}
		return Contrast.minRatio(black, list) >= Contrast.minRatio(white, list) ? black : white;
	}
} as const;
