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

let locks = 0;
let restore: (() => void) | null = null;

/**
 * Stops the page from scrolling while a modal overlay is open, padding the body by the
 * width of the scrollbar it hides so the content doesn't shift. Locks nest: the page
 * scrolls again when every returned release function has been called.
 */
export function lockScroll(document: Document = globalThis.document): () => void {
	if (locks === 0) {
		const body = document.body;
		const root = document.documentElement;
		const scrollbar = (document.defaultView?.innerWidth ?? root.clientWidth) - root.clientWidth;
		const previous = {
			overflow: body.style.overflow,
			paddingRight: body.style.paddingRight
		};
		const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
		body.style.overflow = 'hidden';
		if (scrollbar > 0) body.style.paddingRight = `${padding + scrollbar}px`;
		restore = () => {
			body.style.overflow = previous.overflow;
			body.style.paddingRight = previous.paddingRight;
		};
	}
	locks += 1;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		locks -= 1;
		if (locks === 0) {
			restore?.();
			restore = null;
		}
	};
}
