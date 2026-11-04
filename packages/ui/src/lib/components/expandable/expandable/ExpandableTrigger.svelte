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
  The header of an expandable section: a full-width button that shows or hides the
  content, with a chevron that turns when open. With `headingLevel` the button sits in a
  heading of that level, as the headers of an accordion do.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useExpandable, type ExpandButtonPosition } from '../expandable-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** Where the chevron sits. Defaults to `end`. */
		iconPosition?: ExpandButtonPosition;
		/** Wraps the button in a heading of this level. */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** The header content. */
		children?: Snippet;
	}

	let {
		iconPosition = 'end',
		headingLevel,
		ref = $bindable(null),
		class: className,
		onclick,
		children,
		...rest
	}: Props = $props();

	const expandable = useExpandable();
</script>

{#snippet button()}
	<button
		bind:this={ref}
		type="button"
		id={expandable.triggerId}
		aria-expanded={expandable.open}
		aria-controls={expandable.contentId}
		disabled={expandable.disabled}
		class={['oito2-expandable-trigger', className]}
		data-state={expandable.open ? 'open' : 'closed'}
		data-icon-position={iconPosition}
		data-disabled={expandable.disabled ? '' : undefined}
		onclick={(event) => {
			onclick?.(event);
			if (!event.defaultPrevented) expandable.toggle();
		}}
		{...rest}
	>
		<span class="label">{@render children?.()}</span>
		<ChevronDown size={20} aria-hidden="true" class="oito2-expandable-chevron" />
	</button>
{/snippet}

{#if headingLevel}
	<div role="heading" aria-level={headingLevel} class="oito2-expandable-heading">
		{@render button()}
	</div>
{:else}
	{@render button()}
{/if}

<style>
	@layer oito2 {
		.oito2-expandable-heading {
			margin: 0;
		}

		.oito2-expandable-trigger {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			width: 100%;
			margin: 0;
			padding: var(--oito2-space-xs) 0;
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
			text-align: start;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-expandable-trigger::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-expandable-trigger:not(:disabled):hover::before {
			opacity: 0.04;
		}

		.oito2-expandable-trigger:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-expandable-trigger:disabled {
			opacity: 0.38;
			cursor: default;
		}

		[data-icon-position='start'] {
			flex-direction: row-reverse;
		}

		.label {
			flex: 1;
			min-width: 0;
		}

		.oito2-expandable-trigger :global(.oito2-expandable-chevron) {
			flex: none;
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
			color: var(--oito2-color-on-surface-variant);
			transition: rotate 200ms;
		}

		[data-state='open'] :global(.oito2-expandable-chevron) {
			rotate: 180deg;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-expandable-trigger :global(.oito2-expandable-chevron) {
				transition: none;
			}
		}
	}
</style>
