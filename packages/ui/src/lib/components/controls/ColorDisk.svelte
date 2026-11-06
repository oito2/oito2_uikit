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
  A round color swatch that can be selected, as in accent color pickers. A ring in the
  disk's own hue surrounds it while `selected`, and a fainter one while the pointer
  hovers it or it has keyboard focus. A disk with less than 3:1 contrast with the surface
  gets a thin outline, so it doesn't blend into the background. `label` names it for
  assistive technologies and is its tooltip.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { colorToHex, lerpColor, toColorValue } from '../../foundation/color.js';
	import { Contrast, ensureContrastColor } from '../../foundation/contrast.js';
	import { mergeProps } from '../../internal/merge-props.js';
	import { useTheme } from '../../theme/theme-context.js';
	import * as Tooltip from '../tooltip/index.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'color'> {
		/** The swatch color, as a hex string. */
		color: string;
		/** The color name, for assistive technologies and the tooltip. */
		label: string;
		/** Whether this color is the selected one. */
		selected?: boolean;
		/** The disk diameter without its ring, in pixels. Defaults to 20. */
		size?: number;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		color,
		label,
		selected = false,
		size = 20,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const theme = useTheme();
	let surface = $derived(theme.current.colorScheme.surface);
	// A color that doesn't parse shows as an empty disk instead of failing to render.
	let value = $derived.by(() => {
		try {
			return toColorValue(color);
		} catch {
			return { r: 0, g: 0, b: 0, a: 0 };
		}
	});
	// The ring keeps the disk's hue, adjusted to stand out from the surface.
	let ring = $derived(
		colorToHex(ensureContrastColor({ ...value, a: 1 }, [surface], Contrast.nonTextAA))
	);
	let blends = $derived(
		Contrast.ratio(colorToHex(lerpColor(surface, { ...value, a: 1 }, value.a)), surface) <
			Contrast.nonTextAA
	);
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				type="button"
				aria-label={label}
				aria-pressed={selected}
				{disabled}
				class={['oito2-color-disk', className]}
				data-selected={selected ? '' : undefined}
				data-blends={blends ? '' : undefined}
				style:--oito2-color-disk-color={color}
				style:--oito2-color-disk-ring={ring}
				style:--oito2-color-disk-alpha={value.a}
				style:--oito2-color-disk-size="{size}px"
				{...mergeProps(rest, props)}
			>
				<span class="disk"></span>
			</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>{label}</Tooltip.Content>
</Tooltip.Root>

<style>
	@layer oito2 {
		.oito2-color-disk {
			--oito2-color-disk-ring-alpha: 0;
			display: inline-flex;
			flex: none;
			box-sizing: content-box;
			width: var(--oito2-color-disk-size);
			height: var(--oito2-color-disk-size);
			margin: 0;
			padding: 2px;
			border: var(--oito2-size-focus-border-width) solid
				color-mix(
					in srgb,
					var(--oito2-color-disk-ring)
						calc(
							var(--oito2-color-disk-ring-alpha) * var(--oito2-color-disk-alpha) *
								100%
						),
					transparent
				);
			border-radius: 50%;
			background: none;
			cursor: pointer;
			outline: none;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-color-disk:not(:disabled):hover,
		.oito2-color-disk:focus-visible {
			--oito2-color-disk-ring-alpha: 0.5;
		}

		[data-selected],
		[data-selected]:not(:disabled):hover,
		[data-selected]:focus-visible {
			--oito2-color-disk-ring-alpha: 1;
		}

		.oito2-color-disk:disabled {
			opacity: 0.38;
			cursor: default;
		}

		.disk {
			flex: 1;
			border-radius: 50%;
			background: var(--oito2-color-disk-color);
		}

		[data-blends] .disk {
			box-shadow: inset 0 0 0 1px var(--oito2-color-outline-variant);
		}
	}
</style>
