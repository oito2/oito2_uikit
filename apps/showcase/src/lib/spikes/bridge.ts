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

import { invoke, isTauri } from '@tauri-apps/api/core';

/** Spike pages that can report their results to the terminal. */
export type SpikeName = 'baseline' | 'chrome';

/**
 * Returns the spike the Tauri debug build was asked to run (`OITO2_SPIKE`
 * environment variable), or `null` in the browser and in release builds.
 */
export async function spikeRequest(): Promise<SpikeName | null> {
	if (!isTauri()) return null;
	try {
		return await invoke<SpikeName | null>('spike_request');
	} catch {
		// Release builds don't register the spike commands.
		return null;
	}
}

/** Window frame modes the showcase can start with (`OITO2_DECORATIONS`). */
export type DecorationMode = 'native' | 'undecorated' | 'gtk-headerless';

/**
 * Returns the decoration mode of the Tauri debug build, or `null` in the
 * browser and in release builds.
 */
export async function spikeDecorationMode(): Promise<DecorationMode | null> {
	if (!isTauri()) return null;
	try {
		return await invoke<DecorationMode>('spike_decoration_mode');
	} catch {
		// Release builds don't register the spike commands.
		return null;
	}
}

/**
 * Sends a spike report to the Tauri debug build, which prints it to stdout and
 * exits. Does nothing in the browser.
 */
export async function spikeReport(report: unknown): Promise<void> {
	if (!isTauri()) return;
	await invoke('spike_report', { report: JSON.stringify(report) });
}
