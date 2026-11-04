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
  The header of a sheet: a `title`, `actions` and a close button, unless `closeButton` is
  false. The title names the sheet for assistive technologies.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import CloseButton from '../../button/CloseButton.svelte';
	import { useSheet } from '../sheet-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
		/** The heading. */
		title?: string | Snippet;
		/** Buttons at the end of the header. */
		actions?: Snippet;
		/** Whether the header shows a close button. Defaults to true. */
		closeButton?: boolean;
	}

	let { title, actions, closeButton = true, class: className, ...rest }: Props = $props();

	const sheet = useSheet();
	$effect(() => {
		sheet.hasTitle = title !== undefined;
		return () => (sheet.hasTitle = false);
	});
</script>

<div class={['oito2-sheet-header', className]} {...rest}>
	<h2 class="title" id="{sheet.id}-title">
		{#if typeof title === 'string'}{title}{:else}{@render title?.()}{/if}
	</h2>
	{@render actions?.()}
	{#if closeButton}<CloseButton onclick={() => (sheet.open = false)} />{/if}
</div>

<style>
	@layer oito2 {
		.oito2-sheet-header {
			display: flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-sm);
			padding: var(--oito2-space-lg) var(--oito2-space-lg) 0;
		}

		.title {
			flex: 1;
			min-width: 0;
			margin: 0;
			font: var(--oito2-type-title-large);
			letter-spacing: var(--oito2-type-title-large-tracking);
		}
	}
</style>
