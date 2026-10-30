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

const key = Symbol('oito2.dialog');

/** The options of a `DialogState`. */
export interface DialogOptions {
	open: () => boolean | undefined;
	defaultOpen: () => boolean;
	onOpenChange: (open: boolean) => void;
	id: string;
}

/** The state a `Dialog.Root` shares with its parts. */
export class DialogState {
	readonly #open: Controllable<boolean>;
	readonly titleId: string;
	readonly descriptionId: string;
	/** Whether a `Dialog.Title` is rendered. */
	hasTitle = $state(false);
	/** Whether a `Dialog.Description` is rendered. */
	hasDescription = $state(false);

	constructor(options: DialogOptions) {
		this.titleId = `${options.id}-title`;
		this.descriptionId = `${options.id}-description`;
		this.#open = new Controllable({
			value: options.open,
			defaultValue: options.defaultOpen,
			onChange: options.onOpenChange
		});
	}

	/** Whether the dialog is open. */
	get open(): boolean {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
	}
}

/** Publishes a dialog state to its parts. */
export function setDialog(state: DialogState): void {
	setContext(key, state);
}

/** Returns the state of the enclosing `Dialog.Root`; throws outside one. */
export function useDialog(): DialogState {
	if (!hasContext(key)) throw new Error('Dialog parts must be inside a Dialog.Root');
	return getContext<DialogState>(key);
}
