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

// Public API of @oito2/ui-test-utils: helpers shared by the browser tests of the packages.
// The module relies on DOM APIs only, so it loads under any test runner.

/** Anything that resolves to a DOM element on demand, such as a browser-mode locator. */
export interface ElementSource {
	element(): Element;
}

/** Returns the element `locator` resolves to, typed as an `HTMLElement`. */
export const el = (locator: ElementSource): HTMLElement => locator.element() as HTMLElement;

/** Resolves after `ms` milliseconds. */
export const wait = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/** Waits for the finite animations on the page to end; infinite ones are skipped. */
export async function settleAnimations(): Promise<void> {
	const finite = document
		.getAnimations()
		.filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
	await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
}

/** Waits for the document fonts to be ready, then `ms` more milliseconds for transitions. */
export async function settleFonts(ms = 300): Promise<void> {
	await document.fonts.ready;
	await wait(ms);
}

/** Resolves after two animation frames, once observers and attachments have run. */
export const frames = (): Promise<void> =>
	new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** Dispatches a bubbling, cancelable pointer event of `type` at client position `x`, `y` on `target`. */
export function pointer(
	target: Element,
	type: string,
	x: number,
	y: number,
	options: PointerEventInit = {}
): void {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: 'mouse',
			button: 0,
			buttons: 1,
			clientX: x,
			clientY: y,
			...options
		})
	);
}

/** A clipboard stub installed by {@link stubClipboard}. */
export interface ClipboardStub {
	/** The texts written to the clipboard since the stub was installed, in order. */
	copied: string[];
	/** Reinstates the clipboard the page had before the stub was installed. */
	restore(): void;
}

/**
 * Replaces `navigator.clipboard` with a stub whose `writeText` records the texts in `copied`.
 * `restore` puts the original property back, or removes the stub when there was none.
 */
export function stubClipboard(): ClipboardStub {
	const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
	const copied: string[] = [];
	Object.defineProperty(Navigator.prototype, 'clipboard', {
		configurable: true,
		get: () => ({ writeText: async (text: string) => void copied.push(text) })
	});
	return {
		copied,
		restore() {
			if (original) Object.defineProperty(Navigator.prototype, 'clipboard', original);
			else delete (Navigator.prototype as { clipboard?: unknown }).clipboard;
		}
	};
}
