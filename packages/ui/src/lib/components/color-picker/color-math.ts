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

/** A color with red, green, blue and alpha channels from 0 to 1. */
export interface RgbaColor {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
}

/** A color by hue (0 to 360), saturation, value and alpha (0 to 1). */
export interface HsvColor {
	readonly h: number;
	readonly s: number;
	readonly v: number;
	readonly a: number;
}

/** A color by hue (0 to 360), saturation, lightness and alpha (0 to 1). */
export interface HslColor {
	readonly h: number;
	readonly s: number;
	readonly l: number;
	readonly a: number;
}

/** The text format of the color picker fields. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

const byte = (channel: number) =>
	Math.round(Math.min(Math.max(channel, 0), 1) * 255)
		.toString(16)
		.padStart(2, '0')
		.toUpperCase();

/** Formats `color` as `#RRGGBB`, or `#RRGGBBAA` when translucent and `withAlpha` is set. */
export function formatHexColor(color: RgbaColor, withAlpha = true): string {
	const hex = `#${byte(color.r)}${byte(color.g)}${byte(color.b)}`;
	return withAlpha && color.a < 1 ? `${hex}${byte(color.a)}` : hex;
}

/**
 * Parses `#RGB`, `#RRGGBB` or `#RRGGBBAA`, with or without `#` and surrounding spaces;
 * returns `null` for anything else.
 */
export function parseHexColor(text: string): RgbaColor | null {
	let hex = text.trim();
	if (hex.startsWith('#')) hex = hex.slice(1);
	if (!/^[0-9a-f]+$/i.test(hex)) return null;
	if (hex.length === 3)
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	if (hex.length === 6) hex += 'FF';
	if (hex.length !== 8) return null;
	const at = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255;
	return { r: at(0), g: at(2), b: at(4), a: at(6) };
}

/** Converts HSV to RGB. */
export function hsvToRgb({ h, s, v, a }: HsvColor): RgbaColor {
	const f = (n: number) => {
		const k = (n + h / 60) % 6;
		return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
	};
	return { r: f(5), g: f(3), b: f(1), a };
}

/** Converts RGB to HSV; grays get hue 0. */
export function rgbToHsv({ r, g, b, a }: RgbaColor): HsvColor {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let h = 0;
	if (d > 0) {
		if (max === r) h = 60 * (((g - b) / d) % 6);
		else if (max === g) h = 60 * ((b - r) / d + 2);
		else h = 60 * ((r - g) / d + 4);
	}
	return { h: (h + 360) % 360, s: max === 0 ? 0 : d / max, v: max, a };
}

/** Converts RGB to HSL; grays get hue 0. */
export function rgbToHsl(color: RgbaColor): HslColor {
	const { h, s, v, a } = rgbToHsv(color);
	const l = v * (1 - s / 2);
	const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
	return { h, s: sl, l, a };
}

/** Converts HSL to RGB. */
export function hslToRgb({ h, s, l, a }: HslColor): RgbaColor {
	const v = l + s * Math.min(l, 1 - l);
	return hsvToRgb({ h, s: v === 0 ? 0 : 2 * (1 - l / v), v, a });
}

/**
 * Returns the HSV of `color`, keeping `hue` when it is gray (no saturation or no
 * brightness), where it has no hue of its own.
 */
export function hsvKeepingHue(color: RgbaColor, hue: number): HsvColor {
	const hsv = rgbToHsv(color);
	return hsv.s === 0 || hsv.v === 0 ? { ...hsv, h: hue } : hsv;
}
