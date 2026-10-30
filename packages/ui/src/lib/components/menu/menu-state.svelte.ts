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

const key = Symbol('oito2.menu');

/** Which item takes focus when a menu opens. */
export type InitialFocus = 'first' | 'last' | 'none';

/** The options of a `MenuState`. */
export interface MenuOptions {
	open: () => boolean | undefined;
	defaultOpen?: () => boolean;
	onOpenChange: (open: boolean) => void;
	id: string;
	parent?: MenuState | null;
}

/**
 * The state of a menu or a submenu: whether it is open, its trigger and content
 * elements, the item to focus when it opens, and the submenu open inside it.
 */
export class MenuState {
	readonly id: string;
	readonly parent: MenuState | null;
	readonly #open: Controllable<boolean>;
	trigger: HTMLElement | null = $state(null);
	content: HTMLElement | null = $state(null);
	/** The item that takes focus when the content opens. */
	initialFocus: InitialFocus = 'first';
	/** The submenu open inside this menu. */
	openSub: MenuState | null = $state(null);

	constructor(options: MenuOptions) {
		this.id = options.id;
		this.parent = options.parent ?? null;
		this.#open = new Controllable({
			value: options.open,
			defaultValue: options.defaultOpen ?? (() => false),
			onChange: options.onOpenChange
		});
	}

	/** The menu at the top of this menu's tree. */
	get root(): MenuState {
		return this.parent ? this.parent.root : this;
	}

	/** Whether the menu is open. */
	get open(): boolean {
		return this.#open.current;
	}

	/** Opens the menu, focusing `focus` when its content shows. */
	show(focus: InitialFocus = 'first'): void {
		this.initialFocus = focus;
		if (this.parent) {
			if (this.parent.openSub && this.parent.openSub !== this) this.parent.openSub.hide();
			this.parent.openSub = this;
		}
		this.#open.current = true;
	}

	/** Closes the menu and its open submenus. */
	hide(): void {
		this.openSub?.hide();
		this.openSub = null;
		if (this.parent?.openSub === this) this.parent.openSub = null;
		this.#open.current = false;
	}

	/** Closes the whole menu tree, as after choosing an item. */
	closeAll(): void {
		this.root.hide();
	}
}

/** Publishes a menu state to its parts. */
export function setMenu(state: MenuState): void {
	setContext(key, state);
}

/** Returns the state of the enclosing menu or submenu; throws outside one. */
export function useMenu(): MenuState {
	if (!hasContext(key)) throw new Error('Menu parts must be inside a Menu.Root');
	return getContext<MenuState>(key);
}

/** Returns the state of the enclosing menu, or `null` outside one. */
export function maybeMenu(): MenuState | null {
	return hasContext(key) ? getContext<MenuState>(key) : null;
}
