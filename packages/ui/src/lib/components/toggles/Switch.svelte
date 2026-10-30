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
  A switch that turns a setting on or off at once: a 42 by 24 pixel track with a pointer
  (52 by 30 with touch). Bind `checked`, or set `defaultChecked` and listen to
  `onCheckedChange`. `onOffShapes` adds "I" and "O" marks to the track.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import SwitchMark from './SwitchMark.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'value'> {
		/** Whether the switch is on. */
		checked?: boolean;
		/** The state of an uncontrolled switch before the first click. Defaults to `false`. */
		defaultChecked?: boolean;
		/** Called with each new state. */
		onCheckedChange?: (checked: boolean) => void;
		/** Whether the track shows "I" and "O" marks. */
		onOffShapes?: boolean;
		/** The form field name. */
		name?: string;
		/** The value submitted while on. Defaults to `on`. */
		value?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let {
		checked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		onOffShapes = false,
		name,
		value = 'on',
		disabled = false,
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

<button
	bind:this={ref}
	type="button"
	role="switch"
	aria-checked={state.current}
	{disabled}
	class={['oito2-switch', 'oito2-toggle-host', className]}
	data-mark-focus=""
	data-state={state.current ? 'checked' : 'unchecked'}
	data-disabled={disabled ? '' : undefined}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) state.current = !state.current;
	}}
	{...rest}
>
	<SwitchMark checked={state.current} {onOffShapes} />
</button>
{#if name && state.current}
	<input type="hidden" {name} {value} />
{/if}

<style>
	@layer oito2 {
		.oito2-switch {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: calc(var(--oito2-switch-width) + var(--oito2-space-sm));
			height: var(--oito2-toggle-target);
			margin: 0;
			padding: 0;
			border: none;
			background: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-switch:focus-visible {
			outline: none;
		}

		.oito2-switch:disabled {
			opacity: 0.38;
			cursor: default;
		}
	}
</style>
