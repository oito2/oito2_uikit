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
  A tab of a `Tabs.List`, identified by `value`: a label with an optional `icon` before
  it. A label wider than the tab ends with an ellipsis.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../../icon.js';
	import { useTabs } from '../tabs-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The value that identifies the tab. */
		value: string;
		/** An icon before the label. */
		icon?: IconComponent;
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** The label. */
		children?: Snippet;
	}

	let {
		value,
		icon: Icon,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		children,
		...rest
	}: Props = $props();

	const tabs = useTabs();
	let selected = $derived(tabs.value === value);
</script>

<button
	bind:this={ref}
	type="button"
	role="tab"
	id={tabs.triggerId(value)}
	aria-selected={selected}
	aria-controls={selected && tabs.hasContent(value) ? tabs.contentId(value) : undefined}
	{disabled}
	class={['oito2-tabs-trigger', className]}
	data-oito2-roving-item=""
	data-value={value}
	data-state={selected ? 'active' : 'inactive'}
	data-disabled={disabled ? '' : undefined}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) tabs.select(value);
	}}
	{...rest}
>
	{#if Icon}<Icon size={20} aria-hidden="true" class="oito2-tabs-trigger-icon" />{/if}
	<span class="label">{@render children?.()}</span>
</button>

<style>
	@layer oito2 {
		.oito2-tabs-trigger {
			position: relative;
			display: inline-flex;
			flex: 1 1 0;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-sm);
			min-width: 0;
			height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			white-space: nowrap;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		:global([data-scrollable]) > .oito2-tabs-trigger {
			flex: none;
		}

		:global(.oito2-tabs-list[data-orientation='vertical']) > .oito2-tabs-trigger {
			flex: none;
			justify-content: flex-start;
		}

		.oito2-tabs-trigger::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-tabs-trigger:not(:disabled):hover::after {
			opacity: 0.06;
		}

		.oito2-tabs-trigger:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-tabs-trigger[data-state='active'] {
			color: var(--oito2-color-on-secondary-container);
		}

		:global(.oito2-tabs-list[data-variant='subtle'])
			> .oito2-tabs-trigger[data-state='active'] {
			color: var(--oito2-color-on-primary-tint);
		}

		.oito2-tabs-trigger:disabled {
			opacity: 0.38;
			cursor: default;
		}

		.oito2-tabs-trigger :global(.oito2-tabs-trigger-icon) {
			flex: none;
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.label {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
