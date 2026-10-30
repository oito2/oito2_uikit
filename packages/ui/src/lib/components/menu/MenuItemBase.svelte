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
  The row shared by menu items and select options (internal): an optional leading slot,
  the label, and an optional trailing slot (a shortcut or a chevron). Enter, Space and a
  click activate it; hovering focuses it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { focusElement } from '../../internal/focus.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'option';
		disabled?: boolean;
		/** Reserves the leading slot even when `leading` is empty, to align labels. */
		inset?: boolean;
		leading?: Snippet;
		trailing?: Snippet;
		/** The text typeahead matches. Defaults to the text content. */
		textValue?: string;
		onActivate?: (event: Event) => void;
		onHover?: () => void;
		onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown'];
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let {
		role,
		disabled = false,
		inset = false,
		leading,
		trailing,
		textValue,
		onActivate,
		onHover,
		onkeydown: ownKeyDown,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	function onkeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		ownKeyDown?.(event);
		if (event.defaultPrevented || event.target !== event.currentTarget || disabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onActivate?.(event);
		}
	}

	function onpointermove(event: PointerEvent) {
		if (event.pointerType !== 'mouse' || disabled) return;
		const item = event.currentTarget as HTMLElement;
		if (document.activeElement !== item) focusElement(item);
		onHover?.();
	}
</script>

<div
	bind:this={ref}
	{role}
	tabindex="-1"
	aria-disabled={disabled || undefined}
	class={['oito2-menu-item', className]}
	data-oito2-roving-item=""
	data-disabled={disabled ? '' : undefined}
	data-label={textValue}
	onclick={(event) => {
		if (!disabled) onActivate?.(event);
	}}
	{onkeydown}
	{onpointermove}
	{...rest}
>
	{#if leading || inset}<span class="leading">{@render leading?.()}</span>{/if}
	<span class="label" data-oito2-item-label>{@render children?.()}</span>
	{#if trailing}<span class="trailing">{@render trailing()}</span>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-menu-item {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			min-height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-md);
			border-radius: var(--oito2-radius-small);
			outline: none;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			cursor: pointer;
			user-select: none;
		}

		.oito2-menu-item::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-menu-item:not([data-disabled]):hover::before {
			opacity: 0.08;
		}

		.oito2-menu-item:not([data-disabled]):focus::before {
			opacity: 0.1;
		}

		.oito2-menu-item:not([data-disabled]):active::before {
			opacity: 0.1;
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.leading {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: var(--oito2-icon-size);
			color: var(--oito2-color-on-surface-variant);
		}

		[data-disabled] .leading {
			color: inherit;
		}

		.label {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.trailing {
			display: inline-flex;
			flex: none;
			align-items: center;
			margin-inline-start: var(--oito2-space-lg);
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
