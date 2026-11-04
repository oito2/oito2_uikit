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
  A joined row (or column) of buttons that turn on and off, such as text formatting or
  alignment buttons. With `multiple` each item turns on and off by itself; otherwise
  turning one on turns the others off, and `deselectable` says whether the one that is on
  can be turned off. Items that are on are raised from the track. The group is one Tab
  stop: the arrow keys move between the enabled items, wrapping at the ends, and Space or
  Enter toggles the focused one. Bind `value`, or set `defaultValue` and listen to
  `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { rovingFocus } from '../../../internal/roving-focus.js';
	import { ToggleGroupState, setToggleGroup } from './toggle-group-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The values of the items that are on. */
		value?: readonly string[];
		/** The items that are on in an uncontrolled group. Defaults to none. */
		defaultValue?: readonly string[];
		/** Called with the values that are on after each change. */
		onValueChange?: (value: readonly string[]) => void;
		/** Whether several items can be on at once. Defaults to false. */
		multiple?: boolean;
		/** Whether the only item that is on can be turned off; ignored with `multiple`. Defaults to true. */
		deselectable?: boolean;
		/** Whether the items run across or down. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** Whether every item is disabled. */
		disabled?: boolean;
		/** The group element. */
		ref?: HTMLDivElement | null;
		/** The `ToggleGroup.Item`s. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = [],
		onValueChange,
		multiple = false,
		deselectable = true,
		orientation = 'horizontal',
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	setToggleGroup(
		new ToggleGroupState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			multiple: () => multiple,
			deselectable: () => deselectable,
			disabled: () => disabled
		})
	);
</script>

<div
	bind:this={ref}
	role="group"
	class={['oito2-toggle-group', className]}
	data-orientation={orientation}
	{@attach rovingFocus({ orientation, loop: true })}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-toggle-group {
			display: inline-flex;
			gap: 1px;
			padding: var(--oito2-space-xxs);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-surface-container-high);
		}

		[data-orientation='vertical'] {
			flex-direction: column;
		}
	}
</style>
