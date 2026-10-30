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

/** The pause, in milliseconds, after which typed characters start a new query. */
export const typeaheadTimeout = 600;

/**
 * Finds items by typing their first letters, as lists, menus, selects and trees do:
 * characters typed within `timeout` of each other build one query, and typing the same
 * character again cycles through the items that start with it.
 */
export class Typeahead {
	readonly #timeout: number;
	#typed = '';
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(timeout = typeaheadTimeout) {
		this.#timeout = timeout;
	}

	/** The characters typed so far for the current query. */
	get query(): string {
		return this.#typed;
	}

	/**
	 * Adds `character` to the query and returns the value of the matching item, or `null`.
	 * `search(query, from)` looks for the first enabled item whose label starts with
	 * `query` after the item `from` (from the start when `from` is `null`), wrapping
	 * around, like `ListCollection.search`. `active` is the value of the focused item.
	 */
	type(
		character: string,
		active: string | null,
		search: (query: string, from: string | null) => string | null
	): string | null {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => this.reset(), this.#timeout);
		const repeat = this.#typed === character;
		this.#typed = repeat ? character : this.#typed + character;
		const from = repeat || this.#typed.length === 1 ? active : null;
		return search(this.#typed, from) ?? (from === null ? null : search(this.#typed, null));
	}

	/** Forgets the current query. */
	reset(): void {
		clearTimeout(this.#timer);
		this.#typed = '';
	}
}
