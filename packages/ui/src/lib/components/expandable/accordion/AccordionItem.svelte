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
  One section of an `Accordion.Root`, identified by `value`. Holds an
  `Accordion.Trigger` and an `Accordion.Content`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useAccordion } from '../accordion-state.svelte.js';
	import { ExpandableState, setExpandable } from '../expandable-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value that identifies the item in the accordion's `value`. */
		value: string;
		/** Whether the item can't be opened or closed. */
		disabled?: boolean;
		/** The item element. */
		ref?: HTMLDivElement | null;
		/** The trigger and the content. */
		children?: Snippet;
	}

	let {
		value,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const id = $props.id();
	const accordion = useAccordion();
	const state = setExpandable(
		new ExpandableState({
			id,
			open: () => accordion.isOpen(value),
			setOpen: (open) => accordion.setOpen(value, open),
			disabled: () => disabled || accordion.disabled
		})
	);
</script>

<div
	bind:this={ref}
	class={['oito2-accordion-item', className]}
	data-state={state.open ? 'open' : 'closed'}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-accordion-item {
			display: flex;
			flex-direction: column;
			padding: var(--oito2-space-sm) var(--oito2-space-md);
		}
	}
</style>
