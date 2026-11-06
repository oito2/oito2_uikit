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

import type { Attachment } from 'svelte/attachments';

/** How many open modals make each element inert. */
const counts = new Map<HTMLElement, number>();

/** Whether `element` stays out of the inert background, such as the live regions. */
function keeps(element: Element): boolean {
	return (
		!(element instanceof HTMLElement) ||
		['SCRIPT', 'STYLE', 'TEMPLATE', 'LINK', 'META'].includes(element.tagName) ||
		element.hasAttribute('data-oito2-live-region')
	);
}

/**
 * Makes the rest of the page inert while a modal overlay is open: every element beside
 * `panel` or beside one of its ancestors, up to `document.body`, as they are now. Elements
 * added later, such as the overlays opened from inside the modal, stay interactive. Modals
 * nest: an element stays inert until every modal that made it so has released it, and an
 * element already inert by itself is left alone. Returns the release function.
 */
export function inertOutside(panel: HTMLElement): () => void {
	const marked: HTMLElement[] = [];
	const body = panel.ownerDocument.body;
	let node: HTMLElement = panel;
	while (node !== body && node.parentElement) {
		const parent: HTMLElement = node.parentElement;
		for (const sibling of parent.children) {
			if (sibling === node || keeps(sibling)) continue;
			const element = sibling as HTMLElement;
			const count = counts.get(element) ?? 0;
			if (count === 0) {
				if (element.inert) continue;
				element.inert = true;
			}
			counts.set(element, count + 1);
			marked.push(element);
		}
		node = parent;
	}
	let released = false;
	return () => {
		if (released) return;
		released = true;
		for (const element of marked) {
			const count = (counts.get(element) ?? 1) - 1;
			if (count > 0) counts.set(element, count);
			else {
				counts.delete(element);
				element.inert = false;
			}
		}
	};
}

/**
 * Runs `attachment` on a modal panel, such as its focus scope, then makes the rest of the
 * page inert with `inertOutside`. On removal the page is released first, so focus can
 * return to the element outside the panel that had it.
 */
export function withInertOutside(attachment: Attachment<HTMLElement>): Attachment<HTMLElement> {
	return (panel) => {
		const cleanup = attachment(panel);
		const release = inertOutside(panel);
		return () => {
			release();
			if (typeof cleanup === 'function') cleanup();
		};
	};
}
