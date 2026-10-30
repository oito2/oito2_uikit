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
import { activeElement, focusElement, tabbables } from './focus.js';

/** The options of `focusScope`. */
export interface FocusScopeOptions {
	/**
	 * Whether Tab and Shift+Tab cycle inside the scope and focus can't move out of it, as
	 * in a modal dialog. Only the most recently attached trapping scope traps.
	 */
	trap?: boolean;
	/**
	 * What takes focus when the scope is attached: `true` (the default) focuses the
	 * element marked with `data-autofocus` or `autofocus`, else the first tabbable element,
	 * else the scope itself; `false` leaves focus where it is; a function returns the
	 * element to focus.
	 */
	autoFocus?: boolean | (() => HTMLElement | null | undefined);
	/**
	 * Whether focus returns to the element that had it before the scope was attached when
	 * the scope goes away, provided focus is still inside the scope or nowhere. Defaults to
	 * true.
	 */
	restoreFocus?: boolean;
}

/** The trapping scopes, the active one last. */
const traps: HTMLElement[] = [];

/** Focuses the element of `container` that should take focus first. */
function focusInitial(container: HTMLElement, autoFocus: FocusScopeOptions['autoFocus']): void {
	if (autoFocus === false) return;
	if (typeof autoFocus === 'function' && focusElement(autoFocus())) return;
	const marked = container.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
	if (focusElement(marked)) return;
	if (focusElement(tabbables(container)[0])) return;
	focusContainer(container);
}

/** Focuses `container` itself, making it focusable by script when it isn't. */
function focusContainer(container: HTMLElement): void {
	if (!container.hasAttribute('tabindex')) container.tabIndex = -1;
	focusElement(container);
}

/**
 * Manages focus inside an element: initial focus, an optional Tab trap and focus
 * restoration when it goes away, for dialogs, popovers and menus.
 */
export function focusScope(options: FocusScopeOptions = {}): Attachment<HTMLElement> {
	return (container) => {
		const { trap = false, autoFocus = true, restoreFocus = true } = options;
		const document = container.ownerDocument;
		const previous = activeElement(document);
		let lastInside: HTMLElement | null = null;

		if (trap) traps.push(container);
		const isActiveTrap = () => trap && traps.at(-1) === container;

		const onFocusIn = (event: FocusEvent) => {
			const target = event.target as Node | null;
			if (target && container.contains(target)) {
				lastInside = target as HTMLElement;
				return;
			}
			if (!isActiveTrap()) return;
			if (!focusElement(lastInside?.isConnected ? lastInside : null))
				focusInitial(container, true);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab' || event.defaultPrevented || !isActiveTrap()) return;
			if (event.ctrlKey || event.altKey || event.metaKey) return;
			const items = tabbables(container);
			const first = items[0];
			const last = items.at(-1);
			const active = activeElement(document);
			if (!first || !last) {
				event.preventDefault();
				focusContainer(container);
			} else if (event.shiftKey && (active === first || active === container)) {
				event.preventDefault();
				focusElement(last);
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				focusElement(first);
			}
		};

		document.addEventListener('focusin', onFocusIn);
		container.addEventListener('keydown', onKeyDown);
		if (!container.contains(activeElement(document))) focusInitial(container, autoFocus);

		return () => {
			document.removeEventListener('focusin', onFocusIn);
			container.removeEventListener('keydown', onKeyDown);
			const index = traps.lastIndexOf(container);
			if (index >= 0) traps.splice(index, 1);
			if (!restoreFocus || !(previous instanceof HTMLElement) || !previous.isConnected)
				return;
			const active = activeElement(document);
			if (!active || active === document.body || container.contains(active))
				focusElement(previous);
		};
	};
}
