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

import { Hct, MaterialDynamicColors, SchemeTonalSpot } from '@material/material-color-utilities';
import {
	colorToHex,
	lerpColor,
	toColorValue,
	toRgba,
	type ColorValue
} from '../foundation/color.js';
import {
	Contrast,
	ensureContrastColor,
	foregroundColorFor,
	luminanceOf
} from '../foundation/contrast.js';
import {
	accentColors,
	defaultAccent,
	neutralPalettes,
	statusPalettes,
	type AccentColor
} from '../tokens/values.js';
import type { Brightness, ColorRoles } from './color-roles.js';
import {
	ensureSyntaxContrast,
	type SyntaxPalette,
	type SyntaxPaletteInput
} from './syntax-palette.js';

/** The Material 3 color roles, in the order of Material's `ColorScheme`. */
export const colorSchemeRoles = [
	'primary',
	'onPrimary',
	'primaryContainer',
	'onPrimaryContainer',
	'primaryFixed',
	'primaryFixedDim',
	'onPrimaryFixed',
	'onPrimaryFixedVariant',
	'secondary',
	'onSecondary',
	'secondaryContainer',
	'onSecondaryContainer',
	'secondaryFixed',
	'secondaryFixedDim',
	'onSecondaryFixed',
	'onSecondaryFixedVariant',
	'tertiary',
	'onTertiary',
	'tertiaryContainer',
	'onTertiaryContainer',
	'tertiaryFixed',
	'tertiaryFixedDim',
	'onTertiaryFixed',
	'onTertiaryFixedVariant',
	'error',
	'onError',
	'errorContainer',
	'onErrorContainer',
	'surface',
	'onSurface',
	'surfaceDim',
	'surfaceBright',
	'surfaceContainerLowest',
	'surfaceContainerLow',
	'surfaceContainer',
	'surfaceContainerHigh',
	'surfaceContainerHighest',
	'onSurfaceVariant',
	'outline',
	'outlineVariant',
	'shadow',
	'scrim',
	'inverseSurface',
	'onInverseSurface',
	'inversePrimary',
	'surfaceTint'
] as const;

/** A Material 3 color role. */
export type ColorSchemeRole = (typeof colorSchemeRoles)[number];

/** The Material 3 colors of a scheme, as hex strings. */
export type ColorScheme = { readonly [role in ColorSchemeRole]: string };

/**
 * Text-safe accent and status colors. Each reaches 4.5:1 (7:1 with high contrast) against
 * every surface of its scheme, so it can color text, links, icons and focus indicators;
 * the `primary` and `error` fills of the color scheme keep the scheme's own colors.
 */
export interface SemanticColors {
	/** The primary accent hue, adjusted for text on surfaces. */
	readonly primaryText: string;
	/** The error hue, adjusted for text on surfaces, such as validation messages. */
	readonly errorText: string;
	/** Successful or positive outcomes. */
	readonly success: string;
	/** Warnings that need attention. */
	readonly warning: string;
	/** Neutral information. */
	readonly info: string;
	/** Hyperlinks. */
	readonly link: string;
}

/** Colors of the structural window chrome. */
export interface ChromeColors {
	/** The page background. */
	readonly background: string;
	/** A narrow sidebar column, such as an icon rail. */
	readonly sidebar: string;
	/** A wider mainbar panel, such as a file list or a master list. */
	readonly mainbar: string;
	/** The window title bar. */
	readonly titleBar: string;
	/** Dialogs, sheets and drawers. */
	readonly dialog: string;
}

/**
 * The complete, resolved colors of one oito2 scheme: the Material `colorScheme` plus the
 * oito2 `semantic`, `chrome` and `syntax` colors, as hex strings.
 *
 * `onSurface`, `onSurfaceVariant` and every semantic and syntax color reach 4.5:1 against
 * every surface of the scheme and against `background`, and `outline` reaches 3:1. With
 * high contrast the targets rise to 7:1 and 4.5:1.
 */
export interface ColorTheme {
	/** Whether the scheme is light or dark. */
	readonly brightness: Brightness;
	/** Whether the scheme uses the high-contrast targets. */
	readonly highContrast: boolean;
	/** The page background. */
	readonly background: string;
	/** The Material 3 colors. */
	readonly colorScheme: ColorScheme;
	/** Text-safe accent and status colors. */
	readonly semantic: SemanticColors;
	/** Structural chrome colors. */
	readonly chrome: ChromeColors;
	/** Syntax highlighting colors. */
	readonly syntax: SyntaxPalette;
}

/** The minimum contrast ratio between adjacent chrome surfaces: page, sidebar and mainbar. */
export const chromeMinimumStep = 1.04;

const white: ColorValue = { r: 1, g: 1, b: 1, a: 1 };
const black: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
const transparent: ColorValue = { r: 0, g: 0, b: 0, a: 0 };

/** Syntax colors of the light base scheme, from the GNOME color palette. */
const baseLightSyntax: SyntaxPalette = {
	foreground: '#202020',
	comment: '#77767B',
	keyword: '#9141AC',
	string: '#26A269',
	number: '#C64600',
	function: '#1C71D8',
	type: '#2190A4',
	tag: '#C01C28',
	attribute: '#986A44',
	constant: '#D56199',
	invalid: '#E01B24'
};

/** Syntax colors of the dark base scheme, from the GNOME color palette. */
const baseDarkSyntax: SyntaxPalette = {
	foreground: '#F7F7F7',
	comment: '#9A9996',
	keyword: '#DC8ADD',
	string: '#8FF0A4',
	number: '#FFA348',
	function: '#99C1F1',
	type: '#93DDC2',
	tag: '#F66151',
	attribute: '#F9F06B',
	constant: '#F49AC1',
	invalid: '#FF7B63'
};

// The 32 most recently used themes by their inputs, oldest first.
const cache = new Map<string, ColorTheme>();

function cached(key: string, build: () => ColorTheme): ColorTheme {
	const hit = cache.get(key);
	if (hit) {
		cache.delete(key);
		cache.set(key, hit);
		return hit;
	}
	if (cache.size >= 32) {
		const oldest = cache.keys().next().value;
		if (oldest !== undefined) cache.delete(oldest);
	}
	const theme = build();
	cache.set(key, theme);
	return theme;
}

// Builds a cache key that keeps the full precision of ColorValue inputs.
function keyOf(value: unknown): string {
	return JSON.stringify(value);
}

/** The colors that `assemble` receives before contrast adjustments. */
interface RawColors {
	brightness: Brightness;
	highContrast: boolean;
	primary: ColorValue;
	onPrimary: ColorValue;
	error: ColorValue;
	background: ColorValue;
	surface: ColorValue;
	surfaceContainerLowest: ColorValue;
	surfaceContainerLow: ColorValue;
	surfaceContainer: ColorValue;
	surfaceContainerHigh: ColorValue;
	surfaceContainerHighest: ColorValue;
	titleBar: ColorValue;
	onSurface: ColorValue;
	onSurfaceVariant: ColorValue;
	outline: ColorValue;
	outlineVariant: ColorValue;
	success: ColorValue;
	warning: ColorValue;
	info: ColorValue;
	syntax: SyntaxPaletteInput;
}

// Returns the Material tonal-spot scheme seeded with `seed`, rounded to 8 bits like Flutter.
function seedScheme(seed: ColorValue, brightness: Brightness): Record<ColorSchemeRole, ColorValue> {
	const { r, g, b } = toRgba(seed);
	const argb = (0xff << 24) | (r << 16) | (g << 8) | b;
	const scheme = new SchemeTonalSpot(Hct.fromInt(argb >>> 0), brightness === 'dark', 0);
	const roles = {} as Record<ColorSchemeRole, ColorValue>;
	for (const role of colorSchemeRoles) {
		const dynamic = (
			MaterialDynamicColors as unknown as Record<string, { getArgb?: (s: unknown) => number }>
		)[role];
		const value = dynamic?.getArgb?.(scheme);
		roles[role] =
			value === undefined
				? transparent
				: {
						r: ((value >> 16) & 0xff) / 255,
						g: ((value >> 8) & 0xff) / 255,
						b: (value & 0xff) / 255,
						a: ((value >>> 24) & 0xff) / 255
					};
	}
	return roles;
}

// Derives the chrome colors, raises text, outline, semantic and syntax colors to the
// contrast targets against every surface, and fills the rest from a seed of the primary.
function assemble(raw: RawColors): ColorTheme {
	const isDark = raw.brightness === 'dark';
	const textTarget = raw.highContrast ? Contrast.textAAA : Contrast.textAA;
	const nonTextTarget = raw.highContrast ? Contrast.textAA : Contrast.nonTextAA;
	const seed = seedScheme(raw.primary, raw.brightness);

	const mainbar = ensureContrastColor(
		raw.surfaceContainerHighest,
		[raw.background],
		chromeMinimumStep
	);
	const sidebar = ensureContrastColor(
		raw.surfaceContainer,
		[raw.background, mainbar],
		chromeMinimumStep
	);
	const dialog = isDark ? raw.surfaceContainerHigh : raw.surface;
	const surfaces = [
		raw.background,
		raw.surface,
		raw.surfaceContainerLowest,
		raw.surfaceContainerLow,
		raw.surfaceContainer,
		raw.surfaceContainerHigh,
		raw.surfaceContainerHighest,
		raw.titleBar,
		sidebar,
		mainbar,
		dialog
	];
	const text = (color: ColorValue) => ensureContrastColor(color, surfaces, textTarget);

	const onSurface = text(raw.onSurface);
	const outline = ensureContrastColor(raw.outline, surfaces, nonTextTarget);
	const scheme: Record<ColorSchemeRole, ColorValue> = {
		...seed,
		primary: raw.primary,
		onPrimary: raw.onPrimary,
		error: raw.error,
		onError: foregroundColorFor(raw.error),
		surface: raw.surface,
		onSurface,
		surfaceDim: isDark ? raw.surfaceContainerLowest : raw.surfaceContainerHighest,
		surfaceBright: isDark ? raw.surfaceContainerHighest : raw.surfaceContainerLowest,
		surfaceContainerLowest: raw.surfaceContainerLowest,
		surfaceContainerLow: raw.surfaceContainerLow,
		surfaceContainer: raw.surfaceContainer,
		surfaceContainerHigh: raw.surfaceContainerHigh,
		surfaceContainerHighest: raw.surfaceContainerHighest,
		onSurfaceVariant: text(raw.onSurfaceVariant),
		outline,
		outlineVariant: raw.highContrast ? outline : raw.outlineVariant,
		inverseSurface: onSurface,
		onInverseSurface: raw.surface,
		inversePrimary: ensureContrastColor(raw.primary, [onSurface], Contrast.textAA),
		surfaceTint: transparent,
		shadow: black,
		scrim: black
	};
	const primaryText = colorToHex(text(raw.primary));
	return {
		brightness: raw.brightness,
		highContrast: raw.highContrast,
		background: colorToHex(raw.background),
		colorScheme: Object.fromEntries(
			colorSchemeRoles.map((role) => [role, colorToHex(scheme[role])])
		) as ColorScheme,
		semantic: {
			primaryText,
			errorText: colorToHex(text(raw.error)),
			success: colorToHex(text(raw.success)),
			warning: colorToHex(text(raw.warning)),
			info: colorToHex(text(raw.info)),
			link: primaryText
		},
		chrome: {
			background: colorToHex(raw.background),
			sidebar: colorToHex(sidebar),
			mainbar: colorToHex(mainbar),
			titleBar: colorToHex(raw.titleBar),
			dialog: colorToHex(dialog)
		},
		syntax: ensureSyntaxContrast(raw.syntax, surfaces, textTarget)
	};
}

/** Options of the oito2 base scheme. */
export interface BaseColorThemeOptions {
	/** Light or dark. */
	brightness: Brightness;
	/** The accent: a named accent or any hex color. Defaults to blue. */
	accent?: AccentColor | string;
	/** Whether to raise text to 7:1 and outlines to 4.5:1. Defaults to false. */
	highContrast?: boolean;
}

// Resolves a named accent or a hex string to a color value.
function accentValue(accent: AccentColor | string | undefined): ColorValue {
	const name = accent ?? defaultAccent;
	return toColorValue(
		Object.hasOwn(accentColors, name) ? accentColors[name as AccentColor] : name
	);
}

/**
 * The oito2 base scheme: GTK-style neutrals with `accent` as the primary hue. The primary
 * fill keeps white text: its lightness is lowered only as far as needed for white to reach
 * 4.5:1 (7:1 with high contrast). Results are cached by their inputs.
 */
export function createColorTheme(options: BaseColorThemeOptions): ColorTheme {
	const highContrast = options.highContrast ?? false;
	const accent = accentValue(options.accent);
	return cached(keyOf(['base', options.brightness, accent, highContrast]), () => {
		const isDark = options.brightness === 'dark';
		const neutrals = neutralPalettes[options.brightness];
		const status = statusPalettes[options.brightness];
		const value = toColorValue;
		const textTarget = highContrast ? Contrast.textAAA : Contrast.textAA;
		return assemble({
			brightness: options.brightness,
			highContrast,
			primary: ensureContrastColor(accent, [white], textTarget),
			onPrimary: white,
			error: value(status.error),
			background: value(neutrals.surfaceContainerLow),
			surface: value(neutrals.surface),
			surfaceContainerLowest: value(neutrals.surfaceContainerLowest),
			surfaceContainerLow: value(neutrals.surfaceContainerLow),
			surfaceContainer: value(neutrals.surfaceContainer),
			surfaceContainerHigh: value(neutrals.surfaceContainerHigh),
			surfaceContainerHighest: value(neutrals.surfaceContainerHighest),
			titleBar: value(neutrals.titleBar),
			onSurface: highContrast ? (isDark ? white : black) : value(neutrals.onSurface),
			onSurfaceVariant: value(neutrals.onSurfaceVariant),
			outline: value(neutrals.outline),
			outlineVariant: value(neutrals.outlineVariant),
			success: value(status.success),
			warning: value(status.warning),
			info: value(status.info),
			syntax: isDark ? baseDarkSyntax : baseLightSyntax
		});
	});
}

// Whether `layer` sits below `card`: darker in a dark scheme, lighter in a light one.
function isLowerLayer(layer: ColorValue, card: ColorValue, isDark: boolean): boolean {
	const layerLuminance = luminanceOf(layer);
	const cardLuminance = luminanceOf(card);
	return isDark ? layerLuminance < cardLuminance : layerLuminance > cardLuminance;
}

/**
 * A scheme derived from the role colors of a theme family. The primary fill keeps
 * `roles.primary` with black or white text, whichever contrasts more. The surfaces run
 * from the lower of background and card up to the secondary surface:
 *
 * - `surfaceContainerLowest` is whichever of background and card sits lower;
 * - `surfaceContainerLow` is halfway from it to the card;
 * - `surfaceContainer` and `surfaceContainerHigh` are one and two thirds of the way from
 *   the card to the secondary surface, and `surfaceContainerHighest` is the secondary;
 * - the title bar is `surfaceContainer`;
 * - `outline` is the border mixed 35% toward the foreground, `outlineVariant` the border.
 *
 * Text, outline, semantic and syntax colors are then raised to WCAG AA (AAA with
 * `highContrast`) against every surface. Results are cached by their inputs.
 */
export function colorThemeFromRoles(
	roles: ColorRoles,
	options: { highContrast?: boolean } = {}
): ColorTheme {
	const highContrast = options.highContrast ?? false;
	return cached(keyOf(['roles', roles, highContrast]), () => {
		const value = toColorValue;
		const background = value(roles.background);
		const card = value(roles.card);
		const secondary = value(roles.secondary);
		const primary = value(roles.primary);
		const lowest = isLowerLayer(background, card, roles.brightness === 'dark')
			? background
			: card;
		const container = lerpColor(card, secondary, 1 / 3);
		return assemble({
			brightness: roles.brightness,
			highContrast,
			primary,
			onPrimary: foregroundColorFor(primary),
			error: value(roles.destructive),
			background,
			surface: card,
			surfaceContainerLowest: lowest,
			surfaceContainerLow: lerpColor(lowest, card, 0.5),
			surfaceContainer: container,
			surfaceContainerHigh: lerpColor(card, secondary, 2 / 3),
			surfaceContainerHighest: secondary,
			titleBar: container,
			onSurface: value(roles.foreground),
			onSurfaceVariant: value(roles.mutedForeground),
			outline: lerpColor(roles.border, roles.foreground, 0.35),
			outlineVariant: value(roles.border),
			success: value(roles.success),
			warning: value(roles.warning),
			info: value(roles.info),
			syntax: roles.syntax
		});
	});
}

/** Every surface of a theme: the background, the Material surface roles and the chrome. */
export function surfacesOfTheme(theme: ColorTheme): string[] {
	const s = theme.colorScheme;
	return [
		theme.background,
		s.surface,
		s.surfaceDim,
		s.surfaceBright,
		s.surfaceContainerLowest,
		s.surfaceContainerLow,
		s.surfaceContainer,
		s.surfaceContainerHigh,
		s.surfaceContainerHighest,
		theme.chrome.titleBar,
		theme.chrome.sidebar,
		theme.chrome.mainbar,
		theme.chrome.dialog
	];
}
