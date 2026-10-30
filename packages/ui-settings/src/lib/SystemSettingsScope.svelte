<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<!--
  @component
  Provides the real system settings to the components inside it, like `SystemScope`:
  the desktop environment, the window control style and button layout, the accent color
  and the high-contrast preference. It starts from `initialSettings` (or the platform
  defaults), reads the settings through `tauri-plugin-oito2-settings` once mounted,
  follows the changes the plugin reports (Linux) and reads them again whenever the window
  regains focus (after the user changed them in the system settings). In a browser it
  keeps the defaults.
-->
<script lang="ts">
	import { Platform, SystemScope, fallbackSystemSettings, type SystemSettings } from '@oito2/ui';
	import { isTauri } from '@tauri-apps/api/core';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { composeSystemSettings, sameSystemSettings } from './compose.js';
	import type { RawSettings } from './raw-settings.js';
	import { tauriSettingsSource, type SettingsSource } from './source.js';

	interface Props {
		/** The settings before the first read. Defaults to the platform defaults. */
		initialSettings?: SystemSettings;
		/** Where the settings come from. Defaults to the Tauri plugin inside Tauri. */
		source?: SettingsSource | null;
		/** The platform. Defaults to the running one. */
		platform?: Platform;
		/** Called with the settings after each change. */
		onSettingsChange?: (settings: SystemSettings) => void;
		/** The content that reads the settings. */
		children: Snippet;
	}

	let {
		initialSettings,
		source = isTauri() ? tauriSettingsSource : null,
		platform = Platform.current(),
		onSettingsChange,
		children
	}: Props = $props();

	// The initial settings only seed the state; later reads replace them.
	let settings: SystemSettings = $state(
		untrack(() => initialSettings ?? fallbackSystemSettings(platform))
	);
	let generation = 0;

	/**
	 * Applies new values unless a newer read already did, and only when they change; values
	 * that can't be composed are ignored.
	 */
	function apply(raw: RawSettings, from: number) {
		if (from !== generation) return;
		let next: SystemSettings;
		try {
			next = composeSystemSettings(raw, platform);
		} catch {
			// Values the plugin couldn't read in full keep the current settings.
			return;
		}
		if (sameSystemSettings(next, settings)) return;
		settings = next;
		onSettingsChange?.(next);
	}

	/** Reads the settings again; a failed read keeps the current ones. */
	function refresh() {
		if (!source) return;
		const from = ++generation;
		source.read().then(
			(raw) => apply(raw, from),
			() => {}
		);
	}

	onMount(() => {
		if (!source) return;
		let stop: (() => void) | null = null;
		let disposed = false;
		refresh();
		source
			.subscribe((raw) => apply(raw, ++generation))
			.then((unsubscribe) => {
				if (disposed) unsubscribe();
				else stop = unsubscribe;
			})
			.catch(() => {});
		window.addEventListener('focus', refresh);
		return () => {
			disposed = true;
			stop?.();
			window.removeEventListener('focus', refresh);
		};
	});
</script>

<SystemScope {settings}>{@render children()}</SystemScope>
