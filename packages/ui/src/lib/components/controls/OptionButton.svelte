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
  A small square outlined button for secondary options, such as the buttons next to a
  list. It shows an `icon`, custom children or, with `color`, a color swatch. `label`
  names it for assistive technologies and is its tooltip; it is required for an icon or
  a swatch.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../icon.js';
	import { mergeProps } from '../../internal/merge-props.js';
	import * as Tooltip from '../tooltip/index.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'color'> {
		/** The icon. */
		icon?: IconComponent;
		/** A CSS color shown as a swatch instead of an icon. */
		color?: string;
		/** The accessible name and tooltip. */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** Custom content instead of the icon or swatch. */
		children?: Snippet;
	}

	let {
		icon: Icon,
		color,
		label,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<Tooltip.Root disabled={!label}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				type="button"
				aria-label={label}
				{disabled}
				class={['oito2-option-button', className]}
				data-disabled={disabled ? '' : undefined}
				{...mergeProps(rest, props)}
			>
				{#if children}
					{@render children()}
				{:else if color !== undefined}
					<span class="swatch" style:background={color}></span>
				{:else if Icon}
					<Icon size={20} aria-hidden="true" class="oito2-option-button-icon" />
				{/if}
			</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>{label}</Tooltip.Content>
</Tooltip.Root>

<style>
	@layer oito2 {
		.oito2-option-button {
			position: relative;
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: var(--oito2-size-button-height);
			height: var(--oito2-size-button-height);
			margin: 0;
			padding: 0;
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-primary-text);
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-option-button::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		.oito2-option-button:not(:disabled):hover::before {
			opacity: 0.08;
		}

		.oito2-option-button:not(:disabled):active::before {
			opacity: 0.1;
		}

		.oito2-option-button:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-option-button:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.oito2-option-button :global(.oito2-option-button-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.swatch {
			width: var(--oito2-size-icon);
			height: var(--oito2-size-icon);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-check);
		}

		.oito2-option-button:disabled .swatch {
			opacity: 0.38;
		}
	}
</style>
