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
 * Holds the number of pages and the selected page of a navigation component, reactively.
 * An `index` of -1 means no page is selected.
 */
export class PageController {
	#length = $state(0);
	#index = $state(-1);

	/**
	 * Creates a controller for `length` pages with `initialIndex` selected. Throws a
	 * `RangeError` when `length` is negative or `initialIndex` is outside -1 to
	 * `length - 1`.
	 */
	constructor(length: number, initialIndex = -1) {
		if (length < 0) throw new RangeError(`length ${length} is negative`);
		if (initialIndex < -1 || initialIndex >= length)
			throw new RangeError(`index ${initialIndex} out of range`);
		this.#length = length;
		this.#index = initialIndex;
	}

	/** The number of pages. Setting it clears the selection when it falls beyond the new length. */
	get length(): number {
		return this.#length;
	}

	set length(value: number) {
		if (value < 0) throw new RangeError(`length ${value} is negative`);
		this.#length = value;
		if (this.#index >= value) this.#index = -1;
	}

	/** The selected page, or -1. Throws a `RangeError` when set outside -1 to `length - 1`. */
	get index(): number {
		return this.#index;
	}

	set index(value: number) {
		if (value < -1 || value >= this.#length)
			throw new RangeError(`index ${value} out of range`);
		this.#index = value;
	}

	/** Whether a page is selected. */
	get hasSelection(): boolean {
		return this.#index >= 0;
	}
}
