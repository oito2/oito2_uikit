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

/** The options of `focusBorder`. */
export interface FocusBorderOptions {
	/**
	 * The corner radius of the ring and of the element: a radius token (`small`, `medium`,
	 * `large`) or any CSS length. Defaults to `medium`.
	 */
	radius?: 'none' | 'small' | 'medium' | 'large' | (string & {});
	/** Forces the ring on or off; when omitted it follows keyboard focus. */
	focused?: boolean;
}

const radiusTokens = new Set(['small', 'medium', 'large']);

/**
 * Draws a 2-pixel ring in the text-safe primary color around an element while it, or an
 * element inside it, has keyboard focus (`:focus-visible`), as around a list, a card or a
 * group of fields. The ring doesn't affect layout and doesn't show after pointer clicks.
 *
 * Needs `@oito2/ui/styles.css` (or `base.css`), which styles `data-oito2-focus-border`.
 *
 * ```svelte
 * <div {@attach focusBorder({ radius: 'large' })}>…</div>
 * ```
 */
export function focusBorder(options: FocusBorderOptions = {}): Attachment<HTMLElement> {
	return (element) => {
		const { radius = 'medium', focused } = options;
		element.dataset.oito2FocusBorder = focused === undefined ? 'auto' : focused ? 'on' : 'off';
		const value =
			radius === 'none'
				? '0'
				: radiusTokens.has(radius)
					? `var(--oito2-radius-${radius})`
					: radius;
		element.style.setProperty('--oito2-focus-border-radius', value);
		return () => {
			delete element.dataset.oito2FocusBorder;
			element.style.removeProperty('--oito2-focus-border-radius');
		};
	};
}
