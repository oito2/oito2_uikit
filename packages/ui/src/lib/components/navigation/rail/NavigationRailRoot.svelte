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
  A vertical bar of destinations at the start side of a window, in one of three styles:
  icons only (`compact`, with the labels as tooltips), icons with labels below
  (`labelled`) or a wider rail with labels beside the icons (`labelledExtended`). The
  width animates when the style changes. The items scroll when they don't fit, and the
  selected one is scrolled into view when it changes; `header` and `footer` stay at the
  top and bottom. Bind `value`, or set `defaultValue` and listen to `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		NavigationState,
		navigationRailWidths,
		setNavigation,
		type NavigationRailStyle
	} from '../navigation-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The value of the selected destination; `''` for none. */
		value?: string;
		/** The selected destination of an uncontrolled rail. */
		defaultValue?: string;
		/** Called with the value of each activated destination. */
		onValueChange?: (value: string) => void;
		/** How the destinations are shown. Defaults to `labelled`. */
		railStyle?: NavigationRailStyle;
		/** Content above the destinations. */
		header?: Snippet;
		/** Content below the destinations. */
		footer?: Snippet;
		/** The rail element, a `nav`. */
		ref?: HTMLElement | null;
		/** The `NavigationRail.Item`s. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		onValueChange,
		railStyle = 'labelled',
		header,
		footer,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const navigation = setNavigation(
		new NavigationState({
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			railStyle: () => railStyle
		})
	);

	/** Scrolls the selected item into view when the selection or the style changes. */
	function reveal(list: HTMLElement) {
		$effect(() => {
			void navigation.value;
			void railStyle;
			const selected = list.querySelector<HTMLElement>('[aria-current="page"]');
			if (!selected) return;
			const view = list.getBoundingClientRect();
			const box = selected.getBoundingClientRect();
			if (box.top >= view.top && box.bottom <= view.bottom) return;
			selected.scrollIntoView({ block: 'center' });
		});
	}
</script>

<nav
	bind:this={ref}
	class={['oito2-navigation-rail', className]}
	data-style={railStyle}
	style:width="{navigationRailWidths[railStyle]}px"
	{...rest}
>
	<div class="inner" style:width="{navigationRailWidths[railStyle]}px">
		{#if header}<div class="header">{@render header()}</div>{/if}
		<ul class="items" {@attach reveal}>
			{@render children?.()}
		</ul>
		{#if footer}<div class="footer">{@render footer()}</div>{/if}
	</div>
</nav>

<style>
	@layer oito2 {
		.oito2-navigation-rail {
			display: flex;
			flex: none;
			min-height: 0;
			overflow: hidden;
			background: var(--oito2-navigation-rail-color, var(--oito2-chrome-sidebar));
			color: var(--oito2-color-on-surface);
			transition: width 200ms ease-in-out;
		}

		.inner {
			display: flex;
			flex: none;
			flex-direction: column;
			align-items: center;
			min-height: 0;
			padding-block: var(--oito2-navigation-rail-padding, var(--oito2-space-sm));
		}

		[data-style='labelledExtended'] .inner {
			align-items: stretch;
		}

		.header,
		.footer {
			display: flex;
			flex: none;
			flex-direction: column;
			align-items: inherit;
		}

		.items {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: inherit;
			min-height: 0;
			margin: 0;
			padding: 0;
			overflow-y: auto;
			list-style: none;
			scrollbar-width: thin;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-navigation-rail {
				transition: none;
			}
		}
	}
</style>
