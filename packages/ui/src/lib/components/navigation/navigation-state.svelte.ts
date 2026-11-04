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
import { Controllable } from '../../internal/controllable.svelte.js';
import type { IconComponent } from '../icon.js';

/** A destination of a `NavigationPage`. */
export interface NavigationItem {
	/** The value that identifies the destination. */
	readonly value: string;
	/** The destination name, shown as a label and announced to assistive technologies. */
	readonly label: string;
	/** The icon. */
	readonly icon: IconComponent;
	/** The icon shown while selected. Defaults to `icon`. */
	readonly selectedIcon?: IconComponent;
	/** The tooltip where labels are hidden. Defaults to `label`. */
	readonly tooltip?: string;
}

/** How a `NavigationRail` shows its destinations. */
export type NavigationRailStyle = 'compact' | 'labelled' | 'labelledExtended';

/** The width of a navigation rail in each style, in pixels. */
export const navigationRailWidths: Record<NavigationRailStyle, number> = {
	compact: 64,
	labelled: 88,
	labelledExtended: 240
};

/** The layout a `NavigationPage` picks for a width. */
export type NavigationLayout = { kind: 'bar' } | { kind: 'rail'; style: NavigationRailStyle };

/** The options of `navigationLayout`. */
export interface NavigationLayoutOptions {
	/** The width available to the page. */
	width: number;
	/** Whether the input is touch. */
	touch: boolean;
	/** The width below which touch uses a bottom bar and pointer a compact rail. */
	compactBreakpoint: number;
	/** The width from which the rail shows labels beside the icons; `undefined` never extends it. */
	extendedBreakpoint?: number;
	/** A rail style that overrides the choice by width. */
	railStyle?: NavigationRailStyle;
}

/**
 * Returns the layout of a navigation page: a bottom bar for touch below the compact
 * breakpoint (unless a rail style is forced), otherwise a rail that is compact below the
 * compact breakpoint, extended from the extended breakpoint and labelled in between.
 */
export function navigationLayout(options: NavigationLayoutOptions): NavigationLayout {
	const { width, touch, compactBreakpoint, extendedBreakpoint, railStyle } = options;
	if (railStyle) return { kind: 'rail', style: railStyle };
	if (touch && width < compactBreakpoint) return { kind: 'bar' };
	if (width < compactBreakpoint) return { kind: 'rail', style: 'compact' };
	if (extendedBreakpoint !== undefined && width >= extendedBreakpoint)
		return { kind: 'rail', style: 'labelledExtended' };
	return { kind: 'rail', style: 'labelled' };
}

const key = Symbol('oito2.navigation');

/** The options of a `NavigationState`. */
export interface NavigationOptions {
	value: () => string | undefined;
	defaultValue: () => string;
	onChange: (value: string) => void;
	railStyle: () => NavigationRailStyle;
}

/** The selected destination a navigation rail or bar shares with its items. */
export class NavigationState {
	readonly #value: Controllable<string>;
	readonly #options: NavigationOptions;

	constructor(options: NavigationOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
	}

	/** The value of the selected destination, or `''` for none. */
	get value(): string {
		return this.#value.current;
	}

	/** How a rail shows its items. */
	get railStyle(): NavigationRailStyle {
		return this.#options.railStyle();
	}

	/** Selects the destination with `value`. */
	select(value: string): void {
		this.#value.current = value;
	}
}

/** Publishes the navigation state to the items. */
export function setNavigation(state: NavigationState): NavigationState {
	return setContext(key, state);
}

/** Returns the state of the enclosing navigation rail or bar; throws outside one. */
export function useNavigation(): NavigationState {
	if (!hasContext(key))
		throw new Error(
			'Navigation items must be inside a NavigationRail.Root or NavigationBar.Root'
		);
	return getContext<NavigationState>(key);
}
