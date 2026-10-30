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
  A list row with a switch, toggled by a click anywhere on it. The switch comes last
  unless `controlPosition` is `start`; `secondary` fills the other side.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import ListTile from '../list/ListTile.svelte';
	import SwitchMark from './SwitchMark.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** Whether the switch is on. */
		checked?: boolean;
		/** The state of an uncontrolled switch before the first click. Defaults to `false`. */
		defaultChecked?: boolean;
		/** Called with each new state. */
		onCheckedChange?: (checked: boolean) => void;
		/** Whether the track shows "I" and "O" marks. */
		onOffShapes?: boolean;
		/** The main line. */
		title?: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** Content on the side opposite the switch, such as an icon. */
		secondary?: Snippet;
		/** Where the switch goes. Defaults to `end`. */
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
		onOffShapes = false,
		secondary,
		controlPosition = 'end',
		ref = $bindable(null),
		class: className,
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

{#snippet mark()}<SwitchMark checked={state.current} {onOffShapes} />{/snippet}

<ListTile
	bind:ref
	role="switch"
	aria-checked={state.current}
	class={['oito2-toggle-host', className]}
	leading={controlPosition === 'start' ? mark : secondary}
	trailing={controlPosition === 'start' ? secondary : mark}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) state.current = !state.current;
	}}
	{...rest}
/>
