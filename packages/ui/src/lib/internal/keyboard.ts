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

/** A layout direction: left-to-right or right-to-left. */
export type Direction = 'ltr' | 'rtl';

/** The axis a group of items is laid out along. */
export type Orientation = 'horizontal' | 'vertical';

/** A movement a navigation key asks for inside a group of items. */
export type NavigationIntent = 'next' | 'previous' | 'first' | 'last';

/**
 * Returns the movement `key` asks for in a group laid out along `orientation`, or `null`
 * when the key doesn't navigate it. In right-to-left layouts the horizontal arrows are
 * swapped; a group with both orientations (`orientation` undefined) answers to all
 * four arrows.
 */
export function navigationIntent(
	key: string,
	options: { orientation?: Orientation; dir?: Direction } = {}
): NavigationIntent | null {
	const { orientation, dir = 'ltr' } = options;
	const horizontal = orientation !== 'vertical';
	const vertical = orientation !== 'horizontal';
	switch (key) {
		case 'ArrowDown':
			return vertical ? 'next' : null;
		case 'ArrowUp':
			return vertical ? 'previous' : null;
		case 'ArrowRight':
			return horizontal ? (dir === 'rtl' ? 'previous' : 'next') : null;
		case 'ArrowLeft':
			return horizontal ? (dir === 'rtl' ? 'next' : 'previous') : null;
		case 'Home':
			return 'first';
		case 'End':
			return 'last';
		default:
			return null;
	}
}

/** Returns the layout direction of `node` from its computed style. */
export function directionOf(node: Element): Direction {
	return getComputedStyle(node).direction === 'rtl' ? 'rtl' : 'ltr';
}

const textInputTypes = new Set([
	'text',
	'search',
	'url',
	'tel',
	'email',
	'password',
	'number',
	'date',
	'datetime-local',
	'month',
	'time',
	'week'
]);

/** Whether `target` is an element that takes typed text: a text input, a text area or editable content. */
export function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	if (target instanceof HTMLTextAreaElement) return !target.readOnly && !target.disabled;
	if (target instanceof HTMLInputElement) {
		return textInputTypes.has(target.type) && !target.readOnly && !target.disabled;
	}
	return target instanceof HTMLSelectElement;
}

/** Whether a key event is a printable character without Control, Alt or Meta, as typeahead reads it. */
export function isPrintableKey(event: KeyboardEvent): boolean {
	return (
		event.key.length === 1 &&
		event.key.trim() !== '' &&
		!event.ctrlKey &&
		!event.altKey &&
		!event.metaKey
	);
}
