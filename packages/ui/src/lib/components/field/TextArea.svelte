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
  A multi-line text input with the look of `TextField`. With `autoGrow` it grows with its
  text up to `maxRows` instead of scrolling. Inside a `Field.Root` it takes the field's id,
  description, invalid and disabled states.
-->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { describedBy, useField } from './field-context.js';

	interface Props extends Omit<HTMLTextareaAttributes, 'children'> {
		/** The text. */
		value?: string | null;
		/** The visible number of lines. Defaults to 3. */
		rows?: number;
		/** Whether the box grows with its text. */
		autoGrow?: boolean;
		/** The most lines an auto-growing box shows before it scrolls. */
		maxRows?: number;
		/** Whether the value is invalid. Defaults to the field's state. */
		invalid?: boolean;
		/** The text area element. */
		ref?: HTMLTextAreaElement | null;
	}

	let {
		value = $bindable(),
		rows = 3,
		autoGrow = false,
		maxRows,
		invalid,
		disabled,
		required,
		id,
		ref = $bindable(null),
		class: className,
		'aria-describedby': ownDescribedBy,
		...rest
	}: Props = $props();

	const field = useField();
	let isInvalid = $derived(invalid ?? field?.invalid ?? false);
	let isDisabled = $derived(disabled ?? field?.disabled ?? false);

	/** Sizes the box to its text where `field-sizing` is unavailable. */
	function grow(node: HTMLTextAreaElement) {
		if (!autoGrow || CSS.supports('field-sizing', 'content')) return;
		const fit = () => {
			node.style.height = 'auto';
			node.style.height = `${node.scrollHeight + node.offsetHeight - node.clientHeight}px`;
		};
		$effect(() => {
			void value;
			fit();
		});
		node.addEventListener('input', fit);
		return () => node.removeEventListener('input', fit);
	}
</script>

<textarea
	bind:this={ref}
	bind:value
	{rows}
	id={id ?? field?.controlId}
	disabled={isDisabled}
	required={required ?? field?.required}
	aria-invalid={isInvalid || undefined}
	aria-describedby={describedBy(field, ownDescribedBy)}
	class={['oito2-text-area', className]}
	data-invalid={isInvalid ? '' : undefined}
	data-auto-grow={autoGrow ? '' : undefined}
	style:--oito2-text-area-max-rows={maxRows}
	{@attach grow}
	{...rest}></textarea>

<style>
	@layer oito2 {
		.oito2-text-area {
			--line: calc(
				var(--oito2-type-body-large-size) * var(--oito2-type-body-large-line-height)
			);
			display: block;
			box-sizing: border-box;
			width: 100%;
			min-height: var(--oito2-control-height);
			margin: 0;
			padding: var(--oito2-space-sm) var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			outline: none;
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
			resize: vertical;
		}

		[data-auto-grow] {
			field-sizing: content;
			max-height: calc(
				var(--line) * var(--oito2-text-area-max-rows, 1000) + 2 * var(--oito2-space-sm) +
					2px
			);
			resize: none;
		}

		.oito2-text-area:focus {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		[data-invalid],
		[data-invalid]:focus {
			border-color: var(--oito2-color-error-text);
		}

		[data-invalid]:focus {
			box-shadow: inset 0 0 0 1px var(--oito2-color-error-text);
		}

		.oito2-text-area:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}

		.oito2-text-area::placeholder {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			opacity: 1;
		}

		.oito2-text-area::selection {
			background: color-mix(in srgb, var(--oito2-color-primary) 35%, transparent);
		}
	}
</style>
