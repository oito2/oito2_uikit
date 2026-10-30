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

import { getContext, hasContext, setContext } from 'svelte';

const key = Symbol('oito2.portal-target');

/** A live view of the element overlays are rendered into, or `null` for `document.body`. */
export interface PortalTargetRef {
	readonly current: HTMLElement | null;
}

/**
 * Makes the element `get` returns the target of the portals below the calling component.
 * The `ThemeProvider` points it at an element inside its themed `div`, so overlays keep
 * the theme's custom properties. Must be called during component initialization.
 */
export function setPortalTarget(get: () => HTMLElement | null | undefined): void {
	setContext<PortalTargetRef>(key, {
		get current() {
			return get() ?? null;
		}
	});
}

/**
 * Returns the portal target of the closest `ThemeProvider` (or `setPortalTarget`), whose
 * `current` is `null` when there is none, meaning `document.body`. Must be called during
 * component initialization.
 */
export function usePortalTarget(): PortalTargetRef {
	if (hasContext(key)) return getContext<PortalTargetRef>(key);
	return { current: null };
}
