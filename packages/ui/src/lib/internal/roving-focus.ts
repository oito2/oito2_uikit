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
import { activeElement, focusElement, isFocusable } from './focus.js';
import { directionOf, navigationIntent, type Orientation } from './keyboard.js';

/** The attribute that marks the items of a roving focus group. */
export const rovingItemAttribute = 'data-oito2-roving-item';

/** The options of `rovingFocus`. */
export interface RovingFocusOptions {
	/**
	 * The axis of the group: `horizontal` (Left/Right), `vertical` (Up/Down) or `grid`
	 * (all four arrows over `columns` columns). Defaults to `vertical`.
	 */
	orientation?: Orientation | 'grid';
	/** The number of columns of a grid; the arrows move by rows of this size. */
	columns?: number;
	/** Whether moving past either end wraps around. Defaults to false. */
	loop?: boolean;
	/** Called with the item that receives focus, so the component can activate or select it. */
	onFocusItem?: (item: HTMLElement) => void;
}

/** Returns the enabled items of the group, in document order. */
function itemsOf(container: HTMLElement): HTMLElement[] {
	return [...container.querySelectorAll<HTMLElement>(`[${rovingItemAttribute}]`)].filter(
		(item) =>
			item.closest(`[data-oito2-roving-group]`) === container &&
			!item.hasAttribute('data-disabled') &&
			isFocusable(item)
	);
}

/**
 * Gives a group of items one Tab stop and moves focus between them with the arrow keys,
 * Home and End (the WAI-ARIA "roving tabindex"): the item that had focus last keeps
 * `tabindex="0"`, the others get `tabindex="-1"`. Items are the descendants marked with
 * `data-oito2-roving-item` (disabled ones, marked `data-disabled`, are skipped). The
 * horizontal arrows follow the text direction.
 */
export function rovingFocus(options: RovingFocusOptions = {}): Attachment<HTMLElement> {
	return (container) => {
		const { orientation = 'vertical', columns = 1, loop = false, onFocusItem } = options;
		container.setAttribute('data-oito2-roving-group', '');
		let current: HTMLElement | null = null;

		/** Gives `item` the group's Tab stop. */
		const setCurrent = (item: HTMLElement | null) => {
			const items = itemsOf(container);
			current = item && items.includes(item) ? item : (items[0] ?? null);
			for (const each of container.querySelectorAll<HTMLElement>(
				`[${rovingItemAttribute}]`
			)) {
				each.tabIndex = each === current ? 0 : -1;
			}
		};

		const move = (item: HTMLElement | undefined) => {
			if (!item) return;
			setCurrent(item);
			focusElement(item);
			onFocusItem?.(item);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
			const items = itemsOf(container);
			const index = items.indexOf(activeElement(container.ownerDocument) as HTMLElement);
			if (index < 0) return;
			const dir = directionOf(container);
			const grid = orientation === 'grid';
			const intent = navigationIntent(event.key, {
				orientation: grid ? undefined : orientation,
				dir
			});
			if (!intent) return;
			let step = intent === 'next' ? 1 : -1;
			if (grid && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) step *= columns;
			let target: number;
			if (intent === 'first') target = 0;
			else if (intent === 'last') target = items.length - 1;
			else {
				target = index + step;
				if (target < 0 || target >= items.length) {
					if (!loop) {
						event.preventDefault();
						return;
					}
					target = (target + items.length) % items.length;
				}
			}
			event.preventDefault();
			move(items[target]);
		};

		const onFocusIn = (event: FocusEvent) => {
			const item = (event.target as Element | null)?.closest<HTMLElement>(
				`[${rovingItemAttribute}]`
			);
			if (item && itemsOf(container).includes(item)) setCurrent(item);
		};

		// Items added or removed later keep one Tab stop between them.
		const observer = new MutationObserver(() => setCurrent(current));
		observer.observe(container, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-disabled', 'disabled', 'hidden']
		});

		setCurrent(
			container.querySelector<HTMLElement>(
				`[${rovingItemAttribute}][data-state='active'], [${rovingItemAttribute}][aria-selected='true'], [${rovingItemAttribute}][aria-checked='true']`
			)
		);
		container.addEventListener('keydown', onKeyDown);
		container.addEventListener('focusin', onFocusIn);
		return () => {
			observer.disconnect();
			container.removeEventListener('keydown', onKeyDown);
			container.removeEventListener('focusin', onFocusIn);
			container.removeAttribute('data-oito2-roving-group');
		};
	};
}
