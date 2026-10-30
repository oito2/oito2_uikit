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

/** How urgently a screen reader reads an announcement. */
export type Politeness = 'polite' | 'assertive';

const regions = new Map<Politeness, HTMLElement>();

/** Returns the visually hidden live region of `politeness`, creating it in `document.body` once. */
function regionFor(politeness: Politeness, document: Document): HTMLElement {
	let region = regions.get(politeness);
	if (region?.isConnected) return region;
	region = document.createElement('div');
	region.setAttribute('aria-live', politeness);
	region.setAttribute('aria-atomic', 'true');
	region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
	region.dataset.oito2LiveRegion = politeness;
	Object.assign(region.style, {
		position: 'absolute',
		width: '1px',
		height: '1px',
		margin: '-1px',
		padding: '0',
		overflow: 'hidden',
		clip: 'rect(0 0 0 0)',
		whiteSpace: 'nowrap',
		border: '0'
	});
	document.body.append(region);
	regions.set(politeness, region);
	return region;
}

/**
 * Makes screen readers read `message`, as for a toast, a copy confirmation or a
 * validation error, without moving focus. Repeating the same message reads it again.
 */
export function announce(
	message: string,
	politeness: Politeness = 'polite',
	document: Document = globalThis.document
): void {
	const region = regionFor(politeness, document);
	region.textContent = '';
	// Changing the text on a later task makes screen readers notice a repeated message.
	setTimeout(() => {
		region.textContent = message;
	}, 50);
}
