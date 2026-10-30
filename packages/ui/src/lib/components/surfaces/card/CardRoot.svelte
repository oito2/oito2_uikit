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
  A card: a surface with a 1-pixel outline and large rounded corners that groups related
  content. Compose it with `Card.Header`, `Card.Content` and `Card.Footer`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The card element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<div bind:this={ref} class={['oito2-card', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-card {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
		}
	}
</style>
