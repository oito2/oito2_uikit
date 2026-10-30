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
  The label of a field, above its control; it names the control and focuses it on click.
  A required field shows an asterisk.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { useField } from '../field-context.js';

	let {
		class: className,
		children,
		...rest
	}: Omit<HTMLLabelAttributes, 'children'> & { children?: Snippet } = $props();

	const field = useField();
</script>

<label
	for={field?.controlId}
	class={['oito2-field-label', className]}
	data-disabled={field?.disabled ? '' : undefined}
	{...rest}
>
	{@render children?.()}{#if field?.required}<span class="required" aria-hidden="true">
			*</span
		>{/if}
</label>

<style>
	@layer oito2 {
		.oito2-field-label {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		:global(.oito2-field:focus-within) > .oito2-field-label {
			color: var(--oito2-color-primary-text);
		}

		:global(.oito2-field[data-invalid]) > .oito2-field-label {
			color: var(--oito2-color-error-text);
		}

		[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}
	}
</style>
