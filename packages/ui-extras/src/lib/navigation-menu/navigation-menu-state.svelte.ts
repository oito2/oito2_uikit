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
import { SvelteMap } from 'svelte/reactivity';

const key = Symbol('oito2.navigation-menu');
const itemKey = Symbol('oito2.navigation-menu-item');

/** The options of a `NavigationMenuState`. */
export interface NavigationMenuOptions {
	/** The value of the item whose panel is open, when controlled. */
	value: () => string | null | undefined;
	/** The open item of an uncontrolled menu at first. */
	defaultValue: string | null;
	/** Called when the open item changes. */
	onValueChange: (value: string | null) => void;
	/** The value of the item that marks the current page. */
	current: () => string | null | undefined;
	/** The wait in milliseconds before a hovered trigger opens its panel. */
	hoverDelay: () => number;
	/** The largest panel width in pixels. */
	panelMaxWidth: () => number;
}

/**
 * The state a `NavigationMenu.Root` shares with its parts: the open panel, whether it was
 * opened from the keyboard, the hover timers and the item elements the indicator follows.
 */
export class NavigationMenuState {
	readonly #options: NavigationMenuOptions;
	#own: string | null = $state(null);
	/** Whether the open panel was opened from the keyboard or a click, which moves the focus into it. */
	keyboard = $state(false);
	/** The element of each item, by value. */
	readonly items = new SvelteMap<string, HTMLElement>();
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(options: NavigationMenuOptions) {
		this.#options = options;
		this.#own = options.defaultValue;
	}

	/** The value of the item whose panel is open, or `null`. */
	get open(): string | null {
		const value = this.#options.value();
		return value === undefined ? this.#own : value;
	}

	/** The value of the item that marks the current page, or `null`. */
	get current(): string | null {
		return this.#options.current() ?? null;
	}

	/** The largest panel width in pixels. */
	get panelMaxWidth(): number {
		return this.#options.panelMaxWidth();
	}

	/** Opens the panel of `value`, or closes every panel when it is `null`; `keyboard` moves the focus into it. */
	show(value: string | null, keyboard = false): void {
		this.cancel();
		if (value === this.open) return;
		this.keyboard = keyboard;
		this.#own = value;
		this.#options.onValueChange(value);
	}

	/** Switches to the panel of `value` at once when one is open, or opens it after the hover delay. */
	hover(value: string): void {
		this.cancel();
		if (this.open !== null) this.show(value);
		else this.#timer = setTimeout(() => this.show(value), this.#options.hoverDelay());
	}

	/** Closes the open panel shortly after the pointer leaves a trigger or a panel, unless it comes back. */
	leave(): void {
		this.cancel();
		this.#timer = setTimeout(() => this.show(null), 250);
	}

	/** Cancels a pending hover open or close. */
	cancel(): void {
		clearTimeout(this.#timer);
		this.#timer = undefined;
	}
}

/** Publishes a navigation menu state to its parts. */
export function setNavigationMenu(state: NavigationMenuState): NavigationMenuState {
	setContext(key, state);
	return state;
}

/** Returns the state of the enclosing `NavigationMenu.Root`; throws outside one. */
export function useNavigationMenu(): NavigationMenuState {
	if (!hasContext(key))
		throw new Error('NavigationMenu parts must be inside a NavigationMenu.Root');
	return getContext<NavigationMenuState>(key);
}

/** Publishes the value of a `NavigationMenu.Item` to its trigger, link and content. */
export function setNavigationMenuItem(value: () => string): void {
	setContext(itemKey, value);
}

/** Returns the value of the enclosing `NavigationMenu.Item`; throws outside one. */
export function useNavigationMenuItem(): () => string {
	if (!hasContext(itemKey)) throw new Error('This part must be inside a NavigationMenu.Item');
	return getContext<() => string>(itemKey);
}
