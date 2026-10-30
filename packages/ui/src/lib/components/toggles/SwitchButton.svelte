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
  A switch with a title and an optional subtitle, toggled by a click anywhere on the row.
  Bind `checked`, or set `defaultChecked` and listen to `onCheckedChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import SwitchMark from './SwitchMark.svelte';
	import ToggleRow from './ToggleRow.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'title' | 'children'> {
		/** Whether the switch is on. */
		checked?: boolean;
		/** The state of an uncontrolled switch before the first click. Defaults to `false`. */
		defaultChecked?: boolean;
		/** Called with each new state. */
		onCheckedChange?: (checked: boolean) => void;
		/** Whether the track shows "I" and "O" marks. */
		onOffShapes?: boolean;
		/** The main label. */
		title: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		checked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		onOffShapes = false,
		ref = $bindable(null),
		onclick,
		...rest
	}: Props = $props();

	const state = new Controllable<boolean>({
		value: () => checked,
		defaultValue: () => defaultChecked,
		onChange: (next) => {
			checked = next;
			onCheckedChange?.(next);
		}
	});
</script>

<ToggleRow
	bind:ref
	role="switch"
	aria-checked={state.current}
	data-state={state.current ? 'checked' : 'unchecked'}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) state.current = !state.current;
	}}
	{...rest}
>
	{#snippet control()}<SwitchMark checked={state.current} {onOffShapes} />{/snippet}
</ToggleRow>
