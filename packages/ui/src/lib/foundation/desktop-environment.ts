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

/** The Linux desktop environments oito2 recognizes, plus `unknown`. */
export const desktopEnvironments = [
	'gnome',
	'kde',
	'xfce',
	'budgie',
	'cosmic',
	'cinnamon',
	'mate',
	'lxqt',
	'pantheon',
	'unity',
	'unknown'
] as const;

/** A Linux desktop environment, or `unknown` when it isn't recognized. */
export type DesktopEnvironment = (typeof desktopEnvironments)[number];

const names: Readonly<Record<string, DesktopEnvironment>> = {
	gnome: 'gnome',
	'gnome-classic': 'gnome',
	'gnome-xorg': 'gnome',
	'gnome-wayland': 'gnome',
	kde: 'kde',
	plasma: 'kde',
	plasmawayland: 'kde',
	plasmax11: 'kde',
	xfce: 'xfce',
	xfce4: 'xfce',
	xubuntu: 'xfce',
	budgie: 'budgie',
	'budgie-desktop': 'budgie',
	cosmic: 'cosmic',
	'x-cinnamon': 'cinnamon',
	cinnamon: 'cinnamon',
	cinnamon2d: 'cinnamon',
	mate: 'mate',
	lxqt: 'lxqt',
	lubuntu: 'lxqt',
	pantheon: 'pantheon',
	unity: 'unity',
	unity7: 'unity'
};

// Maps one desktop or session name, ignoring case and surrounding spaces.
function fromName(name: string): DesktopEnvironment | undefined {
	const key = name.trim().toLowerCase();
	return Object.hasOwn(names, key) ? names[key] : undefined;
}

/** The environment variables that identify the desktop environment. */
export interface DesktopEnvironmentSources {
	/** `XDG_CURRENT_DESKTOP`: a colon-separated list such as `ubuntu:GNOME`. */
	xdgCurrentDesktop?: string | null;
	/** `DESKTOP_SESSION`, checked only when no `XDG_CURRENT_DESKTOP` entry is recognized. */
	desktopSession?: string | null;
}

/**
 * Detects the desktop environment from `XDG_CURRENT_DESKTOP` and `DESKTOP_SESSION`.
 *
 * The `XDG_CURRENT_DESKTOP` entries are checked in order and the first recognized one
 * wins; `DESKTOP_SESSION` is checked only when none is. Matching ignores case. Returns
 * `unknown` when neither value is recognized.
 */
export function detectDesktopEnvironment(
	sources: DesktopEnvironmentSources = {}
): DesktopEnvironment {
	for (const entry of (sources.xdgCurrentDesktop ?? '').split(':')) {
		const match = fromName(entry);
		if (match) return match;
	}
	return fromName(sources.desktopSession ?? '') ?? 'unknown';
}
