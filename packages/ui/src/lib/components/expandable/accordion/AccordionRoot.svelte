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
  A bordered stack of sections, each with a header that expands its content. Unless
  `multiple`, opening a section closes the others, so at most one is open. Bind `value`
  (the values of the open items), or set `defaultValue` and listen to `onValueChange`;
  `onItemOpenChange` reports each item that opens or closes. Compose it with
  `Accordion.Item`, `Accordion.Trigger` and `Accordion.Content`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AccordionState, setAccordion } from '../accordion-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The values of the open items. */
		value?: readonly string[];
		/** The open items of an uncontrolled accordion; only the first unless `multiple`. */
		defaultValue?: readonly string[];
		/** Called with the values of the open items after each change. */
		onValueChange?: (value: readonly string[]) => void;
		/**
		 * Called with each item that opens or closes and whether it is now open, including
		 * the items closed by opening another, which are reported first.
		 */
		onItemOpenChange?: (value: string, open: boolean) => void;
		/** Whether several items can be open at once. Defaults to false. */
		multiple?: boolean;
		/** Whether 1-pixel dividers separate the items. Defaults to true. */
		dividers?: boolean;
		/** Whether every item is disabled. */
		disabled?: boolean;
		/** The accordion element. */
		ref?: HTMLDivElement | null;
		/** The items. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = [],
		onValueChange,
		onItemOpenChange,
		multiple = false,
		dividers = true,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	setAccordion(
		new AccordionState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			multiple: () => multiple,
			disabled: () => disabled,
			onItemOpenChange: () => onItemOpenChange
		})
	);
</script>

<div
	bind:this={ref}
	class={['oito2-accordion', className]}
	data-dividers={dividers ? '' : undefined}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-accordion {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
		}

		[data-dividers] > :global(* + *) {
			border-top: 1px solid var(--oito2-color-outline-variant);
		}
	}
</style>
