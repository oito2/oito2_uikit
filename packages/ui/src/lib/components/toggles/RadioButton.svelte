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
  A radio button with a title and an optional subtitle, selected by a click anywhere on
  the row. It must be inside a `RadioGroup.Root`, which holds the selected value.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import RadioMark from './RadioMark.svelte';
	import ToggleRow from './ToggleRow.svelte';
	import { useRadioGroup } from './radio-group.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'title' | 'children' | 'value'> {
		/** The value the button stands for. */
		value: string;
		/** The main label. */
		title: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { value, disabled = false, ref = $bindable(null), onclick, ...rest }: Props = $props();

	const group = useRadioGroup();
	let checked = $derived(group.value === value);
</script>

<ToggleRow
	bind:ref
	role="radio"
	aria-checked={checked}
	disabled={disabled || group.disabled}
	data-oito2-roving-item=""
	data-value={value}
	data-state={checked ? 'checked' : 'unchecked'}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) group.activate(value);
	}}
	{...rest}
>
	{#snippet control()}<RadioMark {checked} />{/snippet}
</ToggleRow>
