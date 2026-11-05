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
  The button of a navigation menu item that opens its `NavigationMenu.Content`: on hover,
  on a click or on the Down arrow, the last two moving the focus into the panel.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Popover } from '@oito2/ui';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useNavigationMenu, useNavigationMenuItem } from '../navigation-menu-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The label. */
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const menu = useNavigationMenu();
	const value = useNavigationMenuItem();
	let open = $derived(menu.open === value());
</script>

<Popover.Trigger>
	{#snippet child({ props })}
		<button
			type="button"
			class={['oito2-navigation-menu-trigger', className]}
			data-current={menu.current === value() ? '' : undefined}
			{...rest}
			{...props}
			onclick={() => menu.show(open ? null : value(), true)}
			onpointerenter={(event) => {
				if (event.pointerType === 'mouse') menu.hover(value());
			}}
			onpointerleave={(event) => {
				if (event.pointerType === 'mouse') menu.leave();
			}}
			onkeydown={(event) => {
				if (event.key === 'ArrowDown') {
					event.preventDefault();
					menu.show(value(), true);
				}
			}}
		>
			{@render children()}
			<span class="oito2-navigation-menu-chevron" aria-hidden="true"><ChevronDown /></span>
		</button>
	{/snippet}
</Popover.Trigger>

<style>
	@layer oito2 {
		.oito2-navigation-menu-trigger {
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-xs);
			height: var(--oito2-control-height);
			padding: 0 var(--oito2-space-md);
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			cursor: pointer;
		}

		.oito2-navigation-menu-trigger:hover,
		.oito2-navigation-menu-trigger[data-state='open'] {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 8%, transparent);
		}

		.oito2-navigation-menu-trigger:focus-visible {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
		}

		.oito2-navigation-menu-trigger[data-current] {
			color: var(--oito2-color-primary-text);
		}

		.oito2-navigation-menu-chevron {
			display: inline-flex;
			transition: transform 150ms ease;
		}

		.oito2-navigation-menu-chevron :global(svg) {
			width: 16px;
			height: 16px;
		}

		[data-state='open'] > .oito2-navigation-menu-chevron {
			transform: rotate(180deg);
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-navigation-menu-chevron {
				transition: none;
			}
		}
	}
</style>
