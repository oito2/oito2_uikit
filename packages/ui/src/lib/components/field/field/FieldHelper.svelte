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
  A hint under a field's control, read by screen readers as its description. It hides
  while the field shows its error.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useField } from '../field-context.js';

	let {
		class: className,
		children,
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { children?: Snippet } = $props();

	const field = useField();
	let shown = $derived(!field?.invalid);

	$effect(() => {
		if (!field) return;
		field.hasHelper = shown;
		return () => {
			field.hasHelper = false;
		};
	});
</script>

{#if shown}
	<div id={field?.helperId} class={['oito2-field-helper', className]} {...rest}>
		{@render children?.()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-field-helper {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}
	}
</style>
