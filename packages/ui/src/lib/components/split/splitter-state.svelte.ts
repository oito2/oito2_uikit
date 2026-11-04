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
import {
	fitSplitter,
	moveDivider,
	paneMax,
	paneMin,
	toggleDivider,
	type SplitterLayout,
	type SplitterPaneLimits
} from './splitter-sizes.js';

const key = Symbol('oito2.splitter');

/** A pane registered with a splitter. */
interface RegisteredPane {
	readonly key: symbol;
	readonly limits: () => SplitterPaneLimits;
	readonly defaultCollapsed: boolean;
}

/** The options of a `SplitterState`. */
export interface SplitterOptions {
	orientation: () => 'horizontal' | 'vertical';
	onSizesChange: () => ((sizes: readonly number[]) => void) | undefined;
}

/** The pane sizes a `Splitter.Root` shares with its panes. */
export class SplitterState {
	readonly #options: SplitterOptions;
	#panes = $state<RegisteredPane[]>([]);
	#layout = $state<SplitterLayout>({ sizes: [], collapsed: [], restore: [], available: 0 });
	/** The length of the main axis, minus the dividers. */
	extent = $state(0);

	constructor(options: SplitterOptions) {
		this.#options = options;
		$effect.pre(() => {
			const available = Math.max(0, this.extent - (this.#panes.length - 1));
			const panes = this.#limits();
			const layout = this.#layout;
			if (available === layout.available && layout.sizes.length === panes.length) return;
			this.#layout = fitSplitter(panes, available, {
				...layout,
				collapsed:
					layout.collapsed.length === panes.length
						? layout.collapsed
						: this.#panes.map((pane) => pane.defaultCollapsed),
				restore: layout.restore.length === panes.length ? layout.restore : [],
				sizes: layout.sizes.length === panes.length ? layout.sizes : []
			});
		});
	}

	#limits(): SplitterPaneLimits[] {
		return this.#panes.map((pane) => pane.limits());
	}

	/** Whether the panes sit side by side or stacked. */
	get orientation(): 'horizontal' | 'vertical' {
		return this.#options.orientation();
	}

	/** The number of panes. */
	get count(): number {
		return this.#panes.length;
	}

	/** The space the panes fill. */
	get available(): number {
		return this.#layout.available;
	}

	/** Adds a pane at the end of the order and returns its key. */
	register(limits: () => SplitterPaneLimits, defaultCollapsed: boolean): symbol {
		const pane = { key: Symbol('pane'), limits, defaultCollapsed };
		this.#panes = [...untrack(() => this.#panes), pane];
		return pane.key;
	}

	/** Removes a pane. */
	unregister(pane: symbol): void {
		this.#panes = this.#panes.filter((each) => each.key !== pane);
		this.#layout = { sizes: [], collapsed: [], restore: [], available: 0 };
	}

	/** Returns the index of the pane with `pane`. */
	indexOf(pane: symbol): number {
		return this.#panes.findIndex((each) => each.key === pane);
	}

	/** Returns the size of pane `i`, or `undefined` before the first layout. */
	size(i: number): number | undefined {
		return this.#layout.sizes[i];
	}

	/** Whether pane `i` is collapsed. */
	collapsed(i: number): boolean {
		return this.#layout.collapsed[i] ?? false;
	}

	/** The smallest size of pane `i`. */
	min(i: number): number {
		return paneMin(this.#limits(), this.#layout, i);
	}

	/** The largest size of pane `i`, bounded by the space. */
	max(i: number): number {
		return Math.min(paneMax(this.#limits(), this.#layout, i), this.#layout.available);
	}

	#apply(layout: SplitterLayout | null): void {
		if (!layout) return;
		this.#layout = layout;
		this.#options.onSizesChange()?.([...layout.sizes]);
	}

	/** Moves the divider after pane `i` by `delta` pixels toward the end. */
	move(i: number, delta: number): void {
		this.#apply(moveDivider(this.#limits(), this.#layout, i, delta));
	}

	/** Collapses or restores the collapsible pane next to the divider after pane `i`. */
	toggle(i: number): void {
		this.#apply(toggleDivider(this.#limits(), this.#layout, i));
	}
}

/** Publishes the splitter state to its panes. */
export function setSplitter(state: SplitterState): SplitterState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Splitter.Root`; throws outside one. */
export function useSplitter(): SplitterState {
	if (!hasContext(key)) throw new Error('Splitter panes must be inside a Splitter.Root');
	return getContext<SplitterState>(key);
}
