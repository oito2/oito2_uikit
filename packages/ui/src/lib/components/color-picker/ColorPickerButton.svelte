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
  An outlined button with a color swatch and its hex value that opens a `ColorPicker` in a
  popover. Bind `value`. `label` names the button and the popover, such as what the color
  is for.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/Button.svelte';
	import * as Popover from '../popover/popover/index.js';
	import ColorPicker from './ColorPicker.svelte';
	import { parseHexColor, formatHexColor } from './color-math.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The color, as a hex string. */
		value?: string;
		/** Called with each new color. */
		onValueChange?: (value: string) => void;
		/** Whether the picker offers opacity. Defaults to true. */
		showAlpha?: boolean;
		/** Preset colors offered in the picker. */
		swatches?: readonly string[];
		/** The accessible name of the button and the popover. */
		label?: string;
	}

	let {
		value = $bindable('#3584E4'),
		onValueChange,
		showAlpha = true,
		swatches = [],
		label,
		disabled = false,
		...rest
	}: Props = $props();

	let parsed = $derived(parseHexColor(value));
	let hex = $derived(parsed ? formatHexColor(parsed, showAlpha) : value);
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outlined"
				{disabled}
				aria-label={label ? `${label}: ${hex}` : undefined}
				class="oito2-color-picker-button"
				{...rest}
				{...props}
			>
				<span class="content">
					<span class="swatch" style:--oito2-swatch={hex} aria-hidden="true"></span>
					{hex}
				</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content aria-label={label}>
		<ColorPicker bind:value {onValueChange} {showAlpha} {swatches} />
	</Popover.Content>
</Popover.Root>

<style>
	@layer oito2 {
		.swatch {
			display: inline-block;
			flex: none;
			vertical-align: middle;
			width: 18px;
			height: 18px;
			box-sizing: border-box;
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-check);
			background:
				linear-gradient(var(--oito2-swatch), var(--oito2-swatch)),
				repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 8px 8px;
		}

		.content {
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-sm);
		}

		:global(.oito2-color-picker-button) {
			font-variant-numeric: tabular-nums;
		}
	}
</style>
