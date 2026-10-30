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

const focusableSelector = [
	'a[href]',
	'area[href]',
	'button',
	'input',
	'select',
	'textarea',
	'iframe',
	'audio[controls]',
	'video[controls]',
	'summary',
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]'
].join(',');

/** Whether `element` is rendered: it has a box and isn't hidden. */
function isRendered(element: HTMLElement): boolean {
	if (element.closest('[hidden], [inert]')) return false;
	if (typeof element.checkVisibility === 'function') {
		return element.checkVisibility({ visibilityProperty: true });
	}
	return element.getClientRects().length > 0;
}

/** Whether `element` can take focus: rendered, enabled and focusable by its kind or `tabindex`. */
export function isFocusable(element: Element): element is HTMLElement {
	if (!(element instanceof HTMLElement) || !element.matches(focusableSelector)) return false;
	if ((element as HTMLButtonElement).disabled) return false;
	if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
	return isRendered(element);
}

/** Whether `element` takes focus from the Tab key: focusable and without a negative `tabindex`. */
export function isTabbable(element: Element): element is HTMLElement {
	return isFocusable(element) && element.tabIndex >= 0;
}

/**
 * Returns the elements inside `container` that take focus from the Tab key, in Tab
 * order: positive `tabindex` values first, by value, then the rest in document order.
 * Among unchecked radio buttons of a group that has a checked one, only the checked one
 * counts.
 */
export function tabbables(container: Element): HTMLElement[] {
	const all = [...container.querySelectorAll(focusableSelector)].filter(isTabbable);
	const checkedGroups = new Set(
		all
			.filter((el) => el instanceof HTMLInputElement && el.type === 'radio' && el.checked)
			.map((el) => (el as HTMLInputElement).name)
	);
	const candidates = all.filter(
		(el) =>
			!(
				el instanceof HTMLInputElement &&
				el.type === 'radio' &&
				!el.checked &&
				el.name !== '' &&
				checkedGroups.has(el.name)
			)
	);
	const positive = candidates
		.filter((el) => el.tabIndex > 0)
		.sort((a, b) => a.tabIndex - b.tabIndex);
	return [...positive, ...candidates.filter((el) => el.tabIndex === 0)];
}

/** Focuses `element` without scrolling when it is set, and returns whether it now has focus. */
export function focusElement(
	element: HTMLElement | null | undefined,
	options: { select?: boolean } = {}
): boolean {
	if (!element) return false;
	element.focus({ preventScroll: true });
	if (options.select && element instanceof HTMLInputElement) element.select();
	return element.ownerDocument.activeElement === element;
}

/** Returns the focused element of `document`, looking inside open shadow roots. */
export function activeElement(document: Document = globalThis.document): Element | null {
	let active = document.activeElement;
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
	return active;
}
