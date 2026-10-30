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

import { flavors, type CatppuccinFlavor } from '@catppuccin/palette';
import {
	colorThemeFromRoles,
	lerpColor,
	type ColorRoles,
	type ColorTheme,
	type SyntaxPaletteInput
} from '@oito2/ui/theme';
import {
	draculaPalettes,
	everforestPalettes,
	nordPalette as nord,
	rosePinePalettes,
	type DraculaPalette,
	type EverforestPalette,
	type RosePinePalette
} from './palettes.js';

/** The named presets, each with its display name and brightness. */
export const themePresets = {
	everforestLight: { label: 'Everforest Light', isDark: false },
	everforestDark: { label: 'Everforest Dark', isDark: true },
	rosePine: { label: 'Rosé Pine', isDark: true },
	rosePineMoon: { label: 'Rosé Pine Moon', isDark: true },
	rosePineDawn: { label: 'Rosé Pine Dawn', isDark: false },
	nordDark: { label: 'Nord Dark', isDark: true },
	nordLight: { label: 'Nord Light', isDark: false },
	dracula: { label: 'Dracula', isDark: true },
	alucard: { label: 'Alucard', isDark: false },
	catppuccinLatte: { label: 'Catppuccin Latte', isDark: false },
	catppuccinFrappe: { label: 'Catppuccin Frappé', isDark: true },
	catppuccinMacchiato: { label: 'Catppuccin Macchiato', isDark: true },
	catppuccinMocha: { label: 'Catppuccin Mocha', isDark: true }
} as const satisfies Record<string, { label: string; isDark: boolean }>;

/** The name of a preset, such as `catppuccinMocha`. */
export type ThemePreset = keyof typeof themePresets;

/** The preset names, in display order. */
export const themePresetNames = Object.keys(themePresets) as ThemePreset[];

/** Everforest: every role is official. */
function everforest(p: EverforestPalette, isDark: boolean): ColorRoles {
	return {
		brightness: isDark ? 'dark' : 'light',
		background: p.bgDim,
		card: p.bg0,
		foreground: p.fg,
		primary: p.green,
		secondary: p.bg1,
		mutedForeground: p.grey1,
		destructive: p.red,
		border: isDark ? p.bg2 : p.bg3,
		success: p.green,
		warning: p.yellow,
		info: p.blue,
		syntax: {
			foreground: p.fg,
			comment: p.grey1,
			keyword: p.red,
			string: p.aqua,
			number: p.purple,
			function: p.green,
			type: p.yellow,
			tag: p.orange,
			attribute: p.blue,
			constant: p.purple,
			invalid: p.red
		}
	};
}

/** Rosé Pine: every role is official; `overlay` serves as both secondary surface and border. */
function rosePine(p: RosePinePalette, isDark: boolean): ColorRoles {
	return {
		brightness: isDark ? 'dark' : 'light',
		background: p.base,
		card: p.surface,
		foreground: p.text,
		primary: p.pine,
		secondary: p.overlay,
		mutedForeground: p.muted,
		destructive: p.love,
		border: p.overlay,
		success: p.foam,
		warning: p.gold,
		info: p.iris,
		syntax: {
			foreground: p.text,
			comment: p.muted,
			keyword: p.pine,
			string: p.gold,
			number: p.gold,
			function: p.rose,
			type: p.foam,
			tag: p.foam,
			attribute: p.iris,
			constant: p.gold,
			invalid: p.love
		}
	};
}

/** Nord, dark: every role is official. */
function nordDark(): ColorRoles {
	return {
		brightness: 'dark',
		background: nord.nord0,
		card: nord.nord1,
		foreground: nord.nord4,
		primary: nord.nord8,
		secondary: nord.nord2,
		mutedForeground: nord.nord3,
		destructive: nord.nord11,
		border: nord.nord3,
		success: nord.nord14,
		warning: nord.nord13,
		info: nord.nord9,
		syntax: {
			foreground: nord.nord4,
			comment: nord.nord3,
			keyword: nord.nord9,
			string: nord.nord14,
			number: nord.nord15,
			function: nord.nord8,
			type: nord.nord7,
			tag: nord.nord9,
			attribute: nord.nord7,
			constant: nord.nord12,
			invalid: nord.nord11
		}
	};
}

/**
 * Nord, light: an unofficial derivation that swaps Polar Night and Snow Storm and uses
 * `nord10` as primary for contrast on a light background.
 */
function nordLight(): ColorRoles {
	return {
		brightness: 'light',
		background: nord.nord6,
		card: nord.nord5,
		foreground: nord.nord0,
		primary: nord.nord10,
		secondary: nord.nord4,
		mutedForeground: nord.nord3,
		destructive: nord.nord11,
		border: nord.nord4,
		success: nord.nord14,
		warning: nord.nord12,
		info: nord.nord10,
		syntax: {
			foreground: nord.nord0,
			comment: nord.nord3,
			keyword: nord.nord10,
			string: nord.nord14,
			number: nord.nord15,
			function: nord.nord8,
			type: nord.nord7,
			tag: nord.nord10,
			attribute: nord.nord7,
			constant: nord.nord12,
			invalid: nord.nord11
		}
	};
}

/** The syntax colors shared by Dracula and Alucard. */
function draculaSyntax(p: DraculaPalette): SyntaxPaletteInput {
	return {
		foreground: p.foreground,
		comment: p.comment,
		keyword: p.pink,
		string: p.yellow,
		number: p.purple,
		function: p.green,
		type: p.cyan,
		tag: p.pink,
		attribute: p.green,
		constant: p.purple,
		invalid: p.red
	};
}

/**
 * Dracula: background, current line (card) and the accents are official. Dracula has no
 * third surface layer, so the secondary surface is derived 12% from the current line
 * toward the foreground, and the border 15%.
 */
function dracula(): ColorRoles {
	const p = draculaPalettes.dracula;
	return {
		brightness: 'dark',
		background: p.background,
		card: p.currentLine,
		foreground: p.foreground,
		primary: p.purple,
		secondary: lerpColor(p.currentLine, p.foreground, 0.12),
		mutedForeground: p.comment,
		destructive: p.red,
		border: lerpColor(p.currentLine, p.foreground, 0.15),
		success: p.green,
		warning: p.yellow,
		info: p.cyan,
		syntax: draculaSyntax(p)
	};
}

/**
 * Alucard: background and the accents are official. Alucard has no second surface layer,
 * so the card is the background itself, the secondary surface is derived 6% from the
 * background toward the foreground, and the border 15%.
 */
function alucard(): ColorRoles {
	const p = draculaPalettes.alucard;
	return {
		brightness: 'light',
		background: p.background,
		card: p.background,
		foreground: p.foreground,
		primary: p.purple,
		secondary: lerpColor(p.background, p.foreground, 0.06),
		mutedForeground: p.comment,
		destructive: p.red,
		border: lerpColor(p.background, p.foreground, 0.15),
		success: p.green,
		warning: p.orange,
		info: p.cyan,
		syntax: draculaSyntax(p)
	};
}

/** Catppuccin: every role is official, read from @catppuccin/palette. */
function catppuccin(flavor: CatppuccinFlavor): ColorRoles {
	const c = Object.fromEntries(
		Object.entries(flavor.colors).map(([name, color]) => [name, color.hex])
	) as Record<keyof CatppuccinFlavor['colors'], string>;
	return {
		brightness: flavor.dark ? 'dark' : 'light',
		background: c.mantle,
		card: c.base,
		foreground: c.text,
		primary: c.mauve,
		secondary: c.surface0,
		mutedForeground: c.overlay0,
		destructive: c.red,
		border: c.surface1,
		success: c.green,
		warning: c.yellow,
		info: c.blue,
		syntax: {
			foreground: c.text,
			comment: c.overlay2,
			keyword: c.mauve,
			string: c.green,
			number: c.peach,
			function: c.blue,
			type: c.yellow,
			tag: c.blue,
			attribute: c.yellow,
			constant: c.peach,
			invalid: c.red
		}
	};
}

/** Returns the role colors of `preset`, mapped from its theme family's palette. */
export function presetRoles(preset: ThemePreset): ColorRoles {
	switch (preset) {
		case 'everforestLight':
			return everforest(everforestPalettes.light, false);
		case 'everforestDark':
			return everforest(everforestPalettes.dark, true);
		case 'rosePine':
			return rosePine(rosePinePalettes.main, true);
		case 'rosePineMoon':
			return rosePine(rosePinePalettes.moon, true);
		case 'rosePineDawn':
			return rosePine(rosePinePalettes.dawn, false);
		case 'nordDark':
			return nordDark();
		case 'nordLight':
			return nordLight();
		case 'dracula':
			return dracula();
		case 'alucard':
			return alucard();
		case 'catppuccinLatte':
			return catppuccin(flavors.latte);
		case 'catppuccinFrappe':
			return catppuccin(flavors.frappe);
		case 'catppuccinMacchiato':
			return catppuccin(flavors.macchiato);
		case 'catppuccinMocha':
			return catppuccin(flavors.mocha);
	}
}

/** Returns the complete color theme of `preset`, raised to WCAG AAA with `highContrast`. */
export function presetColorTheme(
	preset: ThemePreset,
	options: { highContrast?: boolean } = {}
): ColorTheme {
	return colorThemeFromRoles(presetRoles(preset), options);
}

/**
 * Returns a theme source for `ThemeProvider`'s `light` or `dark` prop that builds
 * `preset` with the contrast the provider resolves.
 */
export function presetTheme(
	preset: ThemePreset
): (options: { highContrast: boolean }) => ColorTheme {
	return (options) => presetColorTheme(preset, options);
}
