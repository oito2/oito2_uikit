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
  A form field: ties a `Field.Label`, a control (`TextField`, `TextArea` or any control
  rendered by `Field.Control`), a `Field.Helper` and a `Field.Error` together with ids, so
  the label names the control and the messages describe it. `invalid` shows the error
  look and the error message.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setField } from '../field-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the value is invalid. */
		invalid?: boolean;
		/** Whether the field can't be used. */
		disabled?: boolean;
		/** Whether the field must be filled. */
		required?: boolean;
		/** The id of the control. Defaults to a generated one. */
		controlId?: string;
		/** The parts of the field. */
		children?: Snippet;
	}

	let {
		invalid = false,
		disabled = false,
		required = false,
		controlId,
		class: className,
		children,
		...rest
	}: Props = $props();

	const id = $props.id();
	let hasHelper = $state(false);
	let hasError = $state(false);

	setField({
		get controlId() {
			return controlId ?? `${id}-control`;
		},
		helperId: `${id}-helper`,
		errorId: `${id}-error`,
		get invalid() {
			return invalid;
		},
		get disabled() {
			return disabled;
		},
		get required() {
			return required;
		},
		get hasHelper() {
			return hasHelper;
		},
		set hasHelper(value) {
			hasHelper = value;
		},
		get hasError() {
			return hasError;
		},
		set hasError(value) {
			hasError = value;
		}
	});
</script>

<div
	class={['oito2-field', className]}
	data-invalid={invalid ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-field {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-xs);
			min-width: 0;
		}
	}
</style>
