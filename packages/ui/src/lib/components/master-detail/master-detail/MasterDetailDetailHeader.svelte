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
  The header of a detail page: the `title` and `actions`, with a back button to the
  master list in the narrow layout.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import BackButton from '../../button/BackButton.svelte';
	import { useMasterDetail } from '../master-detail-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
		/** The page title. */
		title?: string | Snippet;
		/** The heading level of the title. Defaults to 2. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Content at the end, such as icon buttons. */
		actions?: Snippet;
		/** The header element. */
		ref?: HTMLDivElement | null;
	}

	let {
		title,
		level = 2,
		actions,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const masterDetail = useMasterDetail();
</script>

<div bind:this={ref} class={['oito2-master-detail-header', className]} {...rest}>
	{#if !masterDetail.wide}<BackButton onclick={() => masterDetail.back()} />{/if}
	<span class="title" role="heading" aria-level={level}>
		{#if typeof title === 'string'}{title}{:else}{@render title?.()}{/if}
	</span>
	{#if actions}<span class="actions">{@render actions()}</span>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-master-detail-header {
			display: flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-sm);
			min-height: var(--oito2-size-title-bar-height);
			padding: 0 var(--oito2-space-sm);
		}

		.title {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			padding-inline-start: var(--oito2-space-sm);
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.actions {
			display: inline-flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-xs);
		}
	}
</style>
