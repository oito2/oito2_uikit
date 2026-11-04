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
  The page of the destination with `value` in a `NavigationPage.Root`, rendered only
  while that destination is selected. It fades in when it becomes the selected one.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useNavigationPage } from './navigation-page-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the destination this page belongs to. */
		value: string;
		/** The page element. */
		ref?: HTMLDivElement | null;
		/** The page content. */
		children?: Snippet;
	}

	let { value, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const page = useNavigationPage();
</script>

{#if page.value === value}
	<div bind:this={ref} class={['oito2-navigation-page-content', className]} {...rest}>
		{@render children?.()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-navigation-page-content {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			min-height: 0;
			animation: oito2-navigation-page-in 150ms ease-out;
		}

		@keyframes oito2-navigation-page-in {
			from {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-navigation-page-content {
				animation: none;
			}
		}
	}
</style>
