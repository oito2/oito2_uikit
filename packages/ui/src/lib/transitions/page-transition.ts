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

import type { TransitionConfig } from 'svelte/transition';

/** The parameters of `pageTransition`. */
export interface PageTransitionParams {
	/** The length in milliseconds. Defaults to 300. */
	duration?: number;
	/** The wait before it starts, in milliseconds. Defaults to 0. */
	delay?: number;
	/** The fraction of the page width the page travels. Defaults to 0.04. */
	distance?: number;
}

/** Eases out on a cubic curve, as Flutter's `easeOutCubic`. */
function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3;
}

/**
 * The desktop page transition of @oito2/ui, as a Svelte transition: the page fades in
 * while sliding a short distance from the reading end side (from the right in
 * left-to-right text), and leaves the same way back. When the user prefers reduced motion
 * it takes no time.
 *
 * ```svelte
 * {#key page.url.pathname}
 *   <main in:pageTransition>…</main>
 * {/key}
 * ```
 */
export function pageTransition(node: Element, params: PageTransitionParams = {}): TransitionConfig {
	const reduced =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const sign = getComputedStyle(node).direction === 'rtl' ? -1 : 1;
	const distance = (params.distance ?? 0.04) * 100 * sign;
	return {
		delay: params.delay ?? 0,
		duration: reduced ? 0 : (params.duration ?? 300),
		easing: easeOutCubic,
		css: (t, u) => `opacity: ${t}; transform: translateX(${u * distance}%);`
	};
}
