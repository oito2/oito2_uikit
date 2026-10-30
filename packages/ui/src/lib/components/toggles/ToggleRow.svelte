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
  The clickable row of a toggle with a label (internal): a control mark, a title and an
  optional subtitle in one button, with the focus ring around the whole row.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'title' | 'children'> {
		control: Snippet;
		title?: string | Snippet;
		subtitle?: string | Snippet;
		controlAtEnd?: boolean;
		ref?: HTMLButtonElement | null;
	}

	let {
		control,
		title,
		subtitle,
		controlAtEnd = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<button
	bind:this={ref}
	type="button"
	{disabled}
	class={['oito2-toggle-row', 'oito2-toggle-host', className]}
	data-disabled={disabled ? '' : undefined}
	data-control-at-end={controlAtEnd ? '' : undefined}
	{...rest}
>
	<span class="control">{@render control()}</span>
	<span class="text">
		{#if title}<span class="title">{@render text(title)}</span>{/if}
		{#if subtitle}<span class="subtitle">{@render text(subtitle)}</span>{/if}
	</span>
</button>

<style>
	@layer oito2 {
		.oito2-toggle-row {
			position: relative;
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			max-width: 100%;
			margin: 0;
			padding: var(--oito2-space-xxs) var(--oito2-space-xs);
			border: none;
			border-radius: var(--oito2-radius-small);
			background: none;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			text-align: start;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-toggle-row[data-control-at-end] {
			flex-direction: row-reverse;
			justify-content: flex-end;
		}

		.oito2-toggle-row::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-toggle-row:not(:disabled):hover::before {
			opacity: 0.04;
		}

		.oito2-toggle-row:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-toggle-row:disabled {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.oito2-toggle-row:disabled .control {
			opacity: 0.38;
		}

		.control {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			min-width: var(--oito2-toggle-target);
			min-height: var(--oito2-toggle-target);
		}

		.text {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		.subtitle {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}

		.oito2-toggle-row:disabled .subtitle {
			color: inherit;
		}
	}
</style>
