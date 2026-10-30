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

// Color schemes of @oito2/ui, without Svelte: importable from @oito2/ui/theme by theme
// packages, build scripts and apps that don't render Svelte components.

export {
	colorToHex,
	lerpColor,
	toColorValue,
	type ColorInput,
	type ColorValue
} from '../foundation/color.js';
export {
	Contrast,
	contrastRatio,
	ensureContrastColor,
	foregroundColorFor,
	luminanceOf,
	minContrastRatio
} from '../foundation/contrast.js';
export type { Brightness, ColorRoles } from './color-roles.js';
export {
	chromeMinimumStep,
	colorSchemeRoles,
	colorThemeFromRoles,
	createColorTheme,
	surfacesOfTheme,
	type BaseColorThemeOptions,
	type ChromeColors,
	type ColorScheme,
	type ColorSchemeRole,
	type ColorTheme,
	type SemanticColors
} from './color-theme.js';
export {
	colorThemeRule,
	colorThemeStyle,
	colorThemeVariables,
	componentColors,
	type ComponentColors
} from './css.js';
export {
	ensureSyntaxContrast,
	syntaxRoles,
	type SyntaxPalette,
	type SyntaxPaletteInput,
	type SyntaxRole
} from './syntax-palette.js';
export { accentColors, defaultAccent, type AccentColor } from '../tokens/values.js';
