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
  The row of items of a navigation menu.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
		/** The `NavigationMenu.Item`s. */
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<ul class={['oito2-navigation-menu-list', className]} {...rest}>
	{@render children()}
</ul>

<style>
	@layer oito2 {
		.oito2-navigation-menu-list {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--oito2-space-xs);
			margin: 0;
			padding: 0;
			list-style: none;
		}
	}
</style>
