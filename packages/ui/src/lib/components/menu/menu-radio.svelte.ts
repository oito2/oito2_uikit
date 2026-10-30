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

const key = Symbol('oito2.menu-radio-group');

/** The value of a `Menu.RadioGroup`, shared with its items. */
export interface MenuRadioContext {
	readonly value: string | null;
	select(value: string): void;
}

/** Publishes the radio group of a menu to its items. */
export function setMenuRadio(context: MenuRadioContext): void {
	setContext(key, context);
}

/** Returns the enclosing `Menu.RadioGroup`; throws outside one. */
export function useMenuRadio(): MenuRadioContext {
	if (!hasContext(key)) throw new Error('Menu.RadioItem must be inside a Menu.RadioGroup');
	return getContext<MenuRadioContext>(key);
}
