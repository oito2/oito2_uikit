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

/** Returns the ids in the `aria-describedby` of `element`. */
function describedBy(element: Element): string[] {
	return (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
}

/**
 * Adds `id` to the `aria-describedby` of `element`, keeping the ids already there. Returns
 * the function that removes it again, or a function that does nothing when `id` was
 * already there.
 */
export function addDescribedBy(element: Element, id: string): () => void {
	const ids = describedBy(element);
	if (ids.includes(id)) return () => {};
	element.setAttribute('aria-describedby', [...ids, id].join(' '));
	return () => removeDescribedBy(element, id);
}

/** Removes `id` from the `aria-describedby` of `element`, dropping the attribute when empty. */
export function removeDescribedBy(element: Element, id: string): void {
	const left = describedBy(element).filter((each) => each !== id);
	if (left.length > 0) element.setAttribute('aria-describedby', left.join(' '));
	else element.removeAttribute('aria-describedby');
}
