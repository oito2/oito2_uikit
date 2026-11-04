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

const key = Symbol('oito2.section');

/** What a `Section.Root` shares with its header. */
export class SectionState {
	/** The id of the headline element. */
	readonly headlineId: string;
	/** Whether a header with a headline is rendered; the root's label points at it. */
	hasHeadline = $state(false);

	constructor(id: string) {
		this.headlineId = `${id}-headline`;
	}
}

/** Creates the section state from the root's id and publishes it. */
export function setSection(id: string): SectionState {
	return setContext(key, new SectionState(id));
}

/** Returns the state of the enclosing `Section.Root`, or `undefined` outside one. */
export function useSection(): SectionState | undefined {
	return getContext<SectionState | undefined>(key);
}
