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

/** A sort column or field and its direction. */
export interface SortDescriptor {
	/** The sorted column or field. */
	readonly column: string;
	/** The sort direction: smallest first (`ascending`) or largest first (`descending`). */
	readonly direction: 'ascending' | 'descending';
}

/** What an `AsyncListController` asks its `load` function for. */
export interface AsyncListRequest<C> {
	/** The cursor of the next page, or `null` for the first page. */
	readonly cursor: C | null;
	/** The current filter text. */
	readonly filterText: string;
	/** The current sort, or `null`. */
	readonly sort: SortDescriptor | null;
	/** Whether a newer request superseded this one; its result will be ignored. */
	readonly isCancelled: boolean;
	/** Aborts when a newer request supersedes this one, for passing to `fetch`. */
	readonly signal: AbortSignal;
}

/** A loaded page: its items and the cursor of the next page, or `null` after the last page. */
export interface AsyncListPage<T, C> {
	readonly items: readonly T[];
	readonly cursor?: C | null;
}

/** The options of an `AsyncListController`. */
export interface AsyncListControllerOptions<T, C> {
	/** Loads the page described by its request; errors it throws are kept in `error`. */
	load: (request: AsyncListRequest<C>) => Promise<AsyncListPage<T, C>>;
	/** Sorts loaded items locally; when absent, a sort change reloads. */
	sort?: (items: T[], sort: SortDescriptor) => T[];
	/** The items before the first load. */
	initialItems?: readonly T[];
	/** The filter text of the first load. */
	initialFilterText?: string;
	/** The sort of the first load. */
	initialSort?: SortDescriptor | null;
}

/**
 * Loads a list page by page from an asynchronous source, with filter text and sort,
 * for lists, tables and comboboxes that fetch their items.
 *
 * Its state is reactive. A newer load supersedes a running one: the older result is
 * ignored and its request reports `isCancelled` (and aborts its `signal`). It doesn't
 * load until `reload` is called.
 */
export class AsyncListController<T, C = unknown> {
	readonly #load: AsyncListControllerOptions<T, C>['load'];
	readonly #sort: AsyncListControllerOptions<T, C>['sort'];

	#items: readonly T[] = $state.raw([]);
	#filterText = $state('');
	#sortDescriptor: SortDescriptor | null = $state.raw(null);
	#cursor: C | null = null;
	#loaded = $state(false);
	#hasCursor = $state(false);
	#loading = $state(false);
	#loadingMore = $state(false);
	#error: unknown = $state.raw(null);
	#generation = 0;
	#controller: AbortController | null = null;
	#disposed = false;

	constructor(options: AsyncListControllerOptions<T, C>) {
		this.#load = options.load;
		this.#sort = options.sort;
		this.#items = Object.freeze([...(options.initialItems ?? [])]);
		this.#filterText = options.initialFilterText ?? '';
		this.#sortDescriptor = options.initialSort ?? null;
	}

	/** The loaded items. */
	get items(): readonly T[] {
		return this.#items;
	}

	/** The filter text sent with each load. */
	get filterText(): string {
		return this.#filterText;
	}

	/** The current sort, or `null`. */
	get sortDescriptor(): SortDescriptor | null {
		return this.#sortDescriptor;
	}

	/** Whether the first page is loading. */
	get isLoading(): boolean {
		return this.#loading;
	}

	/** Whether a further page is loading. */
	get isLoadingMore(): boolean {
		return this.#loadingMore;
	}

	/** The error of the last load, or `null` when it succeeded. */
	get error(): unknown {
		return this.#error;
	}

	/** Whether the last successful load returned a cursor for a further page. */
	get hasMore(): boolean {
		return this.#loaded && this.#hasCursor;
	}

	/** Replaces the items with the first page, superseding any running load. */
	reload(): Promise<void> {
		return this.#run(false);
	}

	/** Appends the next page, when `hasMore` and no load is running. */
	loadMore(): Promise<void> {
		if (!this.hasMore || this.#loading || this.#loadingMore) return Promise.resolve();
		return this.#run(true);
	}

	/** Sets the filter text and reloads; does nothing when `text` is the current filter text. */
	setFilterText(text: string): Promise<void> {
		if (text === this.#filterText) return Promise.resolve();
		this.#filterText = text;
		return this.reload();
	}

	/**
	 * Sets the sort to `descriptor`: sorts the loaded items locally with the `sort` option
	 * when both are present, otherwise reloads.
	 */
	setSort(descriptor: SortDescriptor | null): Promise<void> {
		this.#sortDescriptor = descriptor;
		if (this.#sort && descriptor) {
			this.#items = Object.freeze(this.#sort([...this.#items], descriptor));
			return Promise.resolve();
		}
		return this.reload();
	}

	/** Stops applying the results of running loads and aborts them. */
	dispose(): void {
		this.#disposed = true;
		this.#controller?.abort();
	}

	/**
	 * Loads the first page, or the next one when `more`, and applies the result unless a
	 * newer load or `dispose` superseded it.
	 */
	async #run(more: boolean): Promise<void> {
		const generation = ++this.#generation;
		this.#controller?.abort();
		const controller = new AbortController();
		this.#controller = controller;
		const current = () => generation === this.#generation && !this.#disposed;
		this.#error = null;
		if (more) {
			this.#loadingMore = true;
		} else {
			this.#loading = true;
			this.#loadingMore = false;
		}
		try {
			const page = await this.#load({
				cursor: more ? this.#cursor : null,
				filterText: this.#filterText,
				sort: this.#sortDescriptor,
				get isCancelled() {
					return !current();
				},
				signal: controller.signal
			});
			if (!current()) return;
			let items = more ? [...this.#items, ...page.items] : [...page.items];
			if (this.#sort && this.#sortDescriptor) items = this.#sort(items, this.#sortDescriptor);
			this.#items = Object.freeze(items);
			this.#cursor = page.cursor ?? null;
			this.#hasCursor = this.#cursor !== null;
			this.#loaded = true;
		} catch (error) {
			if (!current()) return;
			this.#error = error;
			if (!more) {
				// A failed first page invalidates the paging of the previous load, so loadMore
				// can't mix its cursor with the new filter or sort.
				this.#cursor = null;
				this.#hasCursor = false;
				this.#loaded = false;
			}
		} finally {
			if (current()) {
				this.#loading = false;
				this.#loadingMore = false;
			}
		}
	}
}
