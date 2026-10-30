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
  A floating action button for the main action of a screen: a 56-pixel square in the
  primary container color with a raised shadow, or a wider pill with a label (extended)
  when it has `children`. `label` names an icon-only button.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../icon.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The icon. */
		icon?: IconComponent;
		/** The accessible name of an icon-only button. */
		label?: string;
		/** The size of an icon-only button. Defaults to `medium` (56 pixels). */
		size?: 'small' | 'medium' | 'large';
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** The label of an extended button. */
		children?: Snippet;
	}

	let {
		icon: Icon,
		label,
		size = 'medium',
		ref = $bindable(null),
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<button
	bind:this={ref}
	{type}
	aria-label={children ? undefined : label}
	title={children ? undefined : label}
	class={['oito2-fab', className]}
	data-size={size}
	data-extended={children ? '' : undefined}
	{...rest}
>
	{#if Icon}<Icon size={24} aria-hidden="true" />{/if}
	{#if children}<span>{@render children()}</span>{/if}
</button>

<style>
	@layer oito2 {
		.oito2-fab {
			--size: 56px;
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-md);
			box-sizing: border-box;
			min-width: var(--size);
			height: var(--size);
			margin: 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-primary-container);
			color: var(--oito2-color-on-primary-container);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			cursor: pointer;
			box-shadow:
				0 1px 3px 1px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
			transition: box-shadow 150ms ease-in-out;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-fab[data-size='small'] {
			--size: 40px;
			border-radius: var(--oito2-radius-medium);
		}

		.oito2-fab[data-size='large'] {
			--size: 96px;
			border-radius: 28px;
		}

		.oito2-fab[data-extended] {
			padding: 0 var(--oito2-space-lg);
		}

		.oito2-fab::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		.oito2-fab:hover,
		.oito2-fab:focus-visible {
			box-shadow:
				0 2px 6px 2px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
		}

		.oito2-fab:hover::before {
			opacity: 0.08;
		}

		.oito2-fab:active::before {
			opacity: 0.1;
		}

		.oito2-fab:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-fab:disabled {
			box-shadow: none;
			background: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}
	}
</style>
