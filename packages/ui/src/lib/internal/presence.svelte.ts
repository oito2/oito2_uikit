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

import { untrack } from 'svelte';

/**
 * Keeps an element mounted while it plays its exit animation: `present` turns true as
 * soon as `open` does, and false only after the element's CSS animation ends once `open`
 * turns false, or at once when it has no animation (or motion is reduced). Components
 * render the element while `present` and set `data-state="open"`/`"closed"` from `open`,
 * so CSS starts the exit animation.
 *
 * Must be created during component initialization.
 */
export class Presence {
	#open: () => boolean;
	#element: HTMLElement | null = null;
	#present = $state(false);

	constructor(open: () => boolean) {
		this.#open = open;
		this.#present = open();
		$effect.pre(() => {
			if (this.#open()) this.#present = true;
			else untrack(() => this.#leave());
		});
	}

	/** Whether the element should be in the document. */
	get present(): boolean {
		return this.#present;
	}

	/** Attaches the animated element: `{@attach presence.attach}`. */
	attach = (element: HTMLElement) => {
		this.#element = element;
		return () => {
			if (this.#element === element) this.#element = null;
		};
	};

	/** Unmounts the element after its exit animation, unless it opens again first. */
	#leave(): void {
		const element = this.#element;
		if (!element || !this.#present) {
			this.#present = false;
			return;
		}
		// The closed state is applied first, so the exit animation is among the ones read
		// below. Waiting on the animations themselves, instead of on `animationend`, also
		// covers an animation that already ended before this frame.
		requestAnimationFrame(() => {
			if (this.#open()) return;
			const running = element
				.getAnimations()
				.filter((animation) => animation.playState !== 'finished');
			void Promise.allSettled(running.map((animation) => animation.finished)).then(() => {
				if (!this.#open()) this.#present = false;
			});
		});
	}
}
