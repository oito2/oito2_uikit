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
  Top-level navigation between pages that adapts to the width and the input. With touch
  below `compactBreakpoint` the destinations are a bottom `NavigationBar`; otherwise they
  are a `NavigationRail` at the start side: compact below `compactBreakpoint`, labelled
  up to `extendedBreakpoint` and extended from it. `railStyle` forces one rail style.
  The pages are `NavigationPage.Content`s; the selected one fades in, and the contents
  keep their state when the layout changes. Bind `value`, or set `defaultValue` and
  listen to `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';
	import { Controllable } from '../../../internal/controllable.svelte.js';
	import * as NavigationBar from '../bar/index.js';
	import {
		navigationLayout,
		type NavigationItem,
		type NavigationRailStyle
	} from '../navigation-state.svelte.js';
	import * as NavigationRail from '../rail/index.js';
	import { setNavigationPage } from './navigation-page-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The destinations, in order. */
		items: readonly NavigationItem[];
		/** The value of the selected destination. */
		value?: string;
		/** The selected destination of an uncontrolled page. Defaults to the first item. */
		defaultValue?: string;
		/** Called with the value of each destination the user selects. */
		onValueChange?: (value: string) => void;
		/** The width below which touch uses a bottom bar and pointer a compact rail. Defaults to 600. */
		compactBreakpoint?: number;
		/** The width from which the rail shows labels beside the icons; never when unset. */
		extendedBreakpoint?: number;
		/** Forces a rail style instead of choosing the layout by width. */
		railStyle?: NavigationRailStyle;
		/** Whether a 1-pixel line separates the rail from the page. Defaults to true. */
		separator?: boolean;
		/** Content above the rail destinations. */
		header?: Snippet;
		/** Content below the rail destinations. */
		footer?: Snippet;
		/** An accessible name for the navigation landmark. */
		navigationLabel?: string;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The `NavigationPage.Content`s. */
		children?: Snippet;
	}

	let {
		items,
		value = $bindable(),
		defaultValue,
		onValueChange,
		compactBreakpoint = 600,
		extendedBreakpoint,
		railStyle,
		separator = true,
		header,
		footer,
		navigationLabel,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const selection = new Controllable({
		value: () => value,
		defaultValue: () => defaultValue ?? items[0]?.value ?? '',
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		}
	});
	setNavigationPage({
		get value() {
			return selection.current;
		}
	});

	const coarse = new MediaQuery('(pointer: coarse)');
	let width = $state(Number.POSITIVE_INFINITY);
	let density = $state<string | null>(null);
	let touch = $derived(density ? density === 'touch' : coarse.current);
	let layout = $derived(
		navigationLayout({ width, touch, compactBreakpoint, extendedBreakpoint, railStyle })
	);

	/** Reads the density forced on an ancestor. */
	function readDensity(root: HTMLElement) {
		density = root.closest('[data-oito2-density]')?.getAttribute('data-oito2-density') ?? null;
	}
</script>

<div
	bind:this={ref}
	bind:clientWidth={width}
	class={['oito2-navigation-page', className]}
	data-layout={layout.kind}
	{@attach readDensity}
	{...rest}
>
	{#if layout.kind === 'bar'}
		<NavigationBar.Root
			class="oito2-navigation-page-bar"
			aria-label={navigationLabel}
			bind:value={() => selection.current, (next) => (selection.current = next)}
		>
			{#each items as item (item.value)}
				<NavigationBar.Item
					value={item.value}
					label={item.label}
					icon={item.icon}
					selectedIcon={item.selectedIcon}
				/>
			{/each}
		</NavigationBar.Root>
	{:else}
		<NavigationRail.Root
			railStyle={layout.style}
			aria-label={navigationLabel}
			{header}
			{footer}
			bind:value={() => selection.current, (next) => (selection.current = next)}
		>
			{#each items as item (item.value)}
				<NavigationRail.Item
					value={item.value}
					label={item.label}
					icon={item.icon}
					selectedIcon={item.selectedIcon}
					tooltip={item.tooltip}
				/>
			{/each}
		</NavigationRail.Root>
		{#if separator}<div class="separator" role="presentation"></div>{/if}
	{/if}
	<div class="page">{@render children?.()}</div>
</div>

<style>
	@layer oito2 {
		.oito2-navigation-page {
			display: flex;
			min-width: 0;
			min-height: 0;
		}

		[data-layout='bar'] {
			flex-direction: column;
		}

		[data-layout='bar'] > :global(.oito2-navigation-page-bar) {
			order: 1;
		}

		.separator {
			flex: none;
			width: 1px;
			background: var(--oito2-color-outline-variant);
		}

		.page {
			position: relative;
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			min-height: 0;
		}
	}
</style>
