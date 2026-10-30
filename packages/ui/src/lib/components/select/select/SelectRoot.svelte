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
  A select: a button that shows the chosen option and opens a list of options to choose
  from. Give it a `collection` to render the options and their groups by itself, or
  compose `Select.Trigger`, `Select.Value` and `Select.Content` with `Select.Item`,
  `Select.Group` and `Select.Label`. Bind `value`, or set `defaultValue` and listen to
  `onValueChange`. With `name` it submits the value in a form.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { ListCollection } from '../../../collections/list-collection.js';
	import { SelectState, setSelect } from '../select-state.svelte.js';
	import SelectContent from './SelectContent.svelte';
	import SelectTrigger from './SelectTrigger.svelte';

	interface Props {
		/** The selected value, or `null`. */
		value?: string | null;
		/** The selected value of an uncontrolled select. Defaults to `null`. */
		defaultValue?: string | null;
		/** Called with each new value. */
		onValueChange?: (value: string | null) => void;
		/** The options, their labels, groups and disabled states. */
		collection?: ListCollection<T>;
		/** The text shown while nothing is selected. */
		placeholder?: string;
		/** The accessible name of the default trigger, when no \`Field.Label\` names it. */
		label?: string;
		/** Whether the select can't be used. */
		disabled?: boolean;
		/** The form field name. */
		name?: string;
		/** The parts; defaults to a trigger and the options of `collection`. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		collection,
		placeholder,
		label,
		disabled = false,
		name,
		children
	}: Props = $props();

	const id = $props.id();
	const state = new SelectState({
		value: () => value,
		defaultValue: () => defaultValue,
		onValueChange: (next) => {
			value = next;
			onValueChange?.(next);
		},
		disabled: () => disabled,
		collection: () => collection as ListCollection<unknown> | undefined,
		id
	});
	setSelect(state);
</script>

{#if children}
	{@render children()}
{:else}
	<SelectTrigger {placeholder} aria-label={label} />
	<SelectContent />
{/if}
{#if name && state.value !== null}
	<input type="hidden" {name} value={state.value} />
{/if}
