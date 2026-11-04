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
import type { Placement } from '../../internal/floating.js';
import type { Direction } from '../../internal/keyboard.js';

const key = Symbol('oito2.popover');

/** The side of its anchor where a popover opens; `start` and `end` follow the text direction. */
export type PopoverPlacement = 'top' | 'bottom' | 'start' | 'end';

/** How a popover lines up with its anchor along the anchor's edge. */
export type PopoverAlignment = 'start' | 'center' | 'end';

/** Returns the floating placement of a popover side and alignment in text direction `dir`. */
export function popoverPlacement(
	placement: PopoverPlacement,
	alignment: PopoverAlignment,
	dir: Direction
): Placement {
	const side =
		placement === 'start'
			? dir === 'rtl'
				? 'right'
				: 'left'
			: placement === 'end'
				? dir === 'rtl'
					? 'left'
					: 'right'
				: placement;
	return (alignment === 'center' ? side : `${side}-${alignment}`) as Placement;
}

/** Opens and closes a popover. Pass one to `Popover.Root` to open it from code. */
export class PopoverController {
	readonly #open: Controllable<boolean>;

	constructor(
		options: {
			open?: () => boolean | undefined;
			defaultOpen?: boolean;
			onOpenChange?: (open: boolean) => void;
		} = {}
	) {
		this.#open = new Controllable({
			value: options.open ?? (() => undefined),
			defaultValue: () => options.defaultOpen ?? false,
			onChange: (next) => options.onOpenChange?.(next)
		});
	}

	/** Whether the popover is open. */
	get isOpen(): boolean {
		return this.#open.current;
	}

	/** Opens the popover. */
	open(): void {
		this.#open.current = true;
	}

	/** Closes the popover. */
	close(): void {
		this.#open.current = false;
	}

	/** Opens the popover when closed and closes it when open. */
	toggle(): void {
		this.#open.current = !this.#open.current;
	}
}

/** What a `Popover.Root` shares with its parts. */
export class PopoverState {
	readonly id: string;
	readonly controller: PopoverController;
	/** The element that toggles the popover. */
	trigger = $state<HTMLElement | null>(null);
	/** The element the panel is placed against; the trigger when unset. */
	anchor = $state<HTMLElement | null>(null);
	/** The arrow element of the panel. */
	arrow = $state<HTMLElement | null>(null);
	/** Whether the panel has a `Popover.Title`. */
	hasTitle = $state(false);

	constructor(id: string, controller: PopoverController) {
		this.id = id;
		this.controller = controller;
	}

	/** Whether the panel is open. */
	get open(): boolean {
		return this.controller.isOpen;
	}

	/** The element the panel is placed against. */
	get reference(): HTMLElement | null {
		return this.anchor ?? this.trigger;
	}
}

/** Publishes the popover state to its parts. */
export function setPopover(state: PopoverState): PopoverState {
	return setContext(key, state);
}

/** Returns the state of the enclosing `Popover.Root`; throws outside one. */
export function usePopover(): PopoverState {
	if (!hasContext(key)) throw new Error('Popover parts must be inside a Popover.Root');
	return getContext<PopoverState>(key);
}
