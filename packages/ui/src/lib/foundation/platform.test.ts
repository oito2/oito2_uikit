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

import { afterEach, describe, expect, it } from 'vitest';
import parity from '../../fixtures/parity/foundation.json';
import {
	Platform,
	detectOperatingSystem,
	isTauriWebview,
	type OperatingSystem
} from './platform.js';

describe('Platform matches oito2_ui', () => {
	it('derives the same flags', () => {
		for (const { os, isWeb, ...flags } of parity.platforms) {
			const platform = new Platform({ os: os as OperatingSystem, isWeb });
			const actual = {
				isDesktopNative: platform.isDesktopNative,
				isTouch: platform.isTouch,
				isWebTouch: platform.isWebTouch,
				usesTouchInput: platform.usesTouchInput,
				isLinux: platform.isLinux,
				isWindows: platform.isWindows,
				isMacOS: platform.isMacOS,
				isAndroid: platform.isAndroid,
				isIOS: platform.isIOS
			};
			expect(actual, `${os} web=${isWeb}`).toEqual(flags);
			expect(platform.density).toBe(flags.usesTouchInput ? 'touch' : 'pointer');
		}
	});
});

describe('detectOperatingSystem', () => {
	const agents: [string, OperatingSystem][] = [
		[
			'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/60.5 Safari/605.1.15',
			'linux'
		],
		[
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0',
			'windows'
		],
		[
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
			'macos'
		],
		[
			'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/141.0 Mobile',
			'android'
		],
		['Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15', 'ios'],
		['Mozilla/5.0 (X11; CrOS x86_64 16000.0.0) AppleWebKit/537.36', 'linux'],
		['', 'linux']
	];

	it('reads the user agent', () => {
		for (const [agent, os] of agents) expect(detectOperatingSystem(agent), agent).toBe(os);
	});

	it('tells iPadOS apart from macOS by touch points', () => {
		const ipad = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
		expect(detectOperatingSystem(ipad, { maxTouchPoints: 5 })).toBe('ios');
	});

	it('prefers the platform hint', () => {
		expect(detectOperatingSystem('', { platform: 'Windows' })).toBe('windows');
		expect(detectOperatingSystem('', { platform: 'macOS' })).toBe('macos');
	});
});

describe('Platform.current', () => {
	afterEach(() => {
		delete (globalThis as { isTauri?: unknown }).isTauri;
	});

	it('is a browser outside a Tauri webview', () => {
		expect(isTauriWebview()).toBe(false);
		expect(Platform.current().isWeb).toBe(true);
	});

	it('is native inside a Tauri webview', () => {
		(globalThis as { isTauri?: unknown }).isTauri = true;
		expect(isTauriWebview()).toBe(true);
		expect(Platform.current().isWeb).toBe(false);
	});
});
