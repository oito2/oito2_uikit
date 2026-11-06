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
import { foldText } from '../../collections/text-folding.js';
import { focusElement } from '../../internal/focus.js';
import { isPrintableKey } from '../../internal/keyboard.js';
import { rovingFocus, rovingItemAttribute } from '../../internal/roving-focus.js';
import { Typeahead } from '../../internal/typeahead.js';
import type { InitialFocus } from './menu-state.svelte.js';

/** Returns the enabled items of a menu or list element, in order. */
export function menuItems(list: HTMLElement): HTMLElement[] {
	return [...list.querySelectorAll<HTMLElement>(`[${rovingItemAttribute}]`)].filter(
		(item) =>
			item.closest('[data-oito2-roving-group]') === list &&
			!item.hasAttribute('data-disabled')
	);
}

/** The options of `menuList`. */
export interface MenuListOptions {
	/** The item to focus when the list attaches. */
	initialFocus: InitialFocus;
	/** The item to focus first instead, such as the selected option of a select. */
	preferred?: () => HTMLElement | null | undefined;
	/** Called when Tab is pressed, which closes the menu. */
	onTab: () => void;
	/**
	 * Returns the element that takes focus when Tab closes the menu, such as its trigger,
	 * so the browser moves on from there instead of from the end of the document.
	 */
	returnFocus?: () => HTMLElement | null | undefined;
}

/**
 * The keyboard of a menu or a list of options: one Tab stop, Up/Down (looping), Home and
 * End (from the panel itself too, entering it at the first or last item), typeahead over
 * the item labels, Tab returning focus to the trigger, and the initial focus.
 */
export function menuList(options: MenuListOptions): Attachment<HTMLElement> {
	return (list) => {
		const roving = rovingFocus({ orientation: 'vertical', loop: true })(list);
		const typeahead = new Typeahead();
		// The label text, without the icon or the shortcut around it.
		const label = (item: HTMLElement) =>
			foldText(
				(
					item.dataset.label ??
					item.querySelector('[data-oito2-item-label]')?.textContent ??
					item.textContent ??
					''
				).trim()
			);

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented) return;
			if (event.key === 'Tab') {
				// Focus goes back to the trigger first; the browser's own Tab then moves on
				// from it, as from any other control.
				options.onTab();
				focusElement(options.returnFocus?.());
				return;
			}
			if (event.target === list && !event.ctrlKey && !event.altKey && !event.metaKey) {
				const items = menuItems(list);
				const first = event.key === 'ArrowDown' || event.key === 'Home';
				const last = event.key === 'ArrowUp' || event.key === 'End';
				if (first || last) {
					event.preventDefault();
					focusElement(first ? items[0] : items.at(-1));
					return;
				}
			}
			if (!isPrintableKey(event)) return;
			const items = menuItems(list);
			const active = items.indexOf(document.activeElement as HTMLElement);
			const search = (query: string, from: string | null) => {
				const needle = foldText(query);
				const start = from === null ? -1 : Number(from);
				for (let n = 1; n <= items.length; n++) {
					const index = (start + n) % items.length;
					if (label(items[index] as HTMLElement).startsWith(needle)) return String(index);
				}
				return null;
			};
			const found = typeahead.type(event.key, active < 0 ? null : String(active), search);
			if (found !== null) {
				event.preventDefault();
				focusElement(items[Number(found)]);
			}
		};

		list.addEventListener('keydown', onKeyDown);
		const items = menuItems(list);
		const target =
			options.preferred?.() ??
			(options.initialFocus === 'last'
				? items.at(-1)
				: options.initialFocus === 'first'
					? items[0]
					: null);
		if (target) focusElement(target);
		else if (options.initialFocus !== 'keep') focusElement(list);
		return () => {
			typeahead.reset();
			list.removeEventListener('keydown', onKeyDown);
			roving?.();
		};
	};
}
