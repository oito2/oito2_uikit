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
  A password text field with a button that shows or hides the text and a warning below it
  while Caps Lock is on. Password managers fill it through `autocomplete`; use
  `new-password` for a field that sets a new password. Inside a `Field.Root` it takes the
  field's label, description and error.
-->
<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import TextField from '../field/TextField.svelte';
	import type { IconComponent } from '../icon.js';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value' | 'type'> {
		/** The text. */
		value?: string;
		/** Whether the text shows instead of dots. */
		visible?: boolean;
		/** Whether a warning shows below the focused field while Caps Lock is on. Defaults to true. */
		capsLockWarning?: boolean;
		/** Whether the value is invalid. */
		invalid?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(''),
		visible = $bindable(false),
		capsLockWarning = true,
		autocomplete = 'current-password',
		disabled,
		ref = $bindable(null),
		class: className,
		onkeydown,
		onkeyup,
		onblur,
		'aria-describedby': describedBy,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const id = $props.id();
	let capsLock = $state(false);
	let warning = $derived(capsLockWarning && capsLock);

	/** Reads Caps Lock from a key event. */
	function check(event: KeyboardEvent) {
		capsLock = event.getModifierState?.('CapsLock') ?? false;
	}
</script>

{#snippet toggle()}
	<IconButton
		class="oito2-field-button"
		icon={(visible ? EyeOff : Eye) as IconComponent}
		label={visible ? locale.strings.hidePassword : locale.strings.showPassword}
		disabled={disabled ?? false}
		onclick={() => (visible = !visible)}
	/>
{/snippet}

<div class={['oito2-password-field', className]}>
	<TextField
		bind:ref
		bind:value
		type={visible ? 'text' : 'password'}
		{autocomplete}
		autocapitalize="off"
		spellcheck={false}
		{disabled}
		trailing={toggle}
		aria-describedby={[describedBy, warning ? `${id}-caps` : undefined]
			.filter(Boolean)
			.join(' ') || undefined}
		onkeydown={(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			check(event);
			onkeydown?.(event);
		}}
		onkeyup={(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			check(event);
			onkeyup?.(event);
		}}
		onblur={(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
			capsLock = false;
			onblur?.(event);
		}}
		{...rest}
	/>
	<span class="caps" id="{id}-caps" role="status">
		{#if warning}
			<TriangleAlert size={14} aria-hidden="true" />{locale.strings.capsLockOn}
		{/if}
	</span>
</div>

<style>
	@layer oito2 {
		.oito2-password-field {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-xxs);
			min-width: 0;
		}

		.caps {
			display: flex;
			align-items: center;
			gap: 4px;
			color: var(--oito2-color-warning);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}

		.caps:empty {
			display: none;
		}
	}
</style>
