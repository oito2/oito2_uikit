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

let counter = 0;

/**
 * Returns a new id with `prefix`, unique within the page. Components use `$props.id()`,
 * which is also stable between server and client rendering; this is for code that runs
 * outside a component, such as an element created by a script.
 */
export function uniqueId(prefix = 'oito2'): string {
	counter += 1;
	return `${prefix}-${counter}`;
}

/**
 * Returns the id of a part of a component from the component's base id, such as
 * `partId(id, 'label')` for the element an `aria-labelledby` points at.
 */
export function partId(base: string, part: string): string {
	return `${base}-${part}`;
}
