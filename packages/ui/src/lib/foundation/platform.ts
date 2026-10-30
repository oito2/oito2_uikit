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

/** The operating systems oito2 tells apart. */
export const operatingSystems = ['android', 'fuchsia', 'ios', 'linux', 'macos', 'windows'] as const;

/** An operating system: the native one, or the browser host's on the web. */
export type OperatingSystem = (typeof operatingSystems)[number];

/** The input density of a platform: pointer (34 px controls) or touch (40 px controls). */
export type Density = 'pointer' | 'touch';

const desktopSystems: ReadonlySet<OperatingSystem> = new Set(['linux', 'macos', 'windows']);

/**
 * Detects the operating system from a user agent string, and from the
 * `navigator.userAgentData.platform` hint when the browser offers it. iPadOS reports a
 * Mac user agent; `maxTouchPoints` above 1 tells it apart. Unrecognized agents count as
 * Linux.
 */
export function detectOperatingSystem(
	userAgent: string,
	options: { platform?: string; maxTouchPoints?: number } = {}
): OperatingSystem {
	const hint = (options.platform ?? '').toLowerCase();
	const agent = userAgent.toLowerCase();
	if (hint === 'android' || agent.includes('android')) return 'android';
	if (hint === 'ios' || /iphone|ipad|ipod/.test(agent)) return 'ios';
	if (hint === 'macos' || agent.includes('macintosh') || agent.includes('mac os x')) {
		return (options.maxTouchPoints ?? 0) > 1 ? 'ios' : 'macos';
	}
	if (hint === 'windows' || agent.includes('windows')) return 'windows';
	if (agent.includes('fuchsia')) return 'fuchsia';
	return 'linux';
}

/** Whether the page runs inside a Tauri webview. */
export function isTauriWebview(): boolean {
	return Boolean((globalThis as { isTauri?: unknown }).isTauri);
}

/**
 * Describes the platform an app runs on and the ergonomics that follow from it.
 *
 * `Platform.current()` reads the running platform; the constructor takes explicit values,
 * so tests and previews can simulate any platform.
 */
export class Platform {
	/** The operating system, or the browser host's on the web. */
	readonly os: OperatingSystem;

	/** Whether the app runs in a web browser instead of a Tauri webview. */
	readonly isWeb: boolean;

	constructor(options: { os: OperatingSystem; isWeb: boolean }) {
		this.os = options.os;
		this.isWeb = options.isWeb;
	}

	/**
	 * Describes the running platform: the operating system from the user agent, and
	 * `isWeb` unless the page runs inside a Tauri webview. Without a `navigator` (server
	 * rendering) it describes a Linux browser.
	 */
	static current(): Platform {
		const nav = (globalThis as { navigator?: Navigator }).navigator;
		if (!nav) return new Platform({ os: 'linux', isWeb: true });
		const data = (nav as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
		const os = detectOperatingSystem(nav.userAgent, {
			platform: data?.platform,
			maxTouchPoints: nav.maxTouchPoints
		});
		return new Platform({ os, isWeb: !isTauriWebview() });
	}

	private get isDesktopOs(): boolean {
		return desktopSystems.has(this.os);
	}

	/** Whether the app runs as a native desktop app (Linux, Windows or macOS). */
	get isDesktopNative(): boolean {
		return !this.isWeb && this.isDesktopOs;
	}

	/** Whether the app runs natively on a touch-first system (Android, iOS or Fuchsia). */
	get isTouch(): boolean {
		return !this.isWeb && !this.isDesktopOs;
	}

	/** Whether the app runs in a browser on a touch-first system. */
	get isWebTouch(): boolean {
		return this.isWeb && !this.isDesktopOs;
	}

	/** Whether the primary input is touch, natively or in a browser. */
	get usesTouchInput(): boolean {
		return this.isTouch || this.isWebTouch;
	}

	/** Whether the operating system is Linux. */
	get isLinux(): boolean {
		return this.os === 'linux';
	}

	/** Whether the operating system is Windows. */
	get isWindows(): boolean {
		return this.os === 'windows';
	}

	/** Whether the operating system is macOS. */
	get isMacOS(): boolean {
		return this.os === 'macos';
	}

	/** Whether the operating system is Android. */
	get isAndroid(): boolean {
		return this.os === 'android';
	}

	/** Whether the operating system is iOS. */
	get isIOS(): boolean {
		return this.os === 'ios';
	}

	/** The density for this platform: touch for touch input, pointer otherwise. */
	get density(): Density {
		return this.usesTouchInput ? 'touch' : 'pointer';
	}

	/** Whether `other` describes the same platform. */
	equals(other: Platform): boolean {
		return other.os === this.os && other.isWeb === this.isWeb;
	}
}
