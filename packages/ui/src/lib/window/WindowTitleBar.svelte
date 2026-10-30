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
  The title bar of an app window, set up for the platform from the closest `SystemScope`:
  the window control style and button layout of the desktop on Linux and Windows, room
  for the native traffic lights on macOS, no controls and no dragging in a browser, and a
  56-pixel app bar on touch platforms. The title is centered except on Windows. The window controller comes from the closest
  `WindowScope` unless `controller` is given.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { WindowButtonLayout } from '../foundation/window-button-layout.js';
	import { useSystemSettings } from '../foundation/system-scope.js';
	import TitleBar from './TitleBar.svelte';
	import { defaultWindowState, useWindowController } from './window-controller.js';

	type Props = Omit<
		ComponentProps<typeof TitleBar>,
		'controlStyle' | 'buttonLayout' | 'leadingInset' | 'height' | 'draggable'
	> & {
		/** Which sides show window controls, for apps split into panes. Defaults to `both`. */
		buttonSides?: 'both' | 'leading' | 'trailing';
	};

	let { buttonSides = 'both', controller, centerTitle, ...rest }: Props = $props();

	/** The space the macOS traffic lights take at the start of the bar. */
	const trafficLightsInset = 72;

	const system = useSystemSettings();
	const scope = useWindowController();
	let platform = $derived(system.current.platform);
	let windowController = $derived(controller === undefined ? scope.current : controller);
	let layout = $derived(system.current.windowButtonLayout);
	let buttonLayout = $derived(
		new WindowButtonLayout({
			leading: buttonSides === 'trailing' ? [] : layout.leading,
			trailing: buttonSides === 'leading' ? [] : layout.trailing
		})
	);
	// Windows title bars start their title at the left, like native ones.
	let center = $derived(centerTitle ?? !platform.isWindows);
	let fullScreen = $derived((windowController?.state ?? defaultWindowState).isFullScreen);
</script>

{#if platform.usesTouchInput}
	<TitleBar
		{...rest}
		centerTitle={center}
		controller={null}
		controlStyle="none"
		height={56}
		draggable={false}
	/>
{:else if !platform.isDesktopNative}
	<TitleBar
		{...rest}
		centerTitle={center}
		controller={null}
		controlStyle="none"
		draggable={false}
	/>
{:else if platform.isMacOS}
	<TitleBar
		{...rest}
		centerTitle={center}
		controller={windowController}
		controlStyle="none"
		leadingInset={buttonSides !== 'trailing' && !fullScreen ? trafficLightsInset : 0}
	/>
{:else}
	<TitleBar
		{...rest}
		centerTitle={center}
		controller={windowController}
		controlStyle={system.current.windowControlStyle}
		{buttonLayout}
	/>
{/if}
