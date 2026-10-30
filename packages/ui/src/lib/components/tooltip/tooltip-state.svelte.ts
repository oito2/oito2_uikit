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
import { createAttachmentKey } from 'svelte/attachments';
import { Controllable } from '../../internal/controllable.svelte.js';

const key = Symbol('oito2.tooltip');

/** The options of a `TooltipState`. */
export interface TooltipOptions {
	open: () => boolean | undefined;
	onOpenChange: (open: boolean) => void;
	delay: () => number;
	disabled: () => boolean;
	id: string;
}

/**
 * The state of a tooltip: opens after a hover delay or at once on keyboard focus, closes
 * when the pointer leaves, focus moves away, the trigger is pressed or Escape is pressed.
 */
export class TooltipState {
	readonly id: string;
	trigger: HTMLElement | null = $state(null);
	readonly #open: Controllable<boolean>;
	readonly #options: TooltipOptions;
	#timer: ReturnType<typeof setTimeout> | undefined;
	readonly #attachKey = createAttachmentKey();

	/** Records the trigger element while it is mounted. */
	readonly #attach = (node: HTMLElement) => {
		this.trigger = node;
		return () => {
			if (this.trigger === node) this.trigger = null;
			clearTimeout(this.#timer);
		};
	};

	constructor(options: TooltipOptions) {
		this.id = options.id;
		this.#options = options;
		this.#open = new Controllable({
			value: options.open,
			defaultValue: () => false,
			onChange: options.onOpenChange
		});
	}

	/** Whether the tooltip shows. */
	get open(): boolean {
		return this.#open.current && !this.#options.disabled();
	}

	/** Shows the tooltip after `delay` milliseconds, or at once with `0`. */
	show(delay = this.#options.delay()): void {
		clearTimeout(this.#timer);
		if (this.#options.disabled()) return;
		if (delay <= 0) this.#open.current = true;
		else this.#timer = setTimeout(() => (this.#open.current = true), delay);
	}

	/** Hides the tooltip and cancels a pending show. */
	hide(): void {
		clearTimeout(this.#timer);
		this.#open.current = false;
	}

	/** The attributes and handlers the trigger element needs. */
	get triggerProps(): Record<string | symbol, unknown> {
		return {
			'aria-describedby': this.open ? this.id : undefined,
			onpointerenter: (event: PointerEvent) => {
				if (event.pointerType === 'mouse') this.show();
			},
			onpointerleave: () => this.hide(),
			onpointerdown: () => this.hide(),
			onfocus: (event: FocusEvent) => {
				if ((event.currentTarget as HTMLElement).matches(':focus-visible')) this.show(0);
			},
			onblur: () => this.hide(),
			// Escape hides the tooltip and still reaches the dialog or menu around it.
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Escape') this.hide();
			},
			[this.#attachKey]: this.#attach
		};
	}
}

/** Publishes a tooltip state to its trigger and content. */
export function setTooltip(state: TooltipState): void {
	setContext(key, state);
}

/** Returns the state of the enclosing `Tooltip.Root`; throws outside one. */
export function useTooltip(): TooltipState {
	if (!hasContext(key)) throw new Error('Tooltip parts must be inside a Tooltip.Root');
	return getContext<TooltipState>(key);
}
