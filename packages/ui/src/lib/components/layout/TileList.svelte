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
  A bordered list of `Tile`s separated by 1-pixel dividers.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import BorderContainer from './BorderContainer.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The list element. */
		ref?: HTMLDivElement | null;
		/** The tiles, in order. */
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<BorderContainer bind:ref class={['oito2-tile-list', className]} {...rest}>
	{@render children?.()}
</BorderContainer>

<style>
	@layer oito2 {
		:global(.oito2-tile-list) {
			display: flex;
			flex-direction: column;
		}

		:global(.oito2-tile-list > * + *) {
			border-top: 1px solid var(--oito2-color-outline-variant);
		}
	}
</style>
