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
  A list row with a check box, toggled by a click anywhere on it. The check box comes
  first unless `controlPosition` is `end`; `secondary` fills the other side.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import ListTile from '../list/ListTile.svelte';
	import CheckboxMark from './CheckboxMark.svelte';
	import { nextCheckedState, type CheckedState } from './toggle-state.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** Whether the box is checked, unchecked or mixed. */
		checked?: CheckedState;
		/** The state of an uncontrolled box before the first click. Defaults to `false`. */
		defaultChecked?: CheckedState;
		/** Called with each new state. */
		onCheckedChange?: (checked: CheckedState) => void;
		/** Whether a click cycles through the mixed state. */
		tristate?: boolean;
		/** The main line. */
		title?: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** Content on the side opposite the check box, such as an icon. */
		secondary?: Snippet;
		/** Where the check box goes. Defaults to `start`. */
		controlPosition?: 'start' | 'end';
		/** Whether the row can't be used. */
		disabled?: boolean;
		/** The row element. */
		ref?: HTMLElement | null;
	}

	let {
		checked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		tristate = false,
		secondary,
		controlPosition = 'start',
		ref = $bindable(null),
		class: className,
		onclick,
		...rest
	}: Props = $props();

	const state = new Controllable<CheckedState>({
		value: () => checked,
		defaultValue: () => defaultChecked,
		onChange: (next) => {
			checked = next;
			onCheckedChange?.(next);
		}
	});
</script>

{#snippet mark()}<CheckboxMark checked={state.current} />{/snippet}

<ListTile
	bind:ref
	role="checkbox"
	aria-checked={state.current === 'mixed' ? 'mixed' : state.current}
	class={['oito2-toggle-host', className]}
	leading={controlPosition === 'start' ? mark : secondary}
	trailing={controlPosition === 'start' ? secondary : mark}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) state.current = nextCheckedState(state.current, tristate);
	}}
	{...rest}
/>
