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

import type { Attachment } from 'svelte/attachments';

/** Why a layer is asked to close. */
export type DismissReason = 'escape' | 'pointer-outside' | 'focus-outside';

/** The options of `dismissableLayer`. */
export interface DismissableLayerOptions {
	/** Called when the layer should close; the component decides whether it does. */
	onDismiss: (reason: DismissReason, event: Event) => void;
	/** Whether Escape closes the layer. Defaults to true. */
	closeOnEscape?: boolean;
	/** Whether a pointer press outside the layer closes it. Defaults to true. */
	closeOnPointerOutside?: boolean;
	/** Whether focus moving outside the layer closes it. Defaults to false. */
	closeOnFocusOutside?: boolean;
	/**
	 * Elements that count as inside the layer, such as the trigger that toggles it: a
	 * press on them doesn't close it, so the trigger's own click handler can.
	 */
	inside?: () => readonly (Element | null | undefined)[];
}

interface Layer {
	readonly node: HTMLElement;
	readonly options: DismissableLayerOptions;
}

/** The open layers, the topmost last. */
const layers: Layer[] = [];

/** Whether `target` is inside `layer`, its extra inside elements, or a layer opened above it. */
function isInside(layer: Layer, target: Node): boolean {
	const index = layers.indexOf(layer);
	const above = layers.slice(index);
	if (above.some((each) => each.node.contains(target))) return true;
	return (layer.options.inside?.() ?? []).some((element) => element?.contains(target));
}

/** Returns the topmost open layer. */
function topLayer(): Layer | undefined {
	return layers.at(-1);
}

/**
 * Makes an element a dismissable layer, such as a popover, a menu or a dialog: Escape, a
 * pointer press outside or focus moving outside asks it to close through `onDismiss`.
 * Layers stack: only the topmost one reacts, and a layer opened from another one (a
 * popover inside a dialog) counts as inside it, even when it is rendered elsewhere.
 */
export function dismissableLayer(options: DismissableLayerOptions): Attachment<HTMLElement> {
	return (node) => {
		const layer: Layer = { node, options };
		layers.push(layer);
		const document = node.ownerDocument;
		const {
			closeOnEscape = true,
			closeOnPointerOutside = true,
			closeOnFocusOutside = false
		} = options;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
			if (topLayer() !== layer || !closeOnEscape) return;
			event.preventDefault();
			options.onDismiss('escape', event);
		};

		const onPointerDown = (event: PointerEvent) => {
			if (!closeOnPointerOutside || topLayer() !== layer) return;
			if (event.button !== 0 && event.pointerType === 'mouse') return;
			const target = event.target as Node | null;
			if (!target || isInside(layer, target)) return;
			options.onDismiss('pointer-outside', event);
		};

		const onFocusIn = (event: FocusEvent) => {
			if (!closeOnFocusOutside || topLayer() !== layer) return;
			const target = event.target as Node | null;
			if (!target || isInside(layer, target)) return;
			options.onDismiss('focus-outside', event);
		};

		// The listeners are added on the next task, so the press or key that opened the
		// layer doesn't reach them and close it again at once.
		const timer = setTimeout(() => {
			document.addEventListener('keydown', onKeyDown);
			document.addEventListener('pointerdown', onPointerDown, true);
			document.addEventListener('focusin', onFocusIn);
		});

		return () => {
			clearTimeout(timer);
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('pointerdown', onPointerDown, true);
			document.removeEventListener('focusin', onFocusIn);
			const index = layers.indexOf(layer);
			if (index >= 0) layers.splice(index, 1);
		};
	};
}
