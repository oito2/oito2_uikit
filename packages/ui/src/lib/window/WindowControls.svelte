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
  A row of window control buttons in the given order, wired to a window controller:
  minimize, maximize (restore while maximized) and close. The spacing follows the style:
  none between Windows buttons and macOS traffic lights, 8 pixels otherwise.
-->
<script lang="ts">
	import type { WindowButton, WindowControlStyle } from '../foundation/window-button-layout.js';
	import WindowControl from './WindowControl.svelte';
	import type { WindowControlLabels } from './window-control.js';
	import { defaultWindowState, type WindowController } from './window-controller.js';

	interface Props {
		/** The buttons, in order. */
		buttons: readonly WindowButton[];
		/** The look of the buttons. */
		controlStyle: WindowControlStyle;
		/** The window the buttons act on; without one they do nothing. */
		controller?: WindowController | null;
		/** Replaces the close action, as a dialog does. */
		onClose?: () => void;
		/** Label overrides by type. */
		labels?: WindowControlLabels;
	}

	let { buttons, controlStyle, controller = null, onClose, labels }: Props = $props();

	let state = $derived(controller?.state ?? defaultWindowState);
</script>

{#if controlStyle !== 'none' && buttons.length > 0}
	<div class="oito2-window-controls" data-control-style={controlStyle}>
		{#each buttons as button (button)}
			{#if button === 'minimize'}
				<WindowControl
					type="minimize"
					{controlStyle}
					{labels}
					active={state.isActive}
					disabled={!controller}
					onclick={() => void controller?.minimize()}
				/>
			{:else if button === 'maximize'}
				<WindowControl
					type={state.isMaximized ? 'restore' : 'maximize'}
					{controlStyle}
					{labels}
					active={state.isActive}
					disabled={!controller}
					onclick={() => void controller?.toggleMaximize()}
				/>
			{:else}
				<WindowControl
					type="close"
					{controlStyle}
					{labels}
					active={state.isActive}
					disabled={!controller && !onClose}
					onclick={() => (onClose ? onClose() : void controller?.close())}
				/>
			{/if}
		{/each}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-window-controls {
			display: flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-sm);
		}

		[data-control-style='windows'],
		[data-control-style='macos'] {
			gap: 0;
		}
	}
</style>
