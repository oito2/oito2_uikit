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
  What a list box shows when its collection has no items; rendered only then.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useListBox } from '../list-box-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The content. */
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const list = useListBox();
</script>

{#if list.collection.isEmpty}
	<div role="presentation" class={['oito2-list-box-empty', className]} {...rest}>
		{@render children()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-list-box-empty {
			padding: var(--oito2-space-sm);
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
