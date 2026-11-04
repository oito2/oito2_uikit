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
  The scrolling list of the master pane, holding `MasterDetail.Tile`s. It keeps the
  selected tile in view. Without tiles it shows `empty`, while the header and the footer
  stay, so a search that matches nothing can still be cleared.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMasterDetail } from '../master-detail-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
		/** Content shown when there are no tiles. */
		empty?: Snippet;
		/** The list element. */
		ref?: HTMLUListElement | null;
		/** The tiles. */
		children?: Snippet;
	}

	let { empty, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const masterDetail = useMasterDetail();

	/** Scrolls the selected tile into view when the selection changes. */
	function reveal(list: HTMLUListElement) {
		$effect(() => {
			void masterDetail.value;
			const selected = list.querySelector<HTMLElement>('[aria-current="true"]');
			if (!selected) return;
			const view = list.getBoundingClientRect();
			const box = selected.getBoundingClientRect();
			if (box.top >= view.top && box.bottom <= view.bottom) return;
			selected.scrollIntoView({ block: 'center' });
		});
	}
</script>

<ul bind:this={ref} class={['oito2-master-detail-list', className]} {@attach reveal} {...rest}>
	{@render children?.()}
</ul>
{#if empty && masterDetail.values.length === 0}
	<div class="oito2-master-detail-empty">{@render empty()}</div>
{/if}

<style>
	@layer oito2 {
		.oito2-master-detail-list {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--oito2-space-xs);
			min-height: 0;
			margin: 0;
			padding: var(--oito2-space-sm);
			overflow-y: auto;
			list-style: none;
		}

		.oito2-master-detail-list:empty {
			display: none;
		}

		.oito2-master-detail-empty {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-height: 0;
		}
	}
</style>
