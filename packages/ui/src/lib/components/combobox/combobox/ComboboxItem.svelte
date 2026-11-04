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
  A suggestion of a combobox list, identified by `value`. The pointer highlights it and a
  click picks it, without taking focus from the input. The children replace `label`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCombobox } from '../combobox-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the item in the collection. */
		value: string;
		/** The text shown when there are no children. */
		label?: string;
		/** Custom content. */
		children?: Snippet;
	}

	let { value, label, children, class: className, ...rest }: Props = $props();

	const combobox = useCombobox();
	let highlighted = $derived(combobox.highlighted === value);
	let disabled = $derived(!combobox.collection.isEnabled(value));
</script>

<div
	id={combobox.optionId(value)}
	role="option"
	tabindex="-1"
	aria-selected={highlighted}
	aria-disabled={disabled || undefined}
	class={['oito2-combobox-item', className]}
	data-highlighted={highlighted ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	onpointerdown={(event) => event.preventDefault()}
	onpointermove={() => {
		if (!disabled) combobox.highlighted = value;
	}}
	onclick={() => combobox.pick(value)}
	onkeydown={() => {}}
	{...rest}
>
	{#if children}{@render children()}{:else}{label}{/if}
</div>

<style>
	@layer oito2 {
		.oito2-combobox-item {
			display: flex;
			align-items: center;
			min-height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-md);
			cursor: pointer;
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		[data-highlighted] {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 8%, transparent);
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}
	}
</style>
