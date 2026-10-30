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
  A row of a list: optional `leading` and `trailing` content around a `title` and an
  optional `subtitle`. It is 40 pixels high with a pointer (52 with a subtitle) and 56 or
  72 with touch. With `onclick` it is a button, with `href` a link, and otherwise static.
  `selected` fills it with the secondary container color; `square` drops the rounded
  corners.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** The main line. */
		title?: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** Content before the text, such as an icon or an avatar. */
		leading?: Snippet;
		/** Content after the text, such as a value or a chevron. */
		trailing?: Snippet;
		/** Whether the row is selected. */
		selected?: boolean;
		/** Whether the row can't be used. */
		disabled?: boolean;
		/** Whether the text is centered. */
		centerTitle?: boolean;
		/** Whether the row has square corners, for edge-to-edge lists. */
		square?: boolean;
		/** Makes the row a link to this URL. */
		href?: string;
		/** The row element. */
		ref?: HTMLElement | null;
	}

	let {
		title,
		subtitle,
		leading,
		trailing,
		selected = false,
		disabled = false,
		centerTitle = false,
		square = false,
		href,
		ref = $bindable(null),
		class: className,
		onclick,
		...rest
	}: Props = $props();

	let tag = $derived(href !== undefined && !disabled ? 'a' : onclick ? 'button' : 'div');
	// The attributes that depend on the element: a link's URL, a button's type and state.
	let elementProps: Record<string, unknown> = $derived(
		tag === 'a'
			? { href }
			: tag === 'button'
				? { type: 'button', disabled }
				: { 'aria-disabled': disabled || undefined }
	);
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<svelte:element
	this={tag}
	bind:this={ref}
	{...elementProps}
	aria-current={selected && tag === 'a' ? 'page' : undefined}
	class={['oito2-list-tile', className]}
	data-selected={selected ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-interactive={tag === 'div' ? undefined : ''}
	data-square={square ? '' : undefined}
	data-two-line={subtitle ? '' : undefined}
	data-center={centerTitle ? '' : undefined}
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
		.oito2-list-tile {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--oito2-space-md);
			box-sizing: border-box;
			width: 100%;
			min-height: var(--oito2-list-tile-height);
			margin: 0;
			padding: var(--oito2-space-xs) var(--oito2-space-md);
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: inherit;
			text-align: start;
			text-decoration: none;
			-webkit-tap-highlight-color: transparent;
		}

		[data-two-line] {
			min-height: var(--oito2-list-tile-two-line-height);
		}

		[data-square] {
			border-radius: 0;
		}

		[data-interactive] {
			cursor: pointer;
		}

		.oito2-list-tile::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		[data-interactive]:not([data-disabled]):hover::before {
			opacity: 0.04;
		}

		.oito2-list-tile:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		[data-selected] {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.leading,
		.trailing {
			display: inline-flex;
			flex: none;
			align-items: center;
			color: var(--oito2-color-on-surface-variant);
		}

		[data-selected] :is(.leading, .trailing, .subtitle) {
			color: var(--oito2-color-on-secondary-container);
		}

		[data-disabled] :is(.leading, .trailing, .subtitle) {
			color: inherit;
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
		}

		[data-center] .text {
			align-items: center;
			text-align: center;
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
	}
</style>
