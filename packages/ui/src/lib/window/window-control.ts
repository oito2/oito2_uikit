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

import type { WindowControlStyle } from '../foundation/window-button-layout.js';
import type { Localizations } from '../l10n/localizations.js';

/** The action and glyph of a window control button. */
export type WindowControlType = 'minimize' | 'maximize' | 'restore' | 'close';

/** Overrides for the accessible labels of the window control buttons. */
export interface WindowControlLabels {
	readonly minimize?: string;
	readonly maximize?: string;
	readonly restore?: string;
	readonly close?: string;
}

/** The title bar height in pixels: 46. */
export const titleBarHeight = 46;

/** The width of a window control button of `style`: 46 for Windows, 0 for `none`, 24 otherwise. */
export function windowControlWidth(style: WindowControlStyle): number {
	if (style === 'windows') return 46;
	if (style === 'none') return 0;
	return 24;
}

/**
 * Returns the label of a window control: the override from `labels` when there is one,
 * otherwise the localized string.
 */
export function windowControlLabel(
	type: WindowControlType,
	strings: Localizations,
	labels?: WindowControlLabels
): string {
	const override = labels?.[type];
	if (override) return override;
	switch (type) {
		case 'minimize':
			return strings.minimizeWindow;
		case 'maximize':
			return strings.maximizeWindow;
		case 'restore':
			return strings.restoreWindow;
		case 'close':
			return strings.closeWindow;
	}
}
