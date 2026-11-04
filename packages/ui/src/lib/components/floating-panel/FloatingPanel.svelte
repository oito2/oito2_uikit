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
  A small window inside the app, such as a tool palette: a title bar with the desktop's
  window controls over the content, placed at `rect` inside its positioned parent and kept
  within it. Dragging the title bar moves it, the corner grip resizes it, the title bar
  buttons minimize (to the bar), maximize (to the parent) and close it (`onClose`). With
  focus on the panel itself, the arrows move it by `keyboardStep` and Shift+arrows resize
  it. Bind `rect`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		WindowButtonLayout,
		type WindowControlStyle
	} from '../../foundation/window-button-layout.js';
	import TitleBar from '../../window/TitleBar.svelte';
	import type { WindowController, WindowState } from '../../window/window-controller.js';

	/** A rectangle in pixels, relative to the panel's positioned parent. */
	interface PanelRect {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
		/** The panel title. */
		title: string;
		/** The panel's place and size. */
		rect?: PanelRect;
		/** Called with the new rectangle while the panel moves or resizes. */
		onRectChange?: (rect: PanelRect) => void;
		/** The smallest size, in pixels. Defaults to 220 × 140. */
		minWidth?: number;
		/** The smallest height, in pixels. Defaults to 140. */
		minHeight?: number;
		/** Whether the corner grip and Shift+arrows resize the panel. Defaults to true. */
		resizable?: boolean;
		/** Called by the close button; without it the panel has no close button. */
		onClose?: () => void;
		/** The style of the window controls. Defaults to `gnome`. */
		controlStyle?: WindowControlStyle;
		/** How far one arrow key press moves or resizes the panel, in pixels. Defaults to 16. */
		keyboardStep?: number;
		/** The content. */
		children?: Snippet;
	}

	let {
		title,
		rect = $bindable({ x: 40, y: 40, width: 360, height: 280 }),
		onRectChange,
		minWidth = 220,
		minHeight = 140,
		resizable = true,
		onClose,
		controlStyle = 'gnome',
		keyboardStep = 16,
		class: className,
		children,
		...rest
	}: Props = $props();

	let panel = $state<HTMLDivElement | null>(null);
	let maximized = $state(false);
	let minimized = $state(false);
	const barHeight = 46;

	/** Keeps `next` at least the minimum size and its title bar inside the parent. */
	function clamp(next: PanelRect): PanelRect {
		const parent = panel?.offsetParent as HTMLElement | null;
		const width = Math.max(next.width, minWidth);
		const height = Math.max(next.height, minHeight);
		const boundsW = parent?.clientWidth ?? Infinity;
		const boundsH = parent?.clientHeight ?? Infinity;
		return {
			x: Math.min(Math.max(next.x, 0), Math.max(0, boundsW - width)),
			y: Math.min(Math.max(next.y, 0), Math.max(0, boundsH - barHeight)),
			width: Math.min(width, boundsW),
			height
		};
	}

	function setRect(next: PanelRect) {
		const clamped = clamp(next);
		if (
			clamped.x === rect.x &&
			clamped.y === rect.y &&
			clamped.width === rect.width &&
			clamped.height === rect.height
		)
			return;
		rect = clamped;
		onRectChange?.(clamped);
	}

	/** Follows the pressed pointer from `from`, calling `apply` with the movement. */
	function follow(from: { x: number; y: number }, apply: (dx: number, dy: number) => void) {
		const onMove = (event: PointerEvent) =>
			apply(event.clientX - from.x, event.clientY - from.y);
		const onUp = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
	}

	let lastDown = { x: 0, y: 0 };

	class PanelWindow implements WindowController {
		get state(): WindowState {
			return {
				isMaximized: maximized,
				isFullScreen: false,
				isActive: true,
				canShowMenu: false
			};
		}
		async minimize() {
			minimized = !minimized;
			if (minimized) maximized = false;
		}
		async toggleMaximize() {
			maximized = !maximized;
			if (maximized) minimized = false;
		}
		async close() {
			onClose?.();
		}
		async startDrag() {
			if (maximized) return;
			const start = { ...rect };
			follow(lastDown, (dx, dy) => setRect({ ...start, x: start.x + dx, y: start.y + dy }));
		}
		async showMenu() {}
	}
	const controller = new PanelWindow();

	function onkeydown(event: KeyboardEvent) {
		if (event.target !== panel || maximized) return;
		const moves: Record<string, [number, number]> = {
			ArrowLeft: [-keyboardStep, 0],
			ArrowRight: [keyboardStep, 0],
			ArrowUp: [0, -keyboardStep],
			ArrowDown: [0, keyboardStep]
		};
		const delta = moves[event.key];
		if (!delta) return;
		event.preventDefault();
		if (event.shiftKey) {
			if (resizable)
				setRect({ ...rect, width: rect.width + delta[0], height: rect.height + delta[1] });
		} else setRect({ ...rect, x: rect.x + delta[0], y: rect.y + delta[1] });
	}

	let buttons = $derived(
		new WindowButtonLayout({
			trailing: onClose ? ['minimize', 'maximize', 'close'] : ['minimize', 'maximize']
		})
	);
</script>

<!-- The panel takes focus as a whole, so the arrows move it. -->
<div
	bind:this={panel}
	role="dialog"
	aria-label={title}
	tabindex="0"
	class={['oito2-floating-panel', className]}
	data-maximized={maximized ? '' : undefined}
	data-minimized={minimized ? '' : undefined}
	style:left={maximized ? '0' : `${rect.x}px`}
	style:top={maximized ? '0' : `${rect.y}px`}
	style:width={maximized ? '100%' : `${rect.width}px`}
	style:height={maximized ? '100%' : minimized ? undefined : `${rect.height}px`}
	onpointerdowncapture={(event) => (lastDown = { x: event.clientX, y: event.clientY })}
	{onkeydown}
	{...rest}
>
	<TitleBar
		{title}
		{controlStyle}
		buttonLayout={buttons}
		{controller}
		height={barHeight}
		class="oito2-floating-panel-bar"
	/>
	{#if !minimized}
		<div class="content">{@render children?.()}</div>
		{#if resizable && !maximized}
			<span
				class="grip"
				aria-hidden="true"
				onpointerdown={(event) => {
					if (event.button !== 0) return;
					event.preventDefault();
					const start = { ...rect };
					follow({ x: event.clientX, y: event.clientY }, (dx, dy) =>
						setRect({ ...start, width: start.width + dx, height: start.height + dy })
					);
				}}
			></span>
		{/if}
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-floating-panel {
			position: absolute;
			z-index: 10;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-window);
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
			box-shadow: 0 4px 16px color-mix(in srgb, var(--oito2-color-shadow) 25%, transparent);
		}

		.oito2-floating-panel:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		[data-maximized] {
			border-radius: 0;
		}

		.content {
			flex: 1;
			min-height: 0;
			overflow: auto;
		}

		.grip {
			position: absolute;
			right: 0;
			bottom: 0;
			width: 14px;
			height: 14px;
			background: linear-gradient(
				135deg,
				transparent 55%,
				var(--oito2-color-outline) 55% 62%,
				transparent 62% 75%,
				var(--oito2-color-outline) 75% 82%,
				transparent 82%
			);
			cursor: nwse-resize;
			touch-action: none;
		}
	}
</style>
