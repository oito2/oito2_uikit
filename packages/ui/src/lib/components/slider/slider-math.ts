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

/** A labeled point along a slider's track. */
export interface SliderMark {
	/** The value the mark stands at. */
	readonly value: number;
	/** The text under the mark. */
	readonly label?: string;
}

/** Returns `value` clamped to `min`–`max` and, with `divisions`, rounded to the nearest division. */
export function snapSliderValue(
	value: number,
	min: number,
	max: number,
	divisions?: number
): number {
	const clamped = Math.min(max, Math.max(min, value));
	if (!divisions || divisions <= 0 || max === min) return clamped;
	const size = (max - min) / divisions;
	return min + Math.round((clamped - min) / size) * size;
}

/** Returns the position of `value` along the track, from 0 at `min` to 1 at `max`. */
export function sliderFraction(value: number, min: number, max: number): number {
	return max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Returns the step of the arrow keys: one division, or a tenth of the range without
 * divisions.
 */
export function sliderStep(min: number, max: number, divisions?: number): number {
	return divisions && divisions > 0 ? (max - min) / divisions : (max - min) / 10;
}
