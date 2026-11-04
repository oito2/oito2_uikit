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
  The master pane of a `MasterDetail.Root`: an optional `MasterDetail.MasterHeader`, the
  `MasterDetail.List` and an optional `MasterDetail.MasterFooter`, on the chrome main bar
  color.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMasterDetail } from '../master-detail-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The pane element. */
		ref?: HTMLDivElement | null;
		/** The header, the list and the footer. */
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const masterDetail = useMasterDetail();
</script>

{#if masterDetail.showsMaster}
	<div bind:this={ref} class={['oito2-master-detail-master', className]} {...rest}>
		{@render children?.()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-master-detail-master {
			display: flex;
			grid-row: 1;
			grid-column: 1;
			flex-direction: column;
			min-width: 0;
			min-height: 0;
			background: var(--oito2-master-detail-pane-color, var(--oito2-chrome-mainbar));
			color: var(--oito2-color-on-surface);
		}
	}
</style>
