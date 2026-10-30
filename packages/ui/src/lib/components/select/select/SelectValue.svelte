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
  The label of the chosen option, or the `placeholder` while nothing is chosen. Without a
  `collection` on the root, an option's label is known once the list has been opened;
  pass `children` to show the value in your own way.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useSelect } from '../select-state.svelte.js';

	interface Props {
		/** The text shown while nothing is selected. */
		placeholder?: string;
		/** Custom content, given the selected value and its label. */
		children?: Snippet<[{ value: string | null; label: string | null }]>;
	}

	let { placeholder, children }: Props = $props();

	const select = useSelect();
</script>

{#if children}
	{@render children({ value: select.value, label: select.selectedLabel })}
{:else if select.selectedLabel !== null}
	{select.selectedLabel}
{:else if select.value !== null}
	{select.value}
{:else}
	<span class="oito2-select-placeholder">{placeholder ?? ''}</span>
{/if}

<style>
	@layer oito2 {
		.oito2-select-placeholder {
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
