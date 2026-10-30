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
  A radio button of a `RadioGroup.Root`: the ring alone, in a target as large as a button.
  Give it an accessible name with `aria-label` or a `<label for>`.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import RadioMark from '../RadioMark.svelte';
	import { useRadioGroup } from '../radio-group.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** The value the item stands for. */
		value: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		value,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		...rest
	}: Props = $props();

	const group = useRadioGroup();
	let checked = $derived(group.value === value);
	let off = $derived(disabled || group.disabled);
</script>

<button
	bind:this={ref}
	type="button"
	role="radio"
	aria-checked={checked}
	disabled={off}
	class={['oito2-radio', 'oito2-toggle-host', className]}
	data-oito2-roving-item=""
	data-value={value}
	data-mark-focus=""
	data-state={checked ? 'checked' : 'unchecked'}
	data-disabled={off ? '' : undefined}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) group.activate(value);
	}}
	{...rest}
>
	<RadioMark {checked} />
</button>

<style>
	@layer oito2 {
		.oito2-radio {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: var(--oito2-toggle-target);
			height: var(--oito2-toggle-target);
			margin: 0;
			padding: 0;
			border: none;
			background: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-radio:focus-visible {
			outline: none;
		}

		.oito2-radio:disabled {
			opacity: 0.38;
			cursor: default;
		}
	}
</style>
