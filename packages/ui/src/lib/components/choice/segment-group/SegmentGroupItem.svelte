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
  A segment of a `SegmentGroup.Root` that selects `value`: a label with an optional
  `icon` before it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../../icon.js';
	import { useSegmentGroup } from './segment-group-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The value the segment selects. */
		value: string;
		/** An icon before the label. */
		icon?: IconComponent;
		/** The segment element. */
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

	const group = useSegmentGroup();
	let selected = $derived(group.value === value);
	let off = $derived(disabled || group.disabled);
</script>

<button
	bind:this={ref}
	type="button"
	role="radio"
	aria-checked={selected}
	disabled={off}
	class={['oito2-segment', className]}
	data-oito2-roving-item=""
	data-value={value}
	data-state={selected ? 'active' : 'inactive'}
	data-disabled={off ? '' : undefined}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) group.select(value);
	}}
	{...rest}
>
	{#if Icon}<Icon size={20} aria-hidden="true" class="oito2-segment-icon" />{/if}
	{@render children?.()}
</button>

<style>
	@layer oito2 {
		.oito2-segment {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-sm);
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: none;
			border-radius: var(--oito2-radius-small);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			font-weight: 500;
			letter-spacing: var(--oito2-type-body-medium-tracking);
			white-space: nowrap;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		:global(.oito2-segment-group[data-orientation='vertical']) > .oito2-segment {
			justify-content: flex-start;
		}

		.oito2-segment[data-state='active'] {
			color: var(--oito2-color-primary-text);
		}

		.oito2-segment:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-segment:disabled {
			opacity: 0.5;
			cursor: default;
		}

		.oito2-segment :global(.oito2-segment-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}
	}
</style>
