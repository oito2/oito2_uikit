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

import { getContext, hasContext, setContext, untrack } from 'svelte';
import { Controllable } from '../../internal/controllable.svelte.js';

const key = Symbol('oito2.tabs');

/** The look of a tab list. */
export type TabsVariant = 'pill' | 'subtle';

/** The options of a `TabsState`. */
export interface TabsOptions {
	id: string;
	value: () => string | undefined;
	defaultValue: () => string;
	onChange: (value: string) => void;
	orientation: () => 'horizontal' | 'vertical';
	variant: () => TabsVariant;
	activateOnFocus: () => boolean;
}

/** Returns `value` reduced to characters that are valid in an id. */
function idPart(value: string): string {
	return value.replace(/[^\w-]/g, (char) => `_${char.charCodeAt(0).toString(16)}`);
}

/** The state a `Tabs.Root` shares with its parts: the selected tab. */
export class TabsState {
	readonly #options: TabsOptions;
	readonly #value: Controllable<string>;
	#contents = $state<string[]>([]);

	constructor(options: TabsOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
	}

	/** The value of the selected tab. */
	get value(): string {
		return this.#value.current;
	}

	/** The axis of the tab list. */
	get orientation(): 'horizontal' | 'vertical' {
		return this.#options.orientation();
	}

	/** The look of the tab list. */
	get variant(): TabsVariant {
		return this.#options.variant();
	}

	/** Whether moving focus with the arrow keys also selects the tab. */
	get activateOnFocus(): boolean {
		return this.#options.activateOnFocus();
	}

	/** Selects the tab with `value`. */
	select(value: string): void {
		this.#value.current = value;
	}

	/** Records that a panel exists for the tab with `value`; returns a function that removes it. */
	addContent(value: string): () => void {
		this.#contents = [...untrack(() => this.#contents), value];
		return () => {
			const index = this.#contents.indexOf(value);
			if (index >= 0) this.#contents = this.#contents.toSpliced(index, 1);
		};
	}

	/** Whether a panel exists for the tab with `value`. */
	hasContent(value: string): boolean {
		return this.#contents.includes(value);
	}

	/** Returns the id of the trigger of the tab with `value`. */
	triggerId(value: string): string {
		return `${this.#options.id}-trigger-${idPart(value)}`;
	}

	/** Returns the id of the panel of the tab with `value`. */
	contentId(value: string): string {
		return `${this.#options.id}-content-${idPart(value)}`;
	}
}

/** Publishes the tabs state to its parts. */
export function setTabs(state: TabsState): TabsState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Tabs.Root`; throws outside one. */
export function useTabs(): TabsState {
	if (!hasContext(key)) throw new Error('Tabs parts must be inside a Tabs.Root');
	return getContext<TabsState>(key);
}
