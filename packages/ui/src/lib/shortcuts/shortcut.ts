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

import type { OperatingSystem } from '../foundation/platform.js';

/** Whether `os` uses Command as its primary modifier (macOS and iOS) instead of Control. */
export function usesCommandKey(os: OperatingSystem): boolean {
	return os === 'macos' || os === 'ios';
}

/**
 * Keys named differently than their key name: the text form and the Apple symbol.
 */
const specialLabels: Readonly<Record<string, readonly [string, string]>> = {
	Enter: ['Enter', '↩'],
	Escape: ['Esc', '⎋'],
	Backspace: ['Backspace', '⌫'],
	Delete: ['Delete', '⌦'],
	Tab: ['Tab', '⇥'],
	Space: ['Space', 'Space'],
	ArrowUp: ['↑', '↑'],
	ArrowDown: ['↓', '↓'],
	ArrowLeft: ['←', '←'],
	ArrowRight: ['→', '→'],
	PageUp: ['PgUp', '⇞'],
	PageDown: ['PgDn', '⇟'],
	Home: ['Home', '↖'],
	End: ['End', '↘']
};

/** Key names of `Shortcut.parse` that are not letters, digits or function keys. */
const namedKeys: Readonly<Record<string, string>> = {
	enter: 'Enter',
	return: 'Enter',
	esc: 'Escape',
	escape: 'Escape',
	space: 'Space',
	tab: 'Tab',
	backspace: 'Backspace',
	delete: 'Delete',
	up: 'ArrowUp',
	down: 'ArrowDown',
	left: 'ArrowLeft',
	right: 'ArrowRight',
	home: 'Home',
	end: 'End',
	pageup: 'PageUp',
	pagedown: 'PageDown',
	',': ',',
	'.': '.',
	'/': '/',
	';': ';',
	'-': '-',
	'=': '=',
	'[': '[',
	']': ']'
};

/** The keys of punctuation `KeyboardEvent.code`s, read regardless of Shift. */
const punctuationCodes: Readonly<Record<string, string>> = {
	Comma: ',',
	Period: '.',
	Slash: '/',
	Semicolon: ';',
	Minus: '-',
	Equal: '=',
	BracketLeft: '[',
	BracketRight: ']'
};

const modifierKeys = new Set([
	'Control',
	'Shift',
	'Alt',
	'AltGraph',
	'Meta',
	'OS',
	'Super',
	'Hyper',
	'CapsLock',
	'Fn',
	'FnLock'
]);

/** The modifiers of a `KeyChord`; every one defaults to false. */
export interface KeyChordModifiers {
	/** The platform's primary modifier: Command on Apple systems, Control elsewhere. */
	primary?: boolean;
	/** Control. */
	control?: boolean;
	/** Shift. */
	shift?: boolean;
	/** Alt (Option on Apple keyboards). */
	alt?: boolean;
	/** Meta (Command on Apple keyboards, Super elsewhere). */
	meta?: boolean;
}

/**
 * A key with the modifiers held while it is pressed, such as Control+K.
 *
 * Keys are named like `KeyboardEvent.key` for named keys (`Enter`, `Escape`, `ArrowUp`,
 * `F5`…), with `Space` for the space bar, and as lower-case characters otherwise (`k`,
 * `1`, `,`). A chord with `primary` stands for Command+key on Apple systems and
 * Control+key elsewhere; `resolve` turns it into the concrete modifier.
 */
export class KeyChord {
	/** The key, without modifiers. */
	readonly key: string;
	/** Whether the platform's primary modifier is held. */
	readonly primary: boolean;
	/** Whether Control is held. */
	readonly control: boolean;
	/** Whether Shift is held. */
	readonly shift: boolean;
	/** Whether Alt (Option on Apple keyboards) is held. */
	readonly alt: boolean;
	/** Whether Meta (Command on Apple keyboards, Super elsewhere) is held. */
	readonly meta: boolean;

	constructor(key: string, modifiers: KeyChordModifiers = {}) {
		this.key = key;
		this.primary = modifiers.primary ?? false;
		this.control = modifiers.control ?? false;
		this.shift = modifiers.shift ?? false;
		this.alt = modifiers.alt ?? false;
		this.meta = modifiers.meta ?? false;
	}

	/**
	 * Creates the chord of a key event with its held modifiers. Letters follow the
	 * keyboard layout; digits and punctuation are read from the physical key, so Shift+1
	 * is `1` with Shift on every layout. The chord sets `control` and `meta` as pressed,
	 * never `primary`; `matches` resolves `primary` when comparing.
	 */
	static fromEvent(event: KeyboardEvent): KeyChord {
		return new KeyChord(KeyChord.keyOf(event), {
			control: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
			meta: event.metaKey
		});
	}

	/** Returns the key name of a key event, as `fromEvent` reads it. */
	static keyOf(event: KeyboardEvent): string {
		const key = event.key;
		if (/^[a-z]$/i.test(key)) return key.toLowerCase();
		const code = event.code;
		const letter = /^Key([A-Z])$/.exec(code);
		if (letter?.[1]) return letter[1].toLowerCase();
		const digit = /^(?:Digit|Numpad)([0-9])$/.exec(code);
		if (digit?.[1]) return digit[1];
		const punctuation = punctuationCodes[code];
		if (punctuation) return punctuation;
		if (key === ' ' || code === 'Space') return 'Space';
		return key.length === 1 ? key.toLowerCase() : key;
	}

	/** Whether `key` is a modifier key on its own: Control, Shift, Alt, Meta, Caps Lock or Fn. */
	static isModifierKey(key: string): boolean {
		return modifierKeys.has(key);
	}

	/** Whether the chord holds a modifier other than Shift, so it can't be typed as text. */
	get hasCommandModifier(): boolean {
		return this.primary || this.control || this.alt || this.meta;
	}

	/** Returns the chord with `primary` turned into Command (meta) or Control for `os`. */
	resolve(os: OperatingSystem): KeyChord {
		if (!this.primary) return this;
		const apple = usesCommandKey(os);
		return new KeyChord(this.key, {
			control: this.control || !apple,
			shift: this.shift,
			alt: this.alt,
			meta: this.meta || apple
		});
	}

	/** Whether this chord, resolved for `os`, is `other` resolved for `os`. */
	matches(other: KeyChord, os: OperatingSystem): boolean {
		return this.resolve(os).equals(other.resolve(os));
	}

	/** Whether this chord has the same key and modifiers as `other`, without resolving `primary`. */
	equals(other: KeyChord): boolean {
		return (
			other.key === this.key &&
			other.primary === this.primary &&
			other.control === this.control &&
			other.shift === this.shift &&
			other.alt === this.alt &&
			other.meta === this.meta
		);
	}

	/**
	 * Returns the display parts of the chord on `os`: the modifier names or symbols, in
	 * the platform order, then the key.
	 */
	parts(os: OperatingSystem): string[] {
		const chord = this.resolve(os);
		const apple = usesCommandKey(os);
		const parts: string[] = [];
		if (chord.control) parts.push(apple ? '⌃' : 'Ctrl');
		if (chord.alt) parts.push(apple ? '⌥' : 'Alt');
		if (chord.shift) parts.push(apple ? '⇧' : 'Shift');
		if (chord.meta) parts.push(apple ? '⌘' : 'Super');
		parts.push(KeyChord.keyLabel(this.key, os));
		return parts;
	}

	/** Returns the chord as text on `os`, such as `Ctrl+Shift+K` or `⇧⌘K`. */
	label(os: OperatingSystem): string {
		return this.parts(os).join(usesCommandKey(os) ? '' : '+');
	}

	/**
	 * Returns the display name of `key` on `os`: a text name or an Apple symbol for special
	 * keys, and the upper-cased key for single characters.
	 */
	static keyLabel(key: string, os: OperatingSystem): string {
		const special = specialLabels[key];
		if (special) return usesCommandKey(os) ? special[1] : special[0];
		return key.length === 1 ? key.toUpperCase() : key;
	}

	/** Returns the chord as Linux text, such as `Ctrl+K`. */
	toString(): string {
		return this.label('linux');
	}
}

/**
 * A keyboard shortcut: one chord, or a sequence of chords pressed in order such as `G H`.
 */
export class Shortcut {
	/** The chords, pressed in order. */
	readonly chords: readonly KeyChord[];

	/** Creates a shortcut from `chords`. Throws a `TypeError` when `chords` is empty. */
	constructor(chords: readonly KeyChord[]) {
		if (chords.length === 0) throw new TypeError('A shortcut needs at least one chord');
		this.chords = Object.freeze([...chords]);
	}

	/**
	 * Creates a single-chord shortcut of `key` with the platform's primary modifier
	 * (Command on Apple systems, Control elsewhere), plus Shift and Alt when asked.
	 */
	static primary(key: string, options: { shift?: boolean; alt?: boolean } = {}): Shortcut {
		return new Shortcut([new KeyChord(key, { primary: true, ...options })]);
	}

	/**
	 * Parses a shortcut such as `Mod+K`, `Ctrl+Shift+P`, `Alt+Enter` or the sequence
	 * `G H`: chords are separated by spaces and keys within a chord by `+`.
	 *
	 * Modifier names: `Mod`/`Primary` (Command on Apple systems, Control elsewhere),
	 * `Ctrl`/`Control`, `Shift`, `Alt`/`Option`, `Meta`/`Cmd`/`Command`/`Super`. Keys:
	 * letters, digits, `F1`–`F12`, `Enter`, `Esc`, `Space`, `Tab`, `Backspace`, `Delete`,
	 * `Up`, `Down`, `Left`, `Right`, `Home`, `End`, `PageUp`, `PageDown` and the
	 * punctuation `,` `.` `/` `;` `-` `=` `[` `]`. Names are case insensitive.
	 *
	 * Throws a `SyntaxError` when a key or modifier name is unknown, including an empty
	 * `text`.
	 */
	static parse(text: string): Shortcut {
		const known = new Set([
			'mod',
			'primary',
			'ctrl',
			'control',
			'shift',
			'alt',
			'option',
			'meta',
			'cmd',
			'command',
			'super'
		]);
		const chords = text
			.trim()
			.split(/\s+/)
			.map((chord) => {
				const parts = chord.split('+');
				const keyName = parts.pop() ?? '';
				const names = new Set(parts.map((part) => part.toLowerCase()));
				const key = Shortcut.#keyNamed(keyName);
				if (key === null) throw new SyntaxError(`Unknown key "${keyName}" in "${text}"`);
				for (const name of names) {
					if (!known.has(name))
						throw new SyntaxError(`Unknown modifier "${name}" in "${text}"`);
				}
				return new KeyChord(key, {
					primary: names.has('mod') || names.has('primary'),
					control: names.has('ctrl') || names.has('control'),
					shift: names.has('shift'),
					alt: names.has('alt') || names.has('option'),
					meta: ['meta', 'cmd', 'command', 'super'].some((name) => names.has(name))
				});
			});
		return new Shortcut(chords);
	}

	/** Returns the key named `name` in the `parse` syntax, or `null` when the name is unknown. */
	static #keyNamed(name: string): string | null {
		const lower = name.toLowerCase();
		if (/^[a-z0-9]$/.test(lower)) return lower;
		const fn = /^f([0-9]{1,2})$/.exec(lower);
		if (fn?.[1]) {
			const n = Number(fn[1]);
			if (n >= 1 && n <= 12) return `F${n}`;
		}
		return namedKeys[lower] ?? null;
	}

	/**
	 * Whether this shortcut has as many chords as `other` and each one, resolved for `os`,
	 * matches the chord of `other` at the same position.
	 */
	matches(other: Shortcut, os: OperatingSystem): boolean {
		return this.chords.length === other.chords.length && this.startsWith(other, os);
	}

	/** Whether this shortcut begins with every chord of `prefix`, resolved for `os`. */
	startsWith(prefix: Shortcut, os: OperatingSystem): boolean {
		if (prefix.chords.length > this.chords.length) return false;
		return prefix.chords.every((chord, i) => (this.chords[i] as KeyChord).matches(chord, os));
	}

	/** Whether this shortcut has the same chords as `other`, without resolving `primary`. */
	equals(other: Shortcut): boolean {
		return (
			other.chords.length === this.chords.length &&
			other.chords.every((chord, i) => chord.equals(this.chords[i] as KeyChord))
		);
	}

	/** Returns the shortcut as text on `os`, such as `Ctrl+K` or `G H`. */
	label(os: OperatingSystem): string {
		return this.chords.map((chord) => chord.label(os)).join(' ');
	}

	/** Returns the shortcut as Linux text. */
	toString(): string {
		return this.label('linux');
	}
}
