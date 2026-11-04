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
  A read-only field showing `value`, such as a link or a token, with a `CopyButton` at its
  end. With `obscure` the value shows as dots, such as for a secret. Inside a `Field.Root`
  it takes the field's label.
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import TextField from '../field/TextField.svelte';
	import CopyButton from './CopyButton.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'children' | 'value' | 'type'> {
		/** The text shown and copied. */
		value: string;
		/** Whether the value shows as dots. */
		obscure?: boolean;
		/** Called after each copy. */
		onCopied?: () => void;
		/** Called with the error when the platform refuses a copy. */
		onError?: (error: unknown) => void;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value,
		obscure = false,
		onCopied,
		onError,
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

{#snippet copy()}<CopyButton
		class="oito2-field-button"
		text={value}
		{onCopied}
		{onError}
	/>{/snippet}

<TextField
	bind:ref
	{value}
	readonly
	type={obscure ? 'password' : 'text'}
	trailing={copy}
	{...rest}
/>
