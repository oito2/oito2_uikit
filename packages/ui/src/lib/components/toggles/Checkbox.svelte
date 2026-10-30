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
  A check box: 20 pixels with a pointer and 24 with touch, in a target as large as a
  button. It is checked, unchecked or, with `tristate` or a `mixed` value, mixed. Bind
  `checked`, or set `defaultChecked` and listen to `onCheckedChange`. With `name` it
  submits `value` in a form while checked.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import CheckboxMark from './CheckboxMark.svelte';
	import { nextCheckedState, type CheckedState } from './toggle-state.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** Whether the box is checked, unchecked or mixed. */
		checked?: CheckedState;
		/** The state of an uncontrolled box before the first click. Defaults to `false`. */
		defaultChecked?: CheckedState;
		/** Called with each new state. */
		onCheckedChange?: (checked: CheckedState) => void;
		/** Whether a click cycles through the mixed state. */
		tristate?: boolean;
		/** The form field name. */
		name?: string;
		/** The value submitted while checked. Defaults to `on`. */
		value?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		checked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		tristate = false,
		name,
		value = 'on',
		disabled = false,
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

<button
	bind:this={ref}
	type="button"
	role="checkbox"
	aria-checked={state.current === 'mixed' ? 'mixed' : state.current}
	{disabled}
	class={['oito2-checkbox', 'oito2-toggle-host', className]}
	data-mark-focus=""
	data-state={state.current === 'mixed' ? 'mixed' : state.current ? 'checked' : 'unchecked'}
	data-disabled={disabled ? '' : undefined}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) state.current = nextCheckedState(state.current, tristate);
	}}
	{...rest}
>
	<CheckboxMark checked={state.current} />
</button>
{#if name && state.current === true}
	<input type="hidden" {name} {value} />
{/if}

<style>
	@layer oito2 {
		.oito2-checkbox {
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

		.oito2-checkbox:focus-visible {
			outline: none;
		}

		.oito2-checkbox:disabled {
			opacity: 0.38;
			cursor: default;
		}
	}
</style>
