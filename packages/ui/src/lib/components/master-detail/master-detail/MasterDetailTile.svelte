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
  A tile of the master list, identified by `value`: a `ListTile` that selects its item
  and shows as selected while its page is shown.
-->
<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import ListTile from '../../list/ListTile.svelte';
	import { useMasterDetail } from '../master-detail-state.svelte.js';

	interface Props {
		/** The value that identifies the item. */
		value: string;
		/** The primary text. */
		title?: string | Snippet;
		/** The secondary text. */
		subtitle?: string | Snippet;
		/** Content before the text, usually an icon. */
		leading?: Snippet;
		/** Content after the text. */
		trailing?: Snippet;
		/** Whether the tile can't be used. */
		disabled?: boolean;
		/** The tile element. */
		ref?: HTMLElement | null;
	}

	let {
		value,
		title,
		subtitle,
		leading,
		trailing,
		disabled = false,
		ref = $bindable(null)
	}: Props = $props();

	const masterDetail = useMasterDetail();
	const tile = masterDetail.register(() => untrack(() => value));
	onDestroy(() => masterDetail.unregister(tile));
	$effect.pre(() => masterDetail.update(tile, value));

	let selected = $derived(masterDetail.value === value);

	// Coming back from the detail in the narrow layout focuses the tile of the page left.
	$effect(() => {
		if (masterDetail.returnTo !== value || !ref) return;
		ref.focus();
		masterDetail.returnTo = null;
	});
</script>

<li class="oito2-master-detail-tile">
	<ListTile
		bind:ref
		{title}
		{subtitle}
		{leading}
		{trailing}
		{selected}
		{disabled}
		aria-current={selected ? 'true' : undefined}
		onclick={() => masterDetail.select(value)}
	/>
</li>
