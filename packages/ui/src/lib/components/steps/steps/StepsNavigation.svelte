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
  Internal: a button of a `Steps.Root` that moves to the previous or the next step.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import { useSteps } from '../steps-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** Which way the button moves. */
		direction: 'previous' | 'next';
		/** The label when there are no children. */
		label: string;
		/** The button variant. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** Custom button content. */
		children?: Snippet;
	}

	let {
		direction,
		label,
		variant,
		disabled = false,
		ref = $bindable(null),
		onclick,
		children,
		...rest
	}: Props = $props();

	const steps = useSteps();
	let blocked = $derived(
		direction === 'previous' ? steps.current <= 0 : steps.current >= steps.count
	);
</script>

<Button
	bind:ref
	{variant}
	disabled={disabled || blocked}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented)
			steps.goTo(steps.current + (direction === 'previous' ? -1 : 1));
	}}
	{...rest}
>
	{#if children}{@render children()}{:else}{label}{/if}
</Button>
