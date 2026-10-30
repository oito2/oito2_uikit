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
import { createColorTheme, type ColorTheme } from './color-theme.js';

const key = Symbol('oito2.theme');

/** A live view of the active color theme: `current` always reads the latest value. */
export interface ThemeRef {
	readonly current: ColorTheme;
}

/**
 * Provides a color theme to the components below the calling one. `get` is called on
 * every read, so a getter over a prop or `$derived` keeps it reactive. Must be called
 * during component initialization.
 */
export function setTheme(get: () => ColorTheme): void {
	setContext<ThemeRef>(key, {
		get current() {
			return get();
		}
	});
}

/**
 * Returns the color theme of the closest `ThemeProvider` (or `setTheme`), or the light
 * base scheme when there is none. Must be called during component initialization.
 */
export function useTheme(): ThemeRef {
	if (hasContext(key)) return getContext<ThemeRef>(key);
	return { current: createColorTheme({ brightness: 'light' }) };
}
