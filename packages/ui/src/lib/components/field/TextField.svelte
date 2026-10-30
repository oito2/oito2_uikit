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
  A single-line text input: a filled box with an outline that thickens in the text-safe
  primary color while focused, as high as a button. `leading` and `trailing` hold icons or
  buttons inside the box. Inside a `Field.Root` it takes the field's id, description,
  invalid and disabled states.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { describedBy, useField } from './field-context.js';

	interface Props extends Omit<HTMLInputAttributes, 'children'> {
		/** The text. */
		value?: string | number | null;
		/** Content before the text, such as a search icon. */
		leading?: Snippet;
		/** Content after the text, such as a clear button. */
		trailing?: Snippet;
		/** Whether the value is invalid. Defaults to the field's state. */
		invalid?: boolean;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(),
		leading,
		trailing,
		invalid,
		disabled,
		required,
		id,
		type = 'text',
		ref = $bindable(null),
		class: className,
		'aria-describedby': ownDescribedBy,
		...rest
	}: Props = $props();

	const field = useField();
	let isInvalid = $derived(invalid ?? field?.invalid ?? false);
	let isDisabled = $derived(disabled ?? field?.disabled ?? false);
</script>

<div
	class={['oito2-text-field', className]}
	data-invalid={isInvalid ? '' : undefined}
	data-disabled={isDisabled ? '' : undefined}
>
	{#if leading}<span class="adornment">{@render leading()}</span>{/if}
	<input
		bind:this={ref}
		bind:value
		{type}
		id={id ?? field?.controlId}
		disabled={isDisabled}
		required={required ?? field?.required}
		aria-invalid={isInvalid || undefined}
		aria-describedby={describedBy(field, ownDescribedBy)}
		{...rest}
	/>
	{#if trailing}<span class="adornment">{@render trailing()}</span>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-text-field {
			display: flex;
			align-items: stretch;
			box-sizing: border-box;
			min-width: 0;
			min-height: var(--oito2-control-height);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			cursor: text;
		}

		/* The focused outline is 2 pixels: the border plus an inner ring of the same color. */
		.oito2-text-field:focus-within {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		[data-invalid] {
			border-color: var(--oito2-color-error-text);
		}

		[data-invalid]:focus-within {
			border-color: var(--oito2-color-error-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-error-text);
		}

		[data-disabled] {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		input {
			flex: 1;
			box-sizing: border-box;
			min-width: 0;
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: none;
			outline: none;
			background: none;
			color: inherit;
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
			align-self: stretch;
		}

		input::placeholder {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			opacity: 1;
		}

		input::selection {
			background: color-mix(in srgb, var(--oito2-color-primary) 35%, transparent);
		}

		.adornment {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			min-width: var(--oito2-control-height);
			color: var(--oito2-color-on-surface-variant);
		}

		.adornment + input {
			padding-inline-start: 0;
		}

		input:has(+ .adornment) {
			padding-inline-end: 0;
		}
	}
</style>
