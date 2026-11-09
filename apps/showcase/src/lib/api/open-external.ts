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

import { isTauri } from '@tauri-apps/api/core';

/**
 * Opens `url` outside the showcase: in the system browser through the opener plugin inside
 * Tauri, where the capability limits the addresses it accepts, and in a new tab in a browser.
 * Rejects when the plugin refuses or fails to open the address.
 */
export async function openExternal(url: string): Promise<void> {
	if (isTauri()) {
		const { openUrl } = await import('@tauri-apps/plugin-opener');
		await openUrl(url);
		return;
	}
	window.open(url, '_blank', 'noopener');
}

/**
 * Click handler of a link to `url` that also renders in a browser: inside Tauri it cancels the
 * navigation of the webview and opens the address with `openExternal`, logging a failure.
 */
export function onExternalClick(event: MouseEvent, url: string): void {
	if (!isTauri()) return;
	event.preventDefault();
	void openExternal(url).catch((error: unknown) => {
		console.error(`oito2: could not open ${url}`, error);
	});
}
