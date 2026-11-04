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
  The detail page of a `MasterDetail.Root`. The children receive the selected value;
  `empty` shows when nothing is selected. Start it with a `MasterDetail.DetailHeader`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMasterDetail } from '../master-detail-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Content shown when nothing is selected. */
		empty?: Snippet;
		/** The page element. */
		ref?: HTMLDivElement | null;
		/** The page of the selected item. */
		children?: Snippet<[string]>;
	}

	let { empty, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const masterDetail = useMasterDetail();
</script>

{#if masterDetail.showsDetail}
	<div bind:this={ref} class={['oito2-master-detail-detail', className]} {...rest}>
		{#if masterDetail.value === null}
			{@render empty?.()}
		{:else}
			{#key masterDetail.value}{@render children?.(masterDetail.value)}{/key}
		{/if}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-master-detail-detail {
			display: flex;
			grid-row: 1;
			grid-column: 1;
			flex-direction: column;
			min-width: 0;
			min-height: 0;
			overflow: auto;
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
		}

		:global([data-layout='wide']) > .oito2-master-detail-detail {
			grid-column: 3;
		}
	}
</style>
