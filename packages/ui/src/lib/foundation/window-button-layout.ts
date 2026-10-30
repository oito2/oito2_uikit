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

import type { DesktopEnvironment } from './desktop-environment.js';
import type { Platform } from './platform.js';

/** A button that controls the native window. */
export type WindowButton = 'minimize' | 'maximize' | 'close';

/** The visual families used to draw window control buttons. */
export const windowControlStyles = [
	'gnome',
	'breeze',
	'xfwm',
	'cosmic',
	'windows',
	'macos',
	'none'
] as const;

/**
 * The visual family of the window control buttons: round GNOME buttons, KDE Breeze
 * glyphs, compact Xfwm glyphs, round COSMIC buttons, rectangular Windows buttons, the
 * native macOS traffic lights, or `none` when the browser or the system owns the window.
 */
export type WindowControlStyle = (typeof windowControlStyles)[number];

/**
 * Resolves the control style for `platform` and, on Linux, for its desktop environment.
 * Returns `none` on the web and on touch platforms; Linux environments without their own
 * style use `gnome`.
 */
export function resolveWindowControlStyle(
	platform: Platform,
	options: { desktopEnvironment?: DesktopEnvironment | null } = {}
): WindowControlStyle {
	if (!platform.isDesktopNative) return 'none';
	if (platform.isWindows) return 'windows';
	if (platform.isMacOS) return 'macos';
	switch (options.desktopEnvironment) {
		case 'kde':
			return 'breeze';
		case 'xfce':
			return 'xfwm';
		case 'cosmic':
			return 'cosmic';
		default:
			return 'gnome';
	}
}

const gnomeNames: Readonly<Record<string, WindowButton>> = {
	minimize: 'minimize',
	maximize: 'maximize',
	close: 'close'
};
const kdeLetters: Readonly<Record<string, WindowButton>> = {
	I: 'minimize',
	A: 'maximize',
	X: 'close'
};
const xfwmLetters: Readonly<Record<string, WindowButton>> = {
	H: 'minimize',
	M: 'maximize',
	C: 'close'
};

// Maps tokens to buttons, skipping unknown tokens and buttons already placed.
function side(
	tokens: string[],
	table: Readonly<Record<string, WindowButton>>,
	seen: Set<WindowButton>
): WindowButton[] {
	const buttons: WindowButton[] = [];
	for (const token of tokens) {
		const button = Object.hasOwn(table, token) ? table[token] : undefined;
		if (button && !seen.has(button)) {
			seen.add(button);
			buttons.push(button);
		}
	}
	return buttons;
}

/** The order and side of the window control buttons in a title bar. */
export class WindowButtonLayout {
	/** The buttons placed before the title, in display order. */
	readonly leading: readonly WindowButton[];

	/** The buttons placed after the title, in display order. */
	readonly trailing: readonly WindowButton[];

	constructor(
		options: { leading?: readonly WindowButton[]; trailing?: readonly WindowButton[] } = {}
	) {
		this.leading = options.leading ?? [];
		this.trailing = options.trailing ?? [];
	}

	/**
	 * Parses the GNOME `button-layout` format used by GNOME, Budgie, Cinnamon, MATE and
	 * Pantheon, such as `appmenu:minimize,maximize,close`. Names before the colon are
	 * leading, names after it trailing; other entries are ignored and each button is kept
	 * only at its first position.
	 */
	static parseGnome(value: string): WindowButtonLayout {
		const sides = value.split(':');
		const seen = new Set<WindowButton>();
		const names = (part: string | undefined) =>
			(part ?? '').split(',').map((name) => name.trim());
		const leading = side(names(sides[0]), gnomeNames, seen);
		const trailing = sides.length > 1 ? side(names(sides[1]), gnomeNames, seen) : [];
		return new WindowButtonLayout({ leading, trailing });
	}

	/**
	 * Parses the KDE KWin `ButtonsOnLeft` and `ButtonsOnRight` values, such as `MS` and
	 * `HIAX`. Recognizes `I` (minimize), `A` (maximize) and `X` (close); other letters are
	 * ignored and each button is kept only at its first position.
	 */
	static parseKde(values: { buttonsOnLeft: string; buttonsOnRight: string }): WindowButtonLayout {
		const seen = new Set<WindowButton>();
		const leading = side([...values.buttonsOnLeft], kdeLetters, seen);
		const trailing = side([...values.buttonsOnRight], kdeLetters, seen);
		return new WindowButtonLayout({ leading, trailing });
	}

	/**
	 * Parses the Xfce xfwm4 `button_layout` format, such as `O|HMC`. Letters before the `|`
	 * title marker are leading, letters after it trailing. Recognizes `H` (minimize), `M`
	 * (maximize) and `C` (close); other letters are ignored and each button is kept only at
	 * its first position.
	 */
	static parseXfwm(value: string): WindowButtonLayout {
		const sides = value.split('|');
		const seen = new Set<WindowButton>();
		const leading = side([...(sides[0] ?? '')], xfwmLetters, seen);
		const trailing = sides.length > 1 ? side([...(sides[1] ?? '')], xfwmLetters, seen) : [];
		return new WindowButtonLayout({ leading, trailing });
	}

	/**
	 * The default layout for `style`: leading close, minimize and maximize for `macos`, no
	 * buttons for `none`, and trailing minimize, maximize and close otherwise.
	 */
	static defaultFor(style: WindowControlStyle): WindowButtonLayout {
		if (style === 'macos')
			return new WindowButtonLayout({ leading: ['close', 'minimize', 'maximize'] });
		if (style === 'none') return new WindowButtonLayout();
		return new WindowButtonLayout({ trailing: ['minimize', 'maximize', 'close'] });
	}

	/** Whether the layout has no buttons at all. */
	get isEmpty(): boolean {
		return this.leading.length === 0 && this.trailing.length === 0;
	}

	/** Whether `other` places the same buttons in the same order. */
	equals(other: WindowButtonLayout): boolean {
		const same = (a: readonly WindowButton[], b: readonly WindowButton[]) =>
			a.length === b.length && a.every((button, index) => button === b[index]);
		return same(this.leading, other.leading) && same(this.trailing, other.trailing);
	}
}
