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

import {
	colorToHex,
	fromHsl,
	toColorValue,
	toHsl,
	toRgba,
	type ColorInput,
	type ColorValue
} from './color.js';

const black: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
const white: ColorValue = { r: 1, g: 1, b: 1, a: 1 };

// Converts one sRGB channel (0–1) to linear light.
function linearize(component: number): number {
	return component <= 0.03928 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
}

/** Returns the relative luminance of `color`, from 0 (black) to 1 (white); alpha is ignored. */
export function luminanceOf(color: ColorInput): number {
	const { r, g, b } = toColorValue(color);
	return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Returns the WCAG contrast ratio between two colors, from 1 to 21; alpha is ignored. */
export function contrastRatio(a: ColorInput, b: ColorInput): number {
	const la = luminanceOf(a);
	const lb = luminanceOf(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Returns the lowest contrast ratio between `color` and any of `backgrounds`, or 21. */
export function minContrastRatio(color: ColorInput, backgrounds: Iterable<ColorInput>): number {
	let lowest = 21;
	for (const background of backgrounds)
		lowest = Math.min(lowest, contrastRatio(color, background));
	return lowest;
}

/** Returns black or white, whichever contrasts more with `background`, as a `ColorValue`. */
export function foregroundColorFor(background: ColorInput): ColorValue {
	return contrastRatio(black, background) >= contrastRatio(white, background) ? black : white;
}

/**
 * Returns the color closest to `color` that reaches `target` contrast against every
 * background, as a `ColorValue`; see `Contrast.ensure`. A color that already reaches it is
 * returned unchanged, between 8-bit steps included; adjusted colors land on 8-bit steps.
 */
export function ensureContrastColor(
	color: ColorInput,
	backgrounds: Iterable<ColorInput>,
	target: number
): ColorValue {
	const value = toColorValue(color);
	const list = [...backgrounds];
	if (minContrastRatio(value, list) >= target) return value;
	const hsl = toHsl(toRgba(value));
	for (let step = 1; step <= 200; step++) {
		for (const sign of [-1, 1]) {
			const lightness = hsl.l + sign * step * 0.005;
			if (lightness < 0 || lightness > 1) continue;
			const rgba = fromHsl({ ...hsl, l: lightness });
			const candidate = {
				r: rgba.r / 255,
				g: rgba.g / 255,
				b: rgba.b / 255,
				a: rgba.a / 255
			};
			if (minContrastRatio(candidate, list) >= target) return candidate;
		}
	}
	return minContrastRatio(black, list) >= minContrastRatio(white, list) ? black : white;
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
		return contrastRatio(a, b);
	},

	/** Returns black or white, whichever has the higher contrast ratio against `background`. */
	foregroundFor(background: string): string {
		return colorToHex(foregroundColorFor(background));
	},

	/** Returns the lowest contrast ratio between `color` and any of `backgrounds`, or 21 when empty. */
	minRatio(color: string, backgrounds: Iterable<string>): number {
		return minContrastRatio(color, backgrounds);
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
		if (minContrastRatio(color, list) >= target) return color;
		return colorToHex(ensureContrastColor(color, list, target));
	}
} as const;
