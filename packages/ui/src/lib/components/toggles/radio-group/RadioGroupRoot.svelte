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
  A group of radio buttons, of which one at most is selected. The group has one Tab stop;
  the arrow keys move between its items and select them. Items are `RadioGroup.Item`,
  `RadioButton` or `RadioListTile`. Bind `value`, or set `defaultValue` and listen to
  `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { rovingFocus } from '../../../internal/roving-focus.js';
	import { RadioGroupState, setRadioGroup } from '../radio-group.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The selected value, or `null`. */
		value?: string | null;
		/** The selected value of an uncontrolled group. Defaults to `null`. */
		defaultValue?: string | null;
		/** Called with each new value. */
		onValueChange?: (value: string | null) => void;
		/** Whether every item is disabled. */
		disabled?: boolean;
		/** Whether clicking the selected item clears the group. */
		toggleable?: boolean;
		/** The form field name; the selected value is submitted under it. */
		name?: string;
		/** The layout of the items, for assistive technologies. Defaults to `vertical`. */
		orientation?: 'horizontal' | 'vertical';
		/** The group element. */
		ref?: HTMLDivElement | null;
		/** The items. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		disabled = false,
		toggleable = false,
		name,
		orientation = 'vertical',
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const group = new RadioGroupState({
		value: () => value,
		defaultValue: () => defaultValue,
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		},
		disabled: () => disabled,
		toggleable: () => toggleable,
		name: () => name
	});
	setRadioGroup(group);
</script>

<div
	bind:this={ref}
	role="radiogroup"
	aria-orientation={orientation}
	aria-disabled={disabled || undefined}
	class={['oito2-radio-group', className]}
	data-orientation={orientation}
	{@attach rovingFocus({
		orientation: 'grid',
		loop: true,
		onFocusItem: (item) => {
			const itemValue = item.dataset.value;
			if (itemValue !== undefined) group.activate(itemValue, true);
		}
	})}
	{...rest}
>
	{@render children?.()}
	{#if name && group.value !== null}
		<input type="hidden" {name} value={group.value} />
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-radio-group {
			display: flex;
			flex-direction: column;
		}

		.oito2-radio-group[data-orientation='horizontal'] {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}
</style>
