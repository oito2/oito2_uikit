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
  A QR code of `data` in SVG, painted in `color` on `background` with the standard
  four-module quiet zone.

  The defaults are black on white, which every scanner reads; custom colors need strong
  contrast, with `color` darker than `background`. A `centerImage`, such as a logo, covers
  the middle of the modules; the error level is then `high`, which recovers the most
  covered modules, so the code still reads. When `data` doesn't fit, `error` or a localized
  message shows instead.
-->
<script lang="ts">
	import { useLocale } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { qrModules, qrPath, qrQuietZone, type QrErrorLevel, type QrModules } from './qr.js';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
		/** The encoded text, such as a link. */
		data: string;
		/** The width and height in pixels, quiet zone included. Defaults to 160. */
		size?: number;
		/** The error correction level; ignored with `centerImage`, which uses `high`. Defaults to `medium`. */
		errorLevel?: QrErrorLevel;
		/** The dark module color. Defaults to black. */
		color?: string;
		/** The light module and quiet zone color. Defaults to white. */
		background?: string;
		/** Whether dark modules are drawn as rounded squares. */
		rounded?: boolean;
		/** The URL of an image drawn in the middle, such as a logo. */
		centerImage?: string | null;
		/** The share of the module area's width cleared for the center image, above 0 and up to 0.3. Defaults to 0.22. */
		centerImageFraction?: number;
		/** The accessible name; defaults to the localized "QR code". */
		label?: string;
		/** What shows when `data` doesn't fit in a QR code. */
		error?: Snippet;
		/** The element. */
		ref?: SVGSVGElement | null;
	}

	let {
		data,
		size = 160,
		errorLevel = 'medium',
		color = '#000000',
		background = '#FFFFFF',
		rounded = false,
		centerImage = null,
		centerImageFraction = 0.22,
		label,
		error,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();

	let fraction = $derived(Math.min(0.3, Math.max(0.01, centerImageFraction)));
	let qr: QrModules | null = $derived.by(() => {
		try {
			return qrModules(data, centerImage ? 'high' : errorLevel);
		} catch {
			return null;
		}
	});
	let extent = $derived(qr ? qr.moduleCount + qrQuietZone * 2 : 0);
	let path = $derived(qr ? qrPath(qr, { rounded, hole: centerImage ? fraction : 0 }) : '');
	let imageSize = $derived(qr ? qr.moduleCount * fraction * 0.86 : 0);
</script>

{#if qr}
	<svg
		bind:this={ref}
		role="img"
		aria-label={label ?? locale.strings.qrCode}
		viewBox="0 0 {extent} {extent}"
		width={size}
		height={size}
		shape-rendering={rounded ? undefined : 'crispEdges'}
		class={['oito2-qr-code', className]}
		{...rest}
	>
		<rect width={extent} height={extent} fill={background} />
		<path d={path} fill={color} />
		{#if centerImage}
			<image
				href={centerImage}
				x={(extent - imageSize) / 2}
				y={(extent - imageSize) / 2}
				width={imageSize}
				height={imageSize}
				preserveAspectRatio="xMidYMid meet"
			/>
		{/if}
	</svg>
{:else if error}
	{@render error()}
{:else}
	<div class="oito2-qr-code-error" style:width="{size}px" style:height="{size}px" role="alert">
		{locale.strings.qrTooLong}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-qr-code {
			display: block;
			flex: none;
		}

		.oito2-qr-code-error {
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			padding: var(--oito2-space-sm);
			color: var(--oito2-color-on-surface);
			text-align: center;
		}
	}
</style>
