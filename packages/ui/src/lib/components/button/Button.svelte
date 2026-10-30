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
  A button with the five Material 3 emphasis levels: `filled` (the default, for the main
  action), `tonal`, `outlined`, `text` and `elevated`. It is 34 pixels high with a pointer
  and 40 with touch, with an optional leading `icon` and `trailing` content. With `href` it
  renders a link that looks like a button.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../icon.js';

	/** The emphasis of a button. */
	type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis. Defaults to `filled`. */
		variant?: Variant;
		/** An icon before the label. */
		icon?: IconComponent;
		/** Content after the label, such as a chevron. */
		trailing?: Snippet;
		/** Renders a link to this URL instead of a button. */
		href?: string;
		/** Where a link opens. */
		target?: HTMLAnchorAttributes['target'];
		/** The button or link element. */
		ref?: HTMLElement | null;
		/** The label. */
		children?: Snippet;
	}

	let {
		variant = 'filled',
		icon: Icon,
		trailing,
		href,
		target,
		ref = $bindable(null),
		disabled = false,
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

{#snippet content()}
	{#if Icon}<Icon size={20} aria-hidden="true" class="oito2-button-icon" />{/if}
	{#if children}<span class="oito2-button-label">{@render children()}</span>{/if}
	{@render trailing?.()}
{/snippet}

{#if href !== undefined && !disabled}
	<a
		bind:this={ref}
		{href}
		{target}
		class={['oito2-button', className]}
		data-variant={variant}
		{...rest as HTMLAnchorAttributes}
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={ref}
		{type}
		{disabled}
		class={['oito2-button', className]}
		data-variant={variant}
		data-disabled={disabled ? '' : undefined}
		{...rest}
	>
		{@render content()}
	</button>
{/if}

<style>
	@layer oito2 {
		.oito2-button {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			min-width: 64px;
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-lg);
			border: 1px solid transparent;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-primary-text);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			text-decoration: none;
			white-space: nowrap;
			cursor: pointer;
			user-select: none;
			-webkit-tap-highlight-color: transparent;
			transition: box-shadow 150ms ease-in-out;
		}

		/* The state layer: the foreground color at 8% on hover and 10% while pressed. */
		.oito2-button::before {
			content: '';
			position: absolute;
			inset: -1px;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		.oito2-button:not(:disabled):hover::before {
			opacity: 0.08;
		}

		.oito2-button:not(:disabled):active::before {
			opacity: 0.1;
		}

		.oito2-button:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-button:disabled {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.oito2-button :global(.oito2-button-icon) {
			flex: none;
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		[data-variant='filled'] {
			background: var(--oito2-color-primary);
			color: var(--oito2-color-on-primary);
		}

		[data-variant='tonal'] {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		[data-variant='elevated'] {
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
		}

		[data-variant='elevated']:not(:disabled):hover {
			box-shadow:
				0 1px 3px 1px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
		}

		[data-variant='outlined'] {
			border-color: var(--oito2-color-outline);
		}

		/* The focus ring replaces the outline border. */
		[data-variant='outlined']:focus-visible {
			border-color: transparent;
		}

		[data-variant='text'] {
			padding: 0 var(--oito2-space-md);
		}

		:is([data-variant='filled'], [data-variant='tonal'], [data-variant='elevated']):disabled {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
		}

		[data-variant='outlined']:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
		}
	}
</style>
