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

const key = Symbol('oito2.expandable');

/** Where the chevron of an expandable trigger sits. */
export type ExpandButtonPosition = 'start' | 'end';

/** The options of an `ExpandableState`. */
export interface ExpandableOptions {
	/** The base id of the trigger and the content. */
	id: string;
	/** Reads whether the content is shown. */
	open: () => boolean;
	/** Requests a new state from the owner. */
	setOpen: (open: boolean) => void;
	/** Reads whether the trigger is disabled. */
	disabled: () => boolean;
}

/** The state an expandable section shares between its trigger and its content. */
export class ExpandableState {
	readonly #options: ExpandableOptions;
	/** The id of the trigger button. */
	readonly triggerId: string;
	/** The id of the content region. */
	readonly contentId: string;

	constructor(options: ExpandableOptions) {
		this.#options = options;
		this.triggerId = `${options.id}-trigger`;
		this.contentId = `${options.id}-content`;
	}

	/** Whether the content is shown. */
	get open(): boolean {
		return this.#options.open();
	}

	/** Whether the trigger can't be used. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** Shows the content when hidden and hides it when shown. */
	toggle(): void {
		if (!this.disabled) this.#options.setOpen(!this.open);
	}
}

/** Publishes the state of an expandable section to its parts. */
export function setExpandable(state: ExpandableState): ExpandableState {
	return setContext(key, state);
}

/** Returns the state of the enclosing expandable section; throws outside one. */
export function useExpandable(): ExpandableState {
	if (!hasContext(key))
		throw new Error('Expandable parts must be inside an Expandable.Root or an Accordion.Item');
	return getContext<ExpandableState>(key);
}
