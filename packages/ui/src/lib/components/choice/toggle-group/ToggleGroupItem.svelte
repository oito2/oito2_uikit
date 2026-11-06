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
  A button of a `ToggleGroup.Root` that turns `value` on and off. Give it an `icon`, a
  label as children, or both; `label` names an icon-only item and is its tooltip.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../../icon.js';
	import { mergeProps } from '../../../internal/merge-props.js';
	import * as Tooltip from '../../tooltip/index.js';
	import { useToggleGroup } from './toggle-group-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The value the item turns on and off. */
		value: string;
		/** An icon. */
		icon?: IconComponent;
		/** The accessible name and tooltip, for an item that shows only an icon. */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** The label. */
		children?: Snippet;
	}

	let {
		value,
		icon: Icon,
		label,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		children,
		...rest
	}: Props = $props();

	const group = useToggleGroup();
	let on = $derived(group.value.includes(value));
	let off = $derived(disabled || group.disabled);
</script>

<Tooltip.Root disabled={!label}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				type="button"
				aria-pressed={on}
				aria-label={label}
				disabled={off}
				class={['oito2-toggle-group-item', className]}
				data-oito2-roving-item=""
				data-state={on ? 'on' : 'off'}
				data-disabled={off ? '' : undefined}
				onclick={(event) => {
					onclick?.(event);
					if (!event.defaultPrevented) group.toggle(value);
				}}
				{...mergeProps(rest, props)}
			>
				{#if Icon}<Icon size={20} aria-hidden="true" class="oito2-toggle-group-icon" />{/if}
				{#if children}<span>{@render children()}</span>{/if}
			</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>{label}</Tooltip.Content>
</Tooltip.Root>

<style>
	@layer oito2 {
		.oito2-toggle-group-item {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-sm);
			min-width: var(--oito2-control-height);
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-sm);
			border: none;
			border-radius: var(--oito2-radius-check);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			font-weight: 500;
			letter-spacing: var(--oito2-type-body-medium-tracking);
			cursor: pointer;
			transition:
				background-color 100ms,
				box-shadow 100ms;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-toggle-group-item:not(:disabled):hover {
			background: var(--oito2-color-surface-container-highest);
		}

		.oito2-toggle-group-item[data-state='on'] {
			background: var(--oito2-color-surface);
			box-shadow: 0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 12%, transparent);
		}

		.oito2-toggle-group-item:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-toggle-group-item:disabled {
			opacity: 0.5;
			cursor: default;
		}

		.oito2-toggle-group-item :global(.oito2-toggle-group-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-toggle-group-item {
				transition: none;
			}
		}
	}
</style>
