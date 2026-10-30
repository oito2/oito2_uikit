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
  The button of a select: the chosen option (or a placeholder) and a chevron, in a filled
  outlined box as high as a button. Enter, Space and the arrows open the list. Inside a
  \`Field.Root\` it takes the field's id, so \`Field.Label\` names it.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { describedBy, useField } from '../../field/field-context.js';
	import { useSelect } from '../select-state.svelte.js';
	import SelectValue from './SelectValue.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The text shown while nothing is selected, when there are no `children`. */
		placeholder?: string;
		/** Content before the value, such as an icon. */
		leading?: Snippet;
		/** The content; defaults to a `Select.Value`. */
		children?: Snippet;
	}

	let { placeholder, leading, class: className, children, ...rest }: Props = $props();

	const select = useSelect();
	const field = useField();

	function attach(node: HTMLButtonElement) {
		select.triggerId = node.id;
		select.trigger = node;
		return () => {
			if (select.trigger === node) select.trigger = null;
		};
	}

	function onkeydown(event: KeyboardEvent) {
		if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
			event.preventDefault();
			select.show(event.key === 'ArrowUp' ? 'last' : 'first');
		}
	}
</script>

<button
	type="button"
	role="combobox"
	id={field?.controlId ?? `${select.id}-trigger`}
	aria-describedby={describedBy(field)}
	aria-invalid={field?.invalid || undefined}
	aria-haspopup="listbox"
	aria-expanded={select.open}
	aria-controls={select.open ? `${select.id}-content` : undefined}
	disabled={select.disabled || field?.disabled}
	class={['oito2-select-trigger', className]}
	data-state={select.open ? 'open' : 'closed'}
	onclick={() => (select.open ? (select.open = false) : select.show())}
	{onkeydown}
	{@attach attach}
	{...rest}
>
	{@render leading?.()}
	<span class="value">
		{#if children}{@render children()}{:else}<SelectValue {placeholder} />{/if}
	</span>
	{#if select.open}<ChevronUp
			size={20}
			aria-hidden="true"
			class="oito2-select-chevron"
		/>{:else}<ChevronDown size={20} aria-hidden="true" class="oito2-select-chevron" />{/if}
</button>

<style>
	@layer oito2 {
		.oito2-select-trigger {
			position: relative;
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			min-width: 64px;
			max-width: 100%;
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-sm) 0 var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			font-weight: 400;
			letter-spacing: var(--oito2-type-label-large-tracking);
			text-align: start;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-select-trigger::before {
			content: '';
			position: absolute;
			inset: -1px;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-select-trigger:not(:disabled):hover::before {
			opacity: 0.08;
		}

		.oito2-select-trigger:focus-visible {
			border-color: transparent;
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-select-trigger:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.value {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.oito2-select-trigger :global(.oito2-select-chevron) {
			flex: none;
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
