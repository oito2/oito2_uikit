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
  Invisible handles along the edges and corners of an undecorated Linux window, which
  resize it when dragged. They show only while the window has no system frame and isn't
  maximized or full screen; GTK client-side decorations and the other platforms resize
  the window themselves.
-->
<script lang="ts">
	import { Platform } from '@oito2/ui';
	import type {
		NativeWindowController,
		ResizeDirection
	} from './native-window-controller.svelte.js';

	interface Props {
		/** The window to resize; without one nothing renders. */
		controller: NativeWindowController | null;
		/** The thickness of the edge handles in pixels. Defaults to 6. */
		thickness?: number;
	}

	let { controller, thickness = 6 }: Props = $props();

	const handles: { direction: ResizeDirection; edge: string }[] = [
		{ direction: 'North', edge: 'n' },
		{ direction: 'South', edge: 's' },
		{ direction: 'East', edge: 'e' },
		{ direction: 'West', edge: 'w' },
		{ direction: 'NorthEast', edge: 'ne' },
		{ direction: 'NorthWest', edge: 'nw' },
		{ direction: 'SouthEast', edge: 'se' },
		{ direction: 'SouthWest', edge: 'sw' }
	];

	const linux = Platform.current().isLinux;
	let shown = $derived(
		linux &&
			controller !== null &&
			controller.decorations === 'undecorated' &&
			!controller.state.isMaximized &&
			!controller.state.isFullScreen
	);

	function attach(direction: ResizeDirection) {
		return (node: HTMLElement) => {
			const down = (event: PointerEvent) => {
				if (event.button !== 0) return;
				event.preventDefault();
				void controller?.startResize(direction);
			};
			node.addEventListener('pointerdown', down);
			return () => node.removeEventListener('pointerdown', down);
		};
	}
</script>

{#if shown}
	{#each handles as handle (handle.direction)}
		<div
			class="oito2-resize-handle"
			data-edge={handle.edge}
			style:--thickness="{thickness}px"
			aria-hidden="true"
			{@attach attach(handle.direction)}
		></div>
	{/each}
{/if}

<style>
	@layer oito2 {
		.oito2-resize-handle {
			position: fixed;
			z-index: 2000;
		}

		[data-edge='n'],
		[data-edge='s'] {
			right: calc(var(--thickness) * 2);
			left: calc(var(--thickness) * 2);
			height: var(--thickness);
			cursor: ns-resize;
		}

		[data-edge='n'] {
			top: 0;
		}

		[data-edge='s'] {
			bottom: 0;
		}

		[data-edge='e'],
		[data-edge='w'] {
			top: calc(var(--thickness) * 2);
			bottom: calc(var(--thickness) * 2);
			width: var(--thickness);
			cursor: ew-resize;
		}

		[data-edge='e'] {
			right: 0;
		}

		[data-edge='w'] {
			left: 0;
		}

		[data-edge='ne'],
		[data-edge='nw'],
		[data-edge='se'],
		[data-edge='sw'] {
			width: calc(var(--thickness) * 2);
			height: calc(var(--thickness) * 2);
		}

		[data-edge='ne'] {
			top: 0;
			right: 0;
			cursor: nesw-resize;
		}

		[data-edge='sw'] {
			bottom: 0;
			left: 0;
			cursor: nesw-resize;
		}

		[data-edge='nw'] {
			top: 0;
			left: 0;
			cursor: nwse-resize;
		}

		[data-edge='se'] {
			right: 0;
			bottom: 0;
			cursor: nwse-resize;
		}
	}
</style>
