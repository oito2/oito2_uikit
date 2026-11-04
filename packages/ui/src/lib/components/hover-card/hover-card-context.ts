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

const key = Symbol('oito2.hover-card');

/** The timers a `HoverCard.Root` shares with its trigger and content. */
export interface HoverCardContext {
	/** Opens or closes the card after its delay, replacing a pending change. */
	schedule(open: boolean): void;
	/** Cancels a pending change. */
	cancel(): void;
	/** Opens the card at once. */
	openNow(): void;
}

/** Publishes the hover card timers. */
export function setHoverCard(context: HoverCardContext): void {
	setContext(key, context);
}

/** Returns the timers of the enclosing `HoverCard.Root`; throws outside one. */
export function useHoverCard(): HoverCardContext {
	const context = getContext<HoverCardContext | undefined>(key);
	if (!context) throw new Error('HoverCard parts must be inside a HoverCard.Root');
	return context;
}
