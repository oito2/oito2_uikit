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
  A window title bar, 46 pixels high in the title bar chrome color: `leading` content, a
  `title` (centered by default) and `trailing` content, with the window controls of
  `buttonLayout` on their sides. Its empty background moves the window, a double click
  maximizes it and the secondary button opens the window menu. `barStyle` hides the bar
  (`hidden`) or its controls (`undecorated`). Most apps use `WindowTitleBar`, which
  takes the style and layout from the system.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		WindowButtonLayout,
		type WindowControlStyle
	} from '../foundation/window-button-layout.js';
	import WindowControls from './WindowControls.svelte';
	import { dragRegionAttribute, titleBarGestures } from './title-bar-gestures.js';
	import { titleBarHeight, type WindowControlLabels } from './window-control.js';
	import {
		defaultWindowState,
		useWindowController,
		type WindowController
	} from './window-controller.js';

	/** How a title bar is presented: not at all, without window controls, or with them. */
	type TitleBarStyle = 'hidden' | 'undecorated' | 'normal';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** The title, usually text. */
		title?: string | Snippet;
		/** Content at the start, after the leading window controls. */
		leading?: Snippet;
		/** Content at the end, before the trailing window controls, such as icon buttons. */
		trailing?: Snippet;
		/** How the bar is presented. Defaults to `normal`. */
		barStyle?: TitleBarStyle;
		/** The look of the window controls. Defaults to `gnome`. */
		controlStyle?: WindowControlStyle;
		/** Which window controls show on each side. Defaults to minimize, maximize and close at the end. */
		buttonLayout?: WindowButtonLayout;
		/** The window the bar controls. Defaults to the one of the closest `WindowScope`. */
		controller?: WindowController | null;
		/** Replaces the close action. */
		onClose?: () => void;
		/** Label overrides for the window controls. */
		labels?: WindowControlLabels;
		/** Whether the title is centered in the bar. Defaults to true. */
		centerTitle?: boolean;
		/** Space kept free at the start, such as for the macOS traffic lights, in pixels. */
		leadingInset?: number;
		/** The height in pixels. Defaults to 46. */
		height?: number;
		/** Whether the bar moves the window. Defaults to true. */
		draggable?: boolean;
		/** Whether the title takes clicks (tabs, a search field) instead of moving the window. */
		interactiveTitle?: boolean;
		/** Whether a line separates the bar from the content. Defaults to true. */
		bordered?: boolean;
	}

	let {
		title,
		leading,
		trailing,
		barStyle = 'normal',
		controlStyle = 'gnome',
		buttonLayout = new WindowButtonLayout({ trailing: ['minimize', 'maximize', 'close'] }),
		controller,
		onClose,
		labels,
		centerTitle = true,
		leadingInset = 0,
		height = titleBarHeight,
		draggable = true,
		interactiveTitle = false,
		bordered = true,
		class: className,
		...rest
	}: Props = $props();

	const scope = useWindowController();
	let windowController = $derived(controller === undefined ? scope.current : controller);
	let state = $derived(windowController?.state ?? defaultWindowState);
	let showControls = $derived(barStyle === 'normal' && controlStyle !== 'none');
	let drag = $derived(draggable ? { [dragRegionAttribute]: '' } : {});
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

{#if barStyle !== 'hidden'}
	<header
		class={['oito2-title-bar', className]}
		data-oito2-title-bar=""
		data-control-style={controlStyle}
		data-center-title={centerTitle ? '' : undefined}
		data-inactive={state.isActive ? undefined : ''}
		data-bordered={bordered ? '' : undefined}
		style:--oito2-title-bar-height="{height}px"
		{@attach titleBarGestures(() => (draggable ? windowController : null))}
		{...rest}
	>
		<div class="start" {...drag} style:padding-inline-start="{leadingInset}px">
			{#if showControls}
				<WindowControls
					buttons={buttonLayout.leading}
					{controlStyle}
					controller={windowController}
					{onClose}
					{labels}
				/>
			{/if}
			{#if leading}<div class="slot">{@render leading()}</div>{/if}
		</div>
		<div class="title" {...interactiveTitle ? {} : drag}>
			{#if title}
				{#if typeof title === 'string'}<h1>{title}</h1>{:else}{@render text(title)}{/if}
			{/if}
		</div>
		<div class="end" {...drag}>
			{#if trailing}<div class="slot">{@render trailing()}</div>{/if}
			{#if showControls}
				<WindowControls
					buttons={buttonLayout.trailing}
					{controlStyle}
					controller={windowController}
					{onClose}
					{labels}
				/>
			{/if}
		</div>
	</header>
{/if}

<style>
	@layer oito2 {
		.oito2-title-bar {
			--edge: var(--oito2-space-sm);
			display: grid;
			grid-template-columns: minmax(max-content, 1fr) minmax(0, max-content) minmax(
					max-content,
					1fr
				);
			align-items: center;
			gap: var(--oito2-space-lg);
			box-sizing: border-box;
			height: var(--oito2-title-bar-height);
			padding: 0 var(--edge);
			background: var(--oito2-chrome-title-bar);
			color: var(--oito2-color-on-surface);
			user-select: none;
			-webkit-user-select: none;
		}

		[data-bordered] {
			border-bottom: 1px solid var(--oito2-color-outline-variant);
		}

		[data-control-style='windows'] {
			--edge: 0px;
		}

		.oito2-title-bar:not([data-center-title]) {
			grid-template-columns: max-content 1fr max-content;
		}

		.start,
		.end {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-xs);
			height: 100%;
			min-width: 0;
		}

		.end {
			justify-content: flex-end;
		}

		.slot {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-xs);
		}

		.title {
			display: flex;
			align-items: center;
			min-width: 0;
			height: 100%;
			overflow: hidden;
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
			white-space: nowrap;
		}

		[data-center-title] .title {
			justify-content: center;
		}

		h1 {
			margin: 0;
			overflow: hidden;
			font: inherit;
			text-overflow: ellipsis;
		}

		/* The content of an inactive window fades; the background stays. */
		.start,
		.title,
		.end {
			transition: opacity 150ms ease-in-out;
		}

		[data-inactive] :is(.start, .title, .end) {
			opacity: 0.7;
		}

		@media (prefers-reduced-motion: reduce) {
			.start,
			.title,
			.end {
				transition: none;
			}
		}
	}
</style>
