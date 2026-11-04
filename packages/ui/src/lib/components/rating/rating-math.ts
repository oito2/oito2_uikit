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

/**
 * Returns the rating at `position` pixels from the start of a row of `max` stars of
 * `size` pixels: a whole value, or with `allowHalf` a half value on the start half of a
 * star.
 */
export function ratingAt(position: number, size: number, max: number, allowHalf: boolean): number {
	const width = size * max;
	const clamped = Math.min(Math.max(position, 0), width - 0.001);
	const star = clamped / size;
	const whole = Math.floor(star);
	return whole + (allowHalf && star - whole < 0.5 ? 0.5 : 1);
}

/** Returns `value` aligned to the rating step (a half or a whole) and kept between 0 and `max`. */
export function alignRating(value: number, max: number, allowHalf: boolean): number {
	const step = allowHalf ? 0.5 : 1;
	return Math.min(Math.max(Math.round(value / step) * step, 0), max);
}

/** Returns `degrees` wrapped into the range 0 to under 360. */
export function wrapAngle(degrees: number): number {
	return ((degrees % 360) + 360) % 360;
}

/** Returns `degrees` rounded to the nearest multiple of `step` and wrapped. */
export function snapAngle(degrees: number, step: number): number {
	return wrapAngle(Math.round(degrees / step) * step);
}

/** Returns the angle, clockwise from the top, of the point `dx`, `dy` from the center. */
export function angleOf(dx: number, dy: number): number {
	return (Math.atan2(dx, -dy) * 180) / Math.PI;
}
