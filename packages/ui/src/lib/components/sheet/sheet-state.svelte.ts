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

const key = Symbol('oito2.sheet');

/** The window edge a sheet slides in from; `start` and `end` follow the text direction. */
export type SheetSide = 'start' | 'end' | 'bottom';

/** The options of a `SheetState`. */
export interface SheetOptions {
	id: string;
	open: () => boolean | undefined;
	defaultOpen: () => boolean;
	onOpenChange: (open: boolean) => void;
	side: () => SheetSide;
	modal: () => boolean;
	dismissible: () => boolean;
	snapPoints: () => readonly number[] | undefined;
	snap: () => number | undefined;
	defaultSnap: () => number;
	onSnapChange: (snap: number) => void;
}

/**
 * Returns the snap point closest to a bottom sheet dragged so its top sits `offset`
 * pixels below the tallest point, in a window `height` pixels tall, moved one step by a
 * fling (`velocity` in pixels per second toward the edge); `-1` dismisses it.
 */
export function settleSnap(
	snaps: readonly number[],
	current: number,
	offset: number,
	height: number,
	velocity: number,
	dismissible: boolean
): number {
	const last = snaps.at(-1) ?? 1;
	let best = 0;
	let distance = Number.POSITIVE_INFINITY;
	snaps.forEach((snap, index) => {
		const d = Math.abs((last - snap) * height - offset);
		if (d < distance) {
			best = index;
			distance = d;
		}
	});
	if (velocity > 700) best = Math.min(best, current - 1);
	if (velocity < -700) best = Math.max(best, current + 1);
	const first = snaps[0] ?? last;
	if (best < 0 || (dismissible && offset > (last - first / 2) * height))
		return dismissible ? -1 : 0;
	return Math.min(Math.max(best, 0), snaps.length - 1);
}

/** The state a `Sheet.Root` shares with its parts. */
export class SheetState {
	readonly #options: SheetOptions;
	readonly #open: Controllable<boolean>;
	readonly #snap: Controllable<number>;
	readonly id: string;
	/** The drag distance toward the sheet's edge, in pixels. */
	drag = $state(0);
	/** Whether a drag is in progress. */
	dragging = $state(false);
	/** Whether the sheet has a `Sheet.Title`. */
	hasTitle = $state(false);

	constructor(options: SheetOptions) {
		this.#options = options;
		this.id = options.id;
		this.#open = new Controllable({
			value: options.open,
			defaultValue: options.defaultOpen,
			onChange: options.onOpenChange
		});
		this.#snap = new Controllable({
			value: options.snap,
			defaultValue: options.defaultSnap,
			onChange: options.onSnapChange
		});
	}

	get open(): boolean {
		return this.#open.current;
	}

	set open(value: boolean) {
		if (value) {
			this.drag = 0;
			this.dragging = false;
		}
		this.#open.current = value;
	}

	get side(): SheetSide {
		return this.#options.side();
	}

	get modal(): boolean {
		return this.#options.modal();
	}

	get dismissible(): boolean {
		return this.#options.dismissible();
	}

	get snapPoints(): readonly number[] | undefined {
		const snaps = this.#options.snapPoints();
		return this.side === 'bottom' && snaps && snaps.length > 0 ? snaps : undefined;
	}

	/** The index of the snap point a bottom sheet rests at. */
	get snap(): number {
		const snaps = this.snapPoints;
		return snaps ? Math.min(Math.max(this.#snap.current, 0), snaps.length - 1) : 0;
	}

	set snap(value: number) {
		const snaps = this.snapPoints;
		if (!snaps) return;
		this.#snap.current = Math.min(Math.max(value, 0), snaps.length - 1);
	}

	/** Closes the sheet when it can be dismissed. */
	dismiss(): void {
		if (this.dismissible) this.open = false;
	}
}

/** Publishes the sheet state to its parts. */
export function setSheet(state: SheetState): SheetState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Sheet.Root`; throws outside one. */
export function useSheet(): SheetState {
	if (!hasContext(key)) throw new Error('Sheet parts must be inside a Sheet.Root');
	return getContext<SheetState>(key);
}
