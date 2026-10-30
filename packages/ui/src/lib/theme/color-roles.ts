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

import type { ColorInput } from '../foundation/color.js';
import type { SyntaxPaletteInput } from './syntax-palette.js';

/** Whether a scheme is light or dark. */
export type Brightness = 'light' | 'dark';

/**
 * The handful of role colors a color theme family defines, from which
 * `colorThemeFromRoles` derives a complete oito2 scheme. The roles follow the vocabulary
 * most theme families publish; values are taken as given, and contrast adjustments
 * happen in `colorThemeFromRoles`.
 */
export interface ColorRoles {
	/** Whether the scheme is light or dark. */
	readonly brightness: Brightness;
	/** The page background. */
	readonly background: ColorInput;
	/** The main surface of cards, panes and fields. */
	readonly card: ColorInput;
	/** The body text color. */
	readonly foreground: ColorInput;
	/** The signature accent, used as the primary fill. */
	readonly primary: ColorInput;
	/** A surface one step above `card`, such as a selected row. */
	readonly secondary: ColorInput;
	/** Secondary text, such as captions and placeholders. */
	readonly mutedForeground: ColorInput;
	/** The color of errors and destructive actions. */
	readonly destructive: ColorInput;
	/** Borders and dividers. */
	readonly border: ColorInput;
	/** The color of success states. */
	readonly success: ColorInput;
	/** The color of warning states. */
	readonly warning: ColorInput;
	/** The color of informational states. */
	readonly info: ColorInput;
	/** The syntax highlighting colors. */
	readonly syntax: SyntaxPaletteInput;
}
