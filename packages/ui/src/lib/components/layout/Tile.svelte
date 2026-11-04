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
  A row with optional `leading` content, a `title`, a `subtitle` and `trailing` content,
  as used in settings and property lists. With `onclick` the whole row is a button.
  Group tiles with `TileList`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** The primary text. */
		title?: string | Snippet;
		/** The secondary text, below the title. */
		subtitle?: string | Snippet;
		/** Content before the text, usually an icon. */
		leading?: Snippet;
		/** Content after the text, such as a switch or a value. */
		trailing?: Snippet;
		/** Whether the tile can't be used; disabled tiles are dimmed. */
		disabled?: boolean;
		/** The tile element. */
		ref?: HTMLElement | null;
	}

	let {
		title,
		subtitle,
		leading,
		trailing,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		...rest
	}: Props = $props();

	let interactive = $derived(onclick !== undefined && onclick !== null);
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<svelte:element
	this={interactive ? 'button' : 'div'}
	bind:this={ref}
	type={interactive ? 'button' : undefined}
	disabled={interactive ? disabled : undefined}
	aria-disabled={!interactive && disabled ? true : undefined}
	class={['oito2-tile', className]}
	data-interactive={interactive ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	{onclick}
	{...rest}
>
	{#if leading}<span class="leading">{@render leading()}</span>{/if}
	<span class="text">
		{#if title}<span class="title">{@render text(title)}</span>{/if}
		{#if subtitle}<span class="subtitle">{@render text(subtitle)}</span>{/if}
	</span>
	{#if trailing}<span class="trailing">{@render trailing()}</span>{/if}
</svelte:element>

<style>
	@layer oito2 {
		.oito2-tile {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--oito2-space-md);
			width: 100%;
			margin: 0;
			padding: var(--oito2-space-md) var(--oito2-space-lg);
			border: none;
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: inherit;
			text-align: start;
		}

		[data-interactive] {
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		[data-interactive]::before {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		[data-interactive]:not([data-disabled]):hover::before {
			opacity: 0.04;
		}

		[data-interactive]:not([data-disabled]):active::before {
			opacity: 0.1;
		}

		.oito2-tile:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: calc(-1 * var(--oito2-size-focus-border-width));
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.leading {
			display: inline-flex;
			flex: none;
			align-items: center;
			color: var(--oito2-color-on-surface-variant);
		}

		.trailing {
			display: inline-flex;
			flex: none;
			align-items: center;
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
		}

		.title {
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
		}

		.subtitle {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		[data-disabled] :is(.leading, .subtitle) {
			color: inherit;
		}
	}
</style>
