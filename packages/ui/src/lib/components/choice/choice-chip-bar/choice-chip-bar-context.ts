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

const key = Symbol('oito2.choice-chip-bar');

/** What a `ChoiceChipBar.Root` shares with its chips. */
export interface ChoiceChipBarContext {
	/** The values of the selected chips. */
	readonly value: readonly string[];
	/** Whether a selected chip shows a check mark. */
	readonly showCheckmark: boolean;
	/** Whether every chip is disabled. */
	readonly disabled: boolean;
	/** Selects or unselects the chip with `value`. */
	toggle(value: string): void;
}

/** Publishes the bar context to its chips. */
export function setChoiceChipBar(context: ChoiceChipBarContext): void {
	setContext(key, context);
}

/** Returns the context of the enclosing `ChoiceChipBar.Root`; throws outside one. */
export function useChoiceChipBar(): ChoiceChipBarContext {
	const context = getContext<ChoiceChipBarContext | undefined>(key);
	if (!context) throw new Error('Choice chips must be inside a ChoiceChipBar.Root');
	return context;
}
