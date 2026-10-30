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
  A window control button (minimize, maximize, restore or close) drawn in the look of a
  desktop: `gnome`, `breeze` (KDE), `xfwm` (Xfce), `cosmic`, `windows` or `macos`
  (traffic lights). `none` renders nothing. The glyph takes the text color around it,
  except on macOS. The buttons stay out of the Tab order, like native ones.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { WindowControlStyle } from '../foundation/window-button-layout.js';
	import { useLocale } from '../l10n/locale.js';
	import {
		windowControlLabel,
		windowControlWidth,
		type WindowControlLabels,
		type WindowControlType
	} from './window-control.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'type'> {
		/** The action and glyph. */
		type: WindowControlType;
		/** The look of the button. */
		controlStyle: WindowControlStyle;
		/** The accessible label. Defaults to the localized label of `type`. */
		label?: string;
		/** Label overrides by type, used when `label` is not set. */
		labels?: WindowControlLabels;
		/** Whether the window is active; inactive macOS buttons turn grey. Defaults to true. */
		active?: boolean;
	}

	let {
		type,
		controlStyle,
		label,
		labels,
		active = true,
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();

	let macos = $derived(controlStyle === 'macos');
	let windows = $derived(controlStyle === 'windows');
	let glyph = $derived(windows ? 10 : macos ? 6 : 8);
	let stroke = $derived(windows ? 1 : macos ? 1.2 : 1.4);
	let inset = $derived(glyph * 0.25);
</script>

{#if controlStyle !== 'none'}
	<button
		type="button"
		tabindex="-1"
		aria-label={label ?? windowControlLabel(type, locale.strings, labels)}
		{disabled}
		class={['oito2-window-control', className]}
		data-control-style={controlStyle}
		data-type={type}
		data-inactive={active ? undefined : ''}
		style:width="{windowControlWidth(controlStyle)}px"
		{...rest}
	>
		<span class="shape">
			<svg
				width={glyph}
				height={glyph}
				viewBox="0 0 {glyph} {glyph}"
				fill="none"
				stroke="currentColor"
				stroke-width={stroke}
				stroke-linecap="square"
				aria-hidden="true"
			>
				{#if type === 'minimize'}
					<path d="M0 {glyph / 2} H{glyph}" />
				{:else if type === 'close'}
					<path d="M0 0 L{glyph} {glyph} M{glyph} 0 L0 {glyph}" />
				{:else if macos}
					<path d="M0 {glyph / 2} H{glyph} M{glyph / 2} 0 V{glyph}" />
				{:else if type === 'maximize'}
					<rect width={glyph} height={glyph} />
				{:else}
					<rect y={inset} width={glyph - inset} height={glyph - inset} />
					<path d="M{inset} {inset} V0 H{glyph} V{glyph - inset} H{glyph - inset}" />
				{/if}
			</svg>
		</span>
	</button>
{/if}

<style>
	@layer oito2 {
		.oito2-window-control {
			--tint: 0%;
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			height: 24px;
			margin: 0;
			padding: 0;
			border: none;
			background: none;
			color: inherit;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-window-control:disabled {
			cursor: default;
		}

		.shape {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background: color-mix(in srgb, currentColor var(--tint), transparent);
		}

		svg {
			display: block;
			overflow: visible;
		}

		/* GNOME: a filled circle that darkens on hover and press. */
		[data-control-style='gnome'] {
			--tint: 10%;
		}

		[data-control-style='gnome']:not(:disabled):hover {
			--tint: 15%;
		}

		[data-control-style='gnome']:not(:disabled):active {
			--tint: 20%;
		}

		/* COSMIC, Breeze and Xfwm: invisible until hovered. */
		:is([data-control-style='cosmic'], [data-control-style='xfwm']):not(:disabled):hover {
			--tint: 10%;
		}

		:is([data-control-style='cosmic'], [data-control-style='xfwm']):not(:disabled):active {
			--tint: 16%;
		}

		[data-control-style='breeze']:not(:disabled):hover {
			--tint: 12%;
		}

		[data-control-style='breeze']:not(:disabled):active {
			--tint: 18%;
		}

		[data-control-style='breeze'][data-type='close']:not(:disabled):is(:hover, :active) .shape {
			background: #da4453;
			color: #fff;
		}

		[data-control-style='breeze'][data-type='close']:not(:disabled):active .shape {
			background: rgb(218 68 83 / 80%);
		}

		[data-control-style='xfwm'] .shape {
			border-radius: var(--oito2-radius-check);
		}

		/* Windows: full-height rectangles; close turns red. */
		[data-control-style='windows'] {
			height: var(--oito2-title-bar-height, 46px);
		}

		[data-control-style='windows'] .shape {
			width: 100%;
			height: 100%;
			border-radius: 0;
		}

		[data-control-style='windows']:not(:disabled):hover {
			--tint: 8%;
		}

		[data-control-style='windows']:not(:disabled):active {
			--tint: 12%;
		}

		[data-control-style='windows'][data-type='close']:not(:disabled):is(:hover, :active)
			.shape {
			background: #c42b1c;
			color: #fff;
		}

		[data-control-style='windows'][data-type='close']:not(:disabled):active .shape {
			background: rgb(196 43 28 / 85%);
		}

		/* macOS: 12-pixel traffic lights whose glyph shows on hover. */
		[data-control-style='macos'] .shape {
			width: 12px;
			height: 12px;
			background: #28c840;
			color: transparent;
		}

		[data-control-style='macos'][data-type='close'] .shape {
			background: #ff5f57;
		}

		[data-control-style='macos'][data-type='minimize'] .shape {
			background: #febc2e;
		}

		[data-control-style='macos'][data-inactive]:not(:hover) .shape {
			background: #c8c8c8;
		}

		[data-control-style='macos']:not(:disabled):hover .shape {
			color: rgb(0 0 0 / 65%);
		}
	}
</style>
