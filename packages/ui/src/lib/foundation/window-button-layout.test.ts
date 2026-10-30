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

import { describe, expect, it } from 'vitest';
import parity from '../../fixtures/parity/foundation.json';
import type { DesktopEnvironment } from './desktop-environment.js';
import { Platform, type OperatingSystem } from './platform.js';
import {
	WindowButtonLayout,
	resolveWindowControlStyle,
	type WindowControlStyle
} from './window-button-layout.js';

const plain = (layout: WindowButtonLayout) => ({
	leading: [...layout.leading],
	trailing: [...layout.trailing]
});

describe('WindowButtonLayout matches oito2_ui', () => {
	const cases = parity.windowButtonLayouts;

	it('parses the GNOME format', () => {
		for (const { value, leading, trailing } of cases.gnome) {
			expect(plain(WindowButtonLayout.parseGnome(value)), value).toEqual({
				leading,
				trailing
			});
		}
	});

	it('parses the KDE format', () => {
		for (const { buttonsOnLeft, buttonsOnRight, leading, trailing } of cases.kde) {
			expect(plain(WindowButtonLayout.parseKde({ buttonsOnLeft, buttonsOnRight }))).toEqual({
				leading,
				trailing
			});
		}
	});

	it('parses the Xfwm format', () => {
		for (const { value, leading, trailing } of cases.xfwm) {
			expect(plain(WindowButtonLayout.parseXfwm(value)), value).toEqual({
				leading,
				trailing
			});
		}
	});

	it('has the same defaults', () => {
		for (const [style, expected] of Object.entries(cases.defaultFor)) {
			expect(
				plain(WindowButtonLayout.defaultFor(style as WindowControlStyle)),
				style
			).toEqual(expected);
		}
	});

	it('resolves the same control styles', () => {
		for (const { os, isWeb, desktopEnvironment, result } of cases.resolve) {
			const platform = new Platform({ os: os as OperatingSystem, isWeb });
			expect(
				resolveWindowControlStyle(platform, {
					desktopEnvironment: desktopEnvironment as DesktopEnvironment | null
				}),
				`${os} web=${isWeb} ${desktopEnvironment}`
			).toBe(result);
		}
	});
});

describe('WindowButtonLayout', () => {
	it('compares by buttons and order', () => {
		const a = new WindowButtonLayout({ trailing: ['minimize', 'close'] });
		expect(a.equals(new WindowButtonLayout({ trailing: ['minimize', 'close'] }))).toBe(true);
		expect(a.equals(new WindowButtonLayout({ leading: ['minimize', 'close'] }))).toBe(false);
		expect(new WindowButtonLayout().isEmpty).toBe(true);
	});
});
