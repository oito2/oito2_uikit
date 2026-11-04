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

import type { InfoType } from '../../theme/css.js';

/** Where a `Toaster` stacks its toasts; `start` and `end` follow the text direction. */
export type ToasterPlacement =
	'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end';

/** A short message shown by a `Toaster`. */
export interface Toast {
	/** The message. */
	readonly title: string;
	/** More detail below the title. */
	readonly description?: string;
	/** The kind of message, which adds its icon. */
	readonly type?: InfoType;
	/** The label of an action button. */
	readonly actionLabel?: string;
	/** Called when the action is chosen; the toast then closes. */
	readonly onAction?: () => void;
	/** How long the toast stays, in milliseconds; `null` keeps it until closed. Defaults to 4000. */
	readonly duration?: number | null;
	/** Whether the toast shows a spinner and stays until updated. */
	readonly loading?: boolean;
	/** Whether a close button and Escape close it. Defaults to true. */
	readonly dismissible?: boolean;
}

/** A toast in a `Toaster`. */
export interface ToastEntry {
	readonly id: number;
	toast: Toast;
	closing: boolean;
	remaining: number | null;
	startedAt: number | null;
	timer: ReturnType<typeof setTimeout> | null;
}

/** Changes or closes a toast after it is shown. */
export interface ToastHandle {
	/** Whether the toast is still shown and not closing. */
	readonly isActive: boolean;
	/** Replaces the toast's content, restarting its time. */
	update(toast: Toast): void;
	/** Closes the toast. */
	dismiss(): void;
}

let nextId = 0;

/**
 * The toasts of an app: shown by `toast()`, rendered by `Toaster`. The toasts past
 * `maxVisible` wait their turn, and every timer pauses while the pointer is over the
 * toasts or focus is inside them.
 */
export class ToasterStore {
	/** The toasts, oldest first. */
	entries = $state<ToastEntry[]>([]);
	/** How many toasts show at once. */
	maxVisible = $state(3);
	#paused = false;

	/** The toasts on screen. */
	get visible(): ToastEntry[] {
		return this.entries.slice(0, this.maxVisible);
	}

	/** Shows `toast` and returns its handle. */
	show(toast: Toast): ToastHandle {
		const entry: ToastEntry = {
			id: nextId++,
			toast,
			closing: false,
			remaining: null,
			startedAt: null,
			timer: null
		};
		this.entries.push(entry);
		this.sync();
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const store = this;
		const live = () => store.entries.find((each) => each.id === entry.id);
		return {
			get isActive() {
				const current = live();
				return current !== undefined && !current.closing;
			},
			update: (next) => store.#update(entry.id, next),
			dismiss: () => store.dismiss(entry.id)
		};
	}

	/**
	 * Shows `loading` until `promise` settles, then replaces it with `success(value)` or
	 * `error(reason)`, and returns the promise.
	 */
	promise<T>(
		promise: Promise<T>,
		messages: {
			loading: Toast;
			success: (value: T) => Toast;
			error: (reason: unknown) => Toast;
		}
	): Promise<T> {
		const handle = this.show({ duration: null, ...messages.loading, loading: true });
		promise.then(
			(value) => {
				if (handle.isActive) handle.update(messages.success(value));
			},
			(reason: unknown) => {
				if (handle.isActive) handle.update(messages.error(reason));
			}
		);
		return promise;
	}

	/** Closes the toast with `id`. */
	dismiss(id: number): void {
		const entry = this.entries.find((each) => each.id === id);
		if (!entry || entry.closing) return;
		this.#stop(entry);
		entry.closing = true;
		if (!this.visible.includes(entry)) this.removed(id);
		this.sync();
	}

	/** Closes every toast. */
	dismissAll(): void {
		for (const entry of [...this.entries]) this.dismiss(entry.id);
	}

	/** Removes a toast once its exit animation ends. */
	removed(id: number): void {
		this.entries = this.entries.filter((each) => each.id !== id);
		this.sync();
	}

	/** Pauses or resumes the timers. */
	setPaused(paused: boolean): void {
		this.#paused = paused;
		this.sync();
	}

	#update(id: number, toast: Toast): void {
		const entry = this.entries.find((each) => each.id === id);
		if (!entry || entry.closing) return;
		this.#stop(entry);
		entry.toast = toast;
		entry.remaining = null;
		this.sync();
	}

	#stop(entry: ToastEntry): void {
		if (entry.timer !== null && entry.startedAt !== null && entry.remaining !== null)
			entry.remaining -= Date.now() - entry.startedAt;
		if (entry.timer !== null) clearTimeout(entry.timer);
		entry.timer = null;
		entry.startedAt = null;
	}

	/** Starts, pauses or keeps the timers of the toasts on screen. */
	sync(): void {
		for (const entry of this.visible) {
			const duration = entry.toast.duration === undefined ? 4000 : entry.toast.duration;
			if (entry.closing || entry.toast.loading || duration === null) continue;
			entry.remaining ??= duration;
			if (this.#paused) this.#stop(entry);
			else if (entry.timer === null) {
				entry.startedAt = Date.now();
				entry.timer = setTimeout(() => this.dismiss(entry.id), entry.remaining);
			}
		}
	}
}

/** The toasts the `toast()` functions show and the default `Toaster` renders. */
export const toaster = new ToasterStore();

/** Shows a toast in the app's `Toaster` and returns its handle. */
export function toast(message: Toast | string): ToastHandle {
	return toaster.show(typeof message === 'string' ? { title: message } : message);
}

/** Shows a loading toast until `promise` settles, then its outcome; returns the promise. */
toast.promise = <T>(
	promise: Promise<T>,
	messages: { loading: Toast; success: (value: T) => Toast; error: (reason: unknown) => Toast }
): Promise<T> => toaster.promise(promise, messages);

/** Closes every toast. */
toast.dismissAll = (): void => toaster.dismissAll();
