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

const key = Symbol('oito2.master-detail');

/** The options of a `MasterDetailState`. */
export interface MasterDetailOptions {
	value: () => string | null | undefined;
	defaultValue: () => string | null;
	onChange: (value: string | null) => void;
}

/** The selection and layout a `MasterDetail.Root` shares with its parts. */
export class MasterDetailState {
	readonly #value: Controllable<string | null>;
	#tiles = $state<{ key: symbol; value: string }[]>([]);
	/** Whether the master and the detail are side by side. */
	wide = $state(true);
	/** Whether the width has been measured, so `wide` reflects the layout on screen. */
	measured = $state(false);
	/** The tile to focus once the master shows again in the narrow layout. */
	returnTo = $state<string | null>(null);

	constructor(options: MasterDetailOptions) {
		this.#value = new Controllable({
			value: options.value,
			defaultValue: options.defaultValue,
			onChange: options.onChange
		});
		// The side-by-side layout always shows a page: the first item's when nothing is
		// selected, which is then selected so the value tells what is on screen.
		$effect.pre(() => {
			const first = this.#tiles[0]?.value;
			if (this.measured && this.wide && this.#value.current === null && first !== undefined)
				this.#value.current = first;
		});
	}

	/** The value of the selected item, or `null` for none. */
	get value(): string | null {
		return this.#value.current;
	}

	/** Whether the master list shows. */
	get showsMaster(): boolean {
		return this.wide || this.value === null;
	}

	/** Whether the detail page shows. */
	get showsDetail(): boolean {
		return this.wide || this.value !== null;
	}

	/** The values of the tiles, in order. */
	get values(): string[] {
		return this.#tiles.map((tile) => tile.value);
	}

	/** Selects the item with `value`. */
	select(value: string): void {
		this.#value.current = value;
	}

	/** Goes back from the detail to the master in the narrow layout, clearing the selection. */
	back(): void {
		this.returnTo = this.value;
		this.#value.current = null;
	}

	/** Adds a tile and returns its key. */
	register(value: () => string): symbol {
		const tile = Symbol('tile');
		this.#tiles = [...untrack(() => this.#tiles), { key: tile, value: value() }];
		return tile;
	}

	/** Updates the value of a tile. */
	update(tile: symbol, value: string): void {
		const tiles = untrack(() => this.#tiles);
		if (tiles.some((each) => each.key === tile && each.value !== value))
			this.#tiles = tiles.map((each) => (each.key === tile ? { key: tile, value } : each));
	}

	/** Removes a tile. */
	unregister(tile: symbol): void {
		this.#tiles = this.#tiles.filter((each) => each.key !== tile);
	}
}

/** Publishes the master-detail state to its parts. */
export function setMasterDetail(state: MasterDetailState): MasterDetailState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `MasterDetail.Root`; throws outside one. */
export function useMasterDetail(): MasterDetailState {
	if (!hasContext(key)) throw new Error('MasterDetail parts must be inside a MasterDetail.Root');
	return getContext<MasterDetailState>(key);
}
