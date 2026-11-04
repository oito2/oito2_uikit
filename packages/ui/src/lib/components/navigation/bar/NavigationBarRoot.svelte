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
  A bar of destinations along the bottom of a touch layout: icons on a pill indicator
  with their labels below. Bind `value`, or set `defaultValue` and listen to
  `onValueChange`. `NavigationPage` switches to it for narrow touch layouts.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { NavigationState, setNavigation } from '../navigation-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The value of the selected destination; `''` for none. */
		value?: string;
		/** The selected destination of an uncontrolled bar. */
		defaultValue?: string;
		/** Called with the value of each activated destination. */
		onValueChange?: (value: string) => void;
		/** The bar element, a `nav`. */
		ref?: HTMLElement | null;
		/** The `NavigationBar.Item`s. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		onValueChange,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	setNavigation(
		new NavigationState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			railStyle: () => 'labelled'
		})
	);
</script>

<nav bind:this={ref} class={['oito2-navigation-bar', className]} {...rest}>
	<ul class="items">{@render children?.()}</ul>
</nav>

<style>
	@layer oito2 {
		.oito2-navigation-bar {
			flex: none;
			background: var(--oito2-color-surface-container);
			color: var(--oito2-color-on-surface);
		}

		.items {
			display: flex;
			height: 80px;
			margin: 0;
			padding: 0 var(--oito2-space-sm);
			list-style: none;
		}
	}
</style>
