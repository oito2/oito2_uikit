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
import { Controllable } from '../../../internal/controllable.svelte.js';

const key = Symbol('oito2.segment-group');

/** The options of a `SegmentGroupState`. */
export interface SegmentGroupOptions {
	value: () => string | null | undefined;
	defaultValue: () => string | null;
	onChange: (value: string | null) => void;
	disabled: () => boolean;
}

/** The state a `SegmentGroup.Root` shares with its items: the selected segment. */
export class SegmentGroupState {
	readonly #options: SegmentGroupOptions;
	readonly #value: Controllable<string | null>;

	constructor(options: SegmentGroupOptions) {
		this.#options = options;
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
	}

	/** The value of the selected segment, or `null`. */
	get value(): string | null {
		return this.#value.current;
	}

	/** Whether every segment is disabled. */
	get disabled(): boolean {
		return this.#options.disabled();
	}

	/** Selects the segment with `value`. */
	select(value: string): void {
		this.#value.current = value;
	}
}

/** Publishes the segment group state to its items. */
export function setSegmentGroup(state: SegmentGroupState): SegmentGroupState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `SegmentGroup.Root`; throws outside one. */
export function useSegmentGroup(): SegmentGroupState {
	if (!hasContext(key)) throw new Error('Segments must be inside a SegmentGroup.Root');
	return getContext<SegmentGroupState>(key);
}
