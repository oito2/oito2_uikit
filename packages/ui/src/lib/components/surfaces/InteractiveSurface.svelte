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
  Internal: the surface of `SelectableContainer` and `Banner`. A button when it has
  `onclick`; selection shows as a tinted fill with a 2-pixel border in the text-safe
  primary tone, and keyboard focus as a ring outside the border.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Whether the surface is selected. */
		selected: boolean;
		/** Whether the surface can't be used. */
		disabled: boolean;
		/** The kind of surface, which sets its border and padding. */
		kind: 'selectable' | 'banner';
		/** Called with true when the pointer enters and false when it leaves. */
		onHoverChange?: (hovered: boolean) => void;
		/** The surface element. */
		ref?: HTMLElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		selected,
		disabled,
		kind,
		onHoverChange,
		ref = $bindable(null),
		class: className,
		onclick,
		onpointerenter,
		onpointerleave,
		children,
		...rest
	}: Props = $props();

	let interactive = $derived(onclick !== undefined && onclick !== null);
</script>

<svelte:element
	this={interactive ? 'button' : 'div'}
	bind:this={ref}
	type={interactive ? 'button' : undefined}
	disabled={interactive ? disabled : undefined}
	aria-pressed={interactive ? selected : undefined}
	class={['oito2-interactive-surface', className]}
	data-kind={kind}
	data-interactive={interactive ? '' : undefined}
	data-selected={selected ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	{onclick}
	onpointerenter={(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) => {
		onpointerenter?.(event);
		onHoverChange?.(true);
	}}
	onpointerleave={(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) => {
		onpointerleave?.(event);
		onHoverChange?.(false);
	}}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	@layer oito2 {
		.oito2-interactive-surface {
			--oito2-surface-fill: var(--oito2-surface-color, transparent);
			display: block;
			width: auto;
			margin: 0;
			padding: var(--oito2-space-sm);
			border: 1px solid transparent;
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-surface-fill);
			color: var(--oito2-color-on-surface);
			font: inherit;
			text-align: start;
			transition:
				border-color 120ms,
				background-color 120ms;
		}

		[data-kind='banner'] {
			--oito2-surface-fill: var(--oito2-surface-color, var(--oito2-color-surface));
			padding: var(--oito2-space-lg);
			border-color: var(--oito2-color-outline-variant);
		}

		[data-interactive] {
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		[data-kind='selectable'][data-interactive]:not([data-disabled]):hover {
			border-color: var(--oito2-color-outline-variant);
		}

		[data-kind='banner'][data-interactive]:not([data-disabled]):hover {
			border-color: var(--oito2-color-outline);
		}

		.oito2-interactive-surface[data-selected] {
			border: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			background:
				linear-gradient(
					var(
						--oito2-surface-selection,
						color-mix(in srgb, var(--oito2-color-primary) 12%, transparent)
					),
					var(
						--oito2-surface-selection,
						color-mix(in srgb, var(--oito2-color-primary) 12%, transparent)
					)
				),
				var(--oito2-surface-fill, var(--oito2-color-surface));
		}

		[data-kind='selectable'][data-selected] {
			--oito2-surface-fill: var(--oito2-surface-color, var(--oito2-color-surface));
		}

		.oito2-interactive-surface:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		[data-disabled] {
			opacity: 0.38;
			cursor: default;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-interactive-surface {
				transition: none;
			}
		}
	}
</style>
