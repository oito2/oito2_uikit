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
  A color picker: a saturation and brightness area, a hue slider, an optional opacity
  slider, text fields in a chosen format (hex, RGB or HSL) and optional `swatches`. Every
  part works by pointer and keyboard: the arrows move the area and the sliders by 1%, or
  10% with Shift, and the fields apply on Enter or when they lose focus. The color is
  held as HSV, so a gray keeps its hue. Bind `value` (`#RRGGBB`, or `#RRGGBBAA` when
  translucent). `ColorPickerButton` shows it in a popover.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import * as SegmentGroup from '../choice/segment-group/index.js';
	import ColorDisk from '../controls/ColorDisk.svelte';
	import {
		parseHexColor,
		formatHexColor,
		hslToRgb,
		hsvKeepingHue,
		hsvToRgb,
		rgbToHsl,
		type ColorFormat,
		type HsvColor,
		type RgbaColor
	} from './color-math.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The color, as a hex string. */
		value?: string;
		/** Called with each new color. */
		onValueChange?: (value: string) => void;
		/** Whether the opacity slider shows and the hex field keeps the alpha channel. Defaults to true. */
		showAlpha?: boolean;
		/** Preset colors offered below the fields, as hex strings. */
		swatches?: readonly string[];
		/** The field format shown first. Defaults to `hex`. */
		defaultFormat?: ColorFormat;
		/** The picker width, in pixels. Defaults to 264. */
		width?: number;
	}

	let {
		value = $bindable('#3584E4'),
		onValueChange,
		showAlpha = true,
		swatches = [],
		defaultFormat = 'hex',
		width = 264,
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let hsv = $state<HsvColor>(
		untrack(() => hsvKeepingHue(parseHexColor(value) ?? { r: 0, g: 0, b: 0, a: 1 }, 0))
	);
	let format = $state<ColorFormat | null>(untrack(() => defaultFormat));
	let reported = untrack(() => value);
	let rgb = $derived(hsvToRgb(hsv));
	let hex = $derived(formatHexColor(rgb, showAlpha));

	// A color set from outside, keeping the hue for grays.
	$effect.pre(() => {
		const next = value;
		untrack(() => {
			if (next === reported) return;
			const parsed = parseHexColor(next);
			if (parsed) hsv = hsvKeepingHue(parsed, hsv.h);
			reported = next;
		});
	});

	/** Shows and reports `next`. */
	function set(next: HsvColor) {
		hsv = next;
		reported = formatHexColor(hsvToRgb(next), showAlpha);
		value = reported;
		onValueChange?.(reported);
	}

	/** Sets an RGB color, keeping the hue (or `hue`) for grays. */
	function setColor(color: RgbaColor, hue = hsv.h) {
		set(hsvKeepingHue(color, hue));
	}

	const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);
	const percent = (n: number) => `${Math.round(clamp01(n) * 100)}%`;

	/**
	 * Tracks a pointer drag on `node`, calling `pick` with the position from 0 to 1 on each
	 * axis, leaving `inset` pixels at both horizontal ends; with `reading` the horizontal
	 * position follows the text direction.
	 */
	function drag(pick: (x: number, y: number) => void, inset = 0, reading = false) {
		return (node: HTMLElement) => {
			let active = false;
			const at = (event: PointerEvent) => {
				const box = node.getBoundingClientRect();
				const x = clamp01((event.clientX - box.left - inset) / (box.width - 2 * inset));
				const rtl = reading && directionOf(node) === 'rtl';
				pick(rtl ? 1 - x : x, clamp01((event.clientY - box.top) / box.height));
			};
			const down = (event: PointerEvent) => {
				if (event.button !== 0) return;
				active = true;
				node.setPointerCapture(event.pointerId);
				node.focus();
				at(event);
			};
			const move = (event: PointerEvent) => {
				if (active) at(event);
			};
			const up = () => (active = false);
			node.addEventListener('pointerdown', down);
			node.addEventListener('pointermove', move);
			node.addEventListener('pointerup', up);
			node.addEventListener('pointercancel', up);
			return () => {
				node.removeEventListener('pointerdown', down);
				node.removeEventListener('pointermove', move);
				node.removeEventListener('pointerup', up);
				node.removeEventListener('pointercancel', up);
			};
		};
	}

	function areaKey(event: KeyboardEvent) {
		const step = event.shiftKey ? 0.1 : 0.01;
		const moves: Record<string, [number, number]> = {
			ArrowRight: [step, 0],
			ArrowLeft: [-step, 0],
			ArrowUp: [0, step],
			ArrowDown: [0, -step]
		};
		const delta = moves[event.key];
		if (!delta) return;
		event.preventDefault();
		set({ ...hsv, s: clamp01(hsv.s + delta[0]), v: clamp01(hsv.v + delta[1]) });
	}

	/** Moves a channel slider by the arrow of `event`; Shift moves 10% on the reading arrows. */
	function sliderKey(event: KeyboardEvent, current: number, apply: (next: number) => void) {
		const rtl = directionOf(event.currentTarget as Element) === 'rtl';
		const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
		const back = rtl ? 'ArrowRight' : 'ArrowLeft';
		const big = event.shiftKey ? 0.1 : 0.01;
		let delta: number;
		if (event.key === forward) delta = big;
		else if (event.key === back) delta = -big;
		else if (event.key === 'ArrowUp') delta = 0.01;
		else if (event.key === 'ArrowDown') delta = -0.01;
		else return;
		event.preventDefault();
		apply(clamp01(current + delta));
	}

	/** Applies a field's text with `commit`, or restores the shown text when it is rejected. */
	function commitField(
		event: Event & { currentTarget: HTMLInputElement },
		shown: string,
		commit: (text: string) => boolean
	) {
		const input = event.currentTarget;
		if (input.value === shown) return;
		if (!commit(input.value)) input.value = shown;
	}

	function intIn(text: string, max: number): number | null {
		if (!/^\s*\d+\s*$/.test(text)) return null;
		return Math.min(Number(text), max);
	}

	let hsl = $derived(rgbToHsl(rgb));
	let fields = $derived.by(() => {
		const s = locale.strings;
		if (format === 'rgb') {
			const channels = [rgb.r, rgb.g, rgb.b];
			return (['R', 'G', 'B'] as const).map((label, index) => ({
				label,
				name: [s.red, s.green, s.blue][index] ?? label,
				text: String(Math.round((channels[index] ?? 0) * 255)),
				commit: (text: string) => {
					const n = intIn(text, 255);
					if (n === null) return false;
					const next = [rgb.r, rgb.g, rgb.b];
					next[index] = n / 255;
					setColor({ r: next[0] ?? 0, g: next[1] ?? 0, b: next[2] ?? 0, a: rgb.a });
					return true;
				}
			}));
		}
		if (format === 'hsl') {
			return [
				{
					label: 'H',
					name: s.hue,
					text: String(Math.round(hsv.h)),
					commit: (text: string) => {
						const n = intIn(text, 360);
						if (n === null) return false;
						setColor(hslToRgb({ ...hsl, h: n }), n);
						return true;
					}
				},
				{
					label: 'S',
					name: s.saturation,
					text: String(Math.round(hsl.s * 100)),
					commit: (text: string) => {
						const n = intIn(text, 100);
						if (n === null) return false;
						setColor(hslToRgb({ ...hsl, h: hsv.h, s: n / 100 }));
						return true;
					}
				},
				{
					label: 'L',
					name: s.lightness,
					text: String(Math.round(hsl.l * 100)),
					commit: (text: string) => {
						const n = intIn(text, 100);
						if (n === null) return false;
						setColor(hslToRgb({ ...hsl, h: hsv.h, l: n / 100 }));
						return true;
					}
				}
			];
		}
		return [
			{
				label: '#',
				name: s.hexColor,
				text: hex,
				commit: (text: string) => {
					const parsed = parseHexColor(text);
					if (!parsed) return false;
					setColor(showAlpha ? parsed : { ...parsed, a: rgb.a });
					return true;
				}
			}
		];
	});
</script>

<div
	class={['oito2-color-picker', className]}
	style:width="{width}px"
	style:--oito2-picker-hue="hsl({hsv.h} 100% 50%)"
	style:--oito2-picker-color={formatHexColor(rgb)}
	style:--oito2-picker-opaque={formatHexColor({ ...rgb, a: 1 })}
	{...rest}
>
	<div
		class="area"
		role="slider"
		tabindex="0"
		aria-label={locale.strings.saturationAndBrightness}
		aria-valuenow={Math.round(hsv.s * 100)}
		aria-valuetext="{locale.strings.saturation} {percent(hsv.s)}, {locale.strings
			.brightness} {percent(hsv.v)}"
		onkeydown={areaKey}
		{@attach drag((x, y) => set({ ...hsv, s: x, v: 1 - y }))}
	>
		<span class="thumb" style:left="{hsv.s * 100}%" style:top="{(1 - hsv.v) * 100}%"></span>
	</div>
	<div
		class="channel hue"
		role="slider"
		tabindex="0"
		aria-label={locale.strings.hue}
		aria-valuemin={0}
		aria-valuemax={360}
		aria-valuenow={Math.round(hsv.h)}
		aria-valuetext="{Math.round(hsv.h)}°"
		onkeydown={(event) => sliderKey(event, hsv.h / 360, (n) => set({ ...hsv, h: n * 360 }))}
		{@attach drag((x) => set({ ...hsv, h: x * 360 }), 9, true)}
	>
		<span class="thumb" style:inset-inline-start="calc(9px + {hsv.h / 360} * (100% - 18px))"
		></span>
	</div>
	{#if showAlpha}
		<div
			class="channel alpha"
			role="slider"
			tabindex="0"
			aria-label={locale.strings.opacity}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(hsv.a * 100)}
			aria-valuetext={percent(hsv.a)}
			onkeydown={(event) => sliderKey(event, hsv.a, (n) => set({ ...hsv, a: n }))}
			{@attach drag((x) => set({ ...hsv, a: x }), 9, true)}
		>
			<span class="thumb" style:inset-inline-start="calc(9px + {hsv.a} * (100% - 18px))"
			></span>
		</div>
	{/if}
	<div class="fields">
		<span class="preview" aria-hidden="true"></span>
		{#key format}
			{#each fields as field (field.label)}
				<label class="field">
					<span class="prefix" aria-hidden="true">{field.label}</span>
					<input
						value={field.text}
						aria-label={field.name}
						inputmode={format === 'hex' ? 'text' : 'numeric'}
						autocomplete="off"
						spellcheck={false}
						onkeydown={(event) => {
							if (event.key === 'Enter') commitField(event, field.text, field.commit);
						}}
						onblur={(event) => commitField(event, field.text, field.commit)}
					/>
				</label>
			{/each}
		{/key}
	</div>
	<SegmentGroup.Root bind:value={format} aria-label="Format" class="formats">
		<SegmentGroup.Item value="hex">HEX</SegmentGroup.Item>
		<SegmentGroup.Item value="rgb">RGB</SegmentGroup.Item>
		<SegmentGroup.Item value="hsl">HSL</SegmentGroup.Item>
	</SegmentGroup.Root>
	{#if swatches.length > 0}
		<div class="swatches">
			{#each swatches as swatch (swatch)}
				{@const parsed = parseHexColor(swatch)}
				{#if parsed}
					<ColorDisk
						color={formatHexColor(parsed)}
						label={formatHexColor(parsed)}
						selected={formatHexColor(parsed) === formatHexColor(rgb)}
						onclick={() => setColor(parsed)}
					/>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-color-picker {
			--oito2-checker: repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 12px 12px;
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-md);
			box-sizing: border-box;
		}

		.area {
			position: relative;
			height: 150px;
			border-radius: var(--oito2-radius-medium);
			background:
				linear-gradient(to top, #000, transparent),
				linear-gradient(to right, #fff, transparent), var(--oito2-picker-hue);
			cursor: pointer;
			touch-action: none;
		}

		.channel {
			position: relative;
			height: 18px;
			cursor: pointer;
			touch-action: none;
		}

		.channel::before {
			content: '';
			position: absolute;
			inset: 3px 0;
			border-radius: 6px;
		}

		.hue::before {
			background: linear-gradient(
				to var(--oito2-picker-end, right),
				#f00,
				#ff0,
				#0f0,
				#0ff,
				#00f,
				#f0f,
				#f00
			);
		}

		.alpha::before {
			background:
				linear-gradient(
					to var(--oito2-picker-end, right),
					transparent,
					var(--oito2-picker-opaque)
				),
				var(--oito2-checker);
		}

		.oito2-color-picker:dir(rtl) {
			--oito2-picker-end: left;
		}

		.area:focus-visible,
		.channel:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 2px;
		}

		.channel:focus-visible {
			border-radius: 9px;
		}

		.thumb {
			position: absolute;
			top: 50%;
			width: 12px;
			height: 12px;
			border: 2px solid #fff;
			border-radius: 50%;
			background: var(--oito2-picker-opaque);
			box-shadow: 0 0 0 1px rgb(0 0 0 / 40%);
			translate: -50% -50%;
			pointer-events: none;
		}

		.channel .thumb {
			translate: -50% -50%;
		}

		.channel:dir(rtl) .thumb {
			translate: 50% -50%;
		}

		.hue .thumb {
			background: var(--oito2-picker-hue);
		}

		.fields {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-xs);
		}

		.preview {
			flex: none;
			width: 32px;
			height: 32px;
			box-sizing: border-box;
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-small);
			background:
				linear-gradient(var(--oito2-picker-color), var(--oito2-picker-color)),
				var(--oito2-checker);
		}

		.field {
			display: flex;
			flex: 1;
			align-items: center;
			min-width: 0;
			min-height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-sm);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
		}

		.field:focus-within {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		.prefix {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
		}

		.field input {
			flex: 1;
			min-width: 0;
			margin: 0;
			padding: 0 0 0 var(--oito2-space-xs);
			border: none;
			outline: none;
			background: none;
			color: var(--oito2-color-on-surface);
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-medium);
			font-variant-numeric: tabular-nums;
		}

		.oito2-color-picker > :global(.formats) {
			align-self: stretch;
		}

		.oito2-color-picker > :global(.formats > .oito2-segment) {
			flex: 1;
		}

		.swatches {
			display: flex;
			flex-wrap: wrap;
			gap: var(--oito2-space-xxs);
		}
	}
</style>
