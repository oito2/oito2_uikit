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

// Design tokens of oito2: corner radii, spacing, sizes, colors and typography,
// in CSS pixels. This module has no imports, so the CSS generator can load it
// directly.

/** Corner radius tokens, in pixels. */
export const radius = {
	/** Check boxes and other very small controls: 4. */
	check: 4,
	/** Small surfaces such as chips, tooltips and menu items: 6. */
	small: 6,
	/** Buttons and input fields: 8. */
	medium: 8,
	/** Cards and containers: 12. */
	large: 12,
	/** Windows, dialogs and sheets: 14. */
	window: 14
} as const;

/** Spacing tokens on a 4-point scale, for padding, gaps and margins, in pixels. */
export const spacing = {
	/** Extra-extra-small spacing: 2. */
	xxs: 2,
	/** Extra-small spacing: 4. */
	xs: 4,
	/** Small spacing: 8. */
	sm: 8,
	/** Medium spacing: 12. */
	md: 12,
	/** Large spacing: 16. */
	lg: 16,
	/** The default padding around page content: 20. */
	page: 20,
	/** Extra-large spacing: 24. */
	xl: 24,
	/** Extra-extra-large spacing: 32. */
	xxl: 32,
	/** The largest spacing: 48. */
	xxxl: 48
} as const;

/** Size tokens for controls and chrome, in pixels. */
export const sizes = {
	/** Height of buttons and single-line input fields with pointer input: 34. */
	buttonHeight: 34,
	/** Height of buttons and single-line input fields with touch input, with the target padded to `minTouchTarget`: 40. */
	touchButtonHeight: 40,
	/** Height of the window title bar: 46. */
	titleBarHeight: 46,
	/** Height of the items placed inside the title bar: 34. */
	titleBarItemHeight: 34,
	/** Default icon size: 20. */
	iconSize: 20,
	/** Thickness of linear progress bars: 6. */
	progressHeight: 6,
	/** Width of the focus ring around a focused control: 2. */
	focusBorderWidth: 2,
	/** Size of a round window control button: 24. */
	windowControlSize: 24,
	/** Width of a Windows-style rectangular window control button: 46. */
	windowsWindowControlWidth: 46,
	/** Minimum target size for pointer input (WCAG 2.2, criterion 2.5.8): 24. */
	minPointerTarget: 24,
	/** Minimum target size for touch input: 48. */
	minTouchTarget: 48
} as const;

/** The named accent colors of the oito2 base scheme, from the GNOME accent palette. */
export const accentColors = {
	blue: '#3584E4',
	teal: '#2190A4',
	green: '#3A944A',
	yellow: '#C88800',
	orange: '#ED5B00',
	red: '#E62D42',
	pink: '#D56199',
	purple: '#9141AC',
	slate: '#6F8396'
} as const;

/** The name of an accent color. */
export type AccentColor = keyof typeof accentColors;

/** The default accent color. */
export const defaultAccent: AccentColor = 'blue';

/**
 * The neutral GTK-style surface, text and border colors of the oito2 base
 * scheme, for one brightness. Surfaces go from `surfaceContainerLowest` to
 * `surfaceContainerHighest`; `onSurface` and `onSurfaceVariant` reach a 4.5:1
 * contrast ratio on all of them, and `outline` reaches 3:1.
 */
export interface NeutralPalette {
	/** The default surface for content. */
	readonly surface: string;
	/** The lowest-emphasis container surface. */
	readonly surfaceContainerLowest: string;
	/** A low-emphasis container surface. */
	readonly surfaceContainerLow: string;
	/** The default container surface. */
	readonly surfaceContainer: string;
	/** A high-emphasis container surface. */
	readonly surfaceContainerHigh: string;
	/** The highest-emphasis container surface. */
	readonly surfaceContainerHighest: string;
	/** The window title bar background. */
	readonly titleBar: string;
	/** Primary text and icons on any surface. */
	readonly onSurface: string;
	/** Secondary text and icons on any surface. */
	readonly onSurfaceVariant: string;
	/** Borders of interactive components, such as input fields. */
	readonly outline: string;
	/** Decorative borders and dividers. */
	readonly outlineVariant: string;
}

/** The neutral palettes for light and dark surfaces. */
export const neutralPalettes: { readonly light: NeutralPalette; readonly dark: NeutralPalette } = {
	light: {
		surface: '#FFFFFF',
		surfaceContainerLowest: '#FFFFFF',
		surfaceContainerLow: '#FAFAFA',
		surfaceContainer: '#F5F5F5',
		surfaceContainerHigh: '#EFEFEF',
		surfaceContainerHighest: '#E8E8E8',
		titleBar: '#EBEBEB',
		onSurface: '#202020',
		onSurfaceVariant: '#5E5E5E',
		outline: '#7E7E7E',
		outlineVariant: '#D9D9D9'
	},
	dark: {
		surface: '#202020',
		surfaceContainerLowest: '#1A1A1A',
		surfaceContainerLow: '#242424',
		surfaceContainer: '#2A2A2A',
		surfaceContainerHigh: '#303030',
		surfaceContainerHighest: '#383838',
		titleBar: '#303030',
		onSurface: '#F7F7F7',
		onSurfaceVariant: '#BDBDBD',
		outline: '#8A8A8A',
		outlineVariant: '#3D3D3D'
	}
};

/** Every surface of a neutral palette: `surface`, the containers and `titleBar`. */
export function surfacesOf(palette: NeutralPalette): string[] {
	return [
		palette.surface,
		palette.surfaceContainerLowest,
		palette.surfaceContainerLow,
		palette.surfaceContainer,
		palette.surfaceContainerHigh,
		palette.surfaceContainerHighest,
		palette.titleBar
	];
}

/**
 * Status colors for messages, badges and links, for one brightness. Every
 * color reaches a 4.5:1 contrast ratio, readable as text, on all surfaces of
 * the neutral palette with the same brightness.
 */
export interface StatusPalette {
	/** Successful or positive outcomes. */
	readonly success: string;
	/** Warnings that need attention. */
	readonly warning: string;
	/** Errors and destructive actions. */
	readonly error: string;
	/** Neutral information. */
	readonly info: string;
	/** Hyperlinks. */
	readonly link: string;
}

/** The status palettes for light and dark surfaces. */
export const statusPalettes: { readonly light: StatusPalette; readonly dark: StatusPalette } = {
	light: {
		success: '#187549',
		warning: '#886003',
		error: '#C01C28',
		info: '#1966C2',
		link: '#1966C2'
	},
	dark: {
		success: '#8FF0A4',
		warning: '#F8E45C',
		error: '#FF7B63',
		info: '#78AEED',
		link: '#78AEED'
	}
};

/** One style of the type scale. */
export interface TextStyle {
	/** Font size, in pixels. */
	readonly fontSize: number;
	/** Line height as a multiple of the font size. */
	readonly lineHeight: number;
	/** Font weight, from 100 to 900. */
	readonly fontWeight: number;
	/** Letter spacing, in pixels. */
	readonly letterSpacing: number;
}

/** The names of the type scale styles, from the Material 2021 type scale. */
export type TextStyleName =
	| 'displayLarge'
	| 'displayMedium'
	| 'displaySmall'
	| 'headlineLarge'
	| 'headlineMedium'
	| 'headlineSmall'
	| 'titleLarge'
	| 'titleMedium'
	| 'titleSmall'
	| 'bodyLarge'
	| 'bodyMedium'
	| 'bodySmall'
	| 'labelLarge'
	| 'labelMedium'
	| 'labelSmall';

/** Typography tokens: the bundled Inter font and the oito2 type scale. */
export const typography = {
	/** The font family name of the bundled Inter. */
	fontFamily: 'Inter',
	/** System font families used for glyphs Inter lacks, in order. */
	fontFamilyFallback: ['Ubuntu', 'Cantarell', 'Roboto', 'Segoe UI', 'SF Pro Text', 'Noto Sans'],
	/** Weight of headlines, titles and `labelLarge`. */
	emphasisWeight: 600,
	/**
	 * The type scale: Material 2021 sizes, line heights and letter spacing, body
	 * sizes of 16, 14 and 12, and `emphasisWeight` on headlines, titles and
	 * `labelLarge`.
	 */
	scale: {
		displayLarge: { fontSize: 57, lineHeight: 1.12, fontWeight: 400, letterSpacing: -0.25 },
		displayMedium: { fontSize: 45, lineHeight: 1.16, fontWeight: 400, letterSpacing: 0 },
		displaySmall: { fontSize: 36, lineHeight: 1.22, fontWeight: 400, letterSpacing: 0 },
		headlineLarge: { fontSize: 32, lineHeight: 1.25, fontWeight: 600, letterSpacing: 0 },
		headlineMedium: { fontSize: 28, lineHeight: 1.29, fontWeight: 600, letterSpacing: 0 },
		headlineSmall: { fontSize: 24, lineHeight: 1.33, fontWeight: 600, letterSpacing: 0 },
		titleLarge: { fontSize: 22, lineHeight: 1.27, fontWeight: 600, letterSpacing: 0 },
		titleMedium: { fontSize: 16, lineHeight: 1.5, fontWeight: 600, letterSpacing: 0.15 },
		titleSmall: { fontSize: 14, lineHeight: 1.43, fontWeight: 600, letterSpacing: 0.1 },
		bodyLarge: { fontSize: 16, lineHeight: 1.5, fontWeight: 400, letterSpacing: 0.5 },
		bodyMedium: { fontSize: 14, lineHeight: 1.43, fontWeight: 400, letterSpacing: 0.25 },
		bodySmall: { fontSize: 12, lineHeight: 1.33, fontWeight: 400, letterSpacing: 0.4 },
		labelLarge: { fontSize: 14, lineHeight: 1.43, fontWeight: 600, letterSpacing: 0.1 },
		labelMedium: { fontSize: 12, lineHeight: 1.33, fontWeight: 500, letterSpacing: 0.5 },
		labelSmall: { fontSize: 11, lineHeight: 1.45, fontWeight: 500, letterSpacing: 0.5 }
	} satisfies Record<TextStyleName, TextStyle>
} as const;
