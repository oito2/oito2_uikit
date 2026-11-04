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

import { getContext, setContext } from 'svelte';

const key = Symbol('oito2.splitter-options');

/** The divider options a `Splitter.Root` shares with its panes. */
export interface SplitterDividerOptions {
	/** How far one arrow key press moves a divider, in pixels. */
	readonly keyboardStep: number;
	/** The accessible name of the dividers. */
	readonly resizeLabel: string | undefined;
}

/** Publishes the divider options. */
export function setSplitterOptions(options: SplitterDividerOptions): void {
	setContext(key, options);
}

/** Returns the divider options of the enclosing splitter. */
export function useSplitterOptions(): SplitterDividerOptions {
	return (
		getContext<SplitterDividerOptions | undefined>(key) ?? {
			keyboardStep: 16,
			resizeLabel: undefined
		}
	);
}
