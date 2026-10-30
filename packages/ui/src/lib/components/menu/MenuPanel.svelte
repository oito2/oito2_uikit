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
  The floating panel of a menu or a select (internal): rendered over the page next to its
  anchor in the surface container color with an outline and a shadow, with the menu
  keyboard, dismissal and focus restoration.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../internal/Portal.svelte';
	import { dismissableLayer, type DismissReason } from '../../internal/dismissable-layer.js';
	import { floating, type Placement } from '../../internal/floating.js';
	import { focusScope } from '../../internal/focus-scope.js';
	import { Presence } from '../../internal/presence.svelte.js';
	import { menuList } from './menu-list.js';
	import type { InitialFocus } from './menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		open: boolean;
		anchor: HTMLElement | null;
		role: 'menu' | 'listbox';
		placement: Placement;
		offset?: number;
		sameWidth?: boolean;
		initialFocus: InitialFocus;
		preferred?: () => HTMLElement | null | undefined;
		/** Elements that count as inside the panel for outside clicks, such as the trigger. */
		inside?: () => (HTMLElement | null)[];
		onDismiss: (reason: DismissReason, event: Event) => void;
		onTab: () => void;
		ref?: HTMLElement | null;
		children?: Snippet;
	}

	let {
		open,
		anchor,
		role,
		placement,
		offset = 4,
		sameWidth = false,
		initialFocus,
		preferred,
		inside,
		onDismiss,
		onTab,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const presence = new Presence(() => open);
</script>

{#if presence.present && anchor}
	<Portal>
		<div
			bind:this={ref}
			{role}
			tabindex="-1"
			class={['oito2-menu-panel', className]}
			data-state={open ? 'open' : 'closed'}
			data-same-width={sameWidth ? '' : undefined}
			{@attach floating(() => anchor, { placement, offset, sameWidth })}
			{@attach presence.attach}
			{@attach focusScope({ autoFocus: false })}
			{@attach dismissableLayer({ onDismiss, inside })}
			{@attach menuList({ initialFocus, preferred, onTab })}
			{...rest}
		>
			{@render children?.()}
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-menu-panel {
			z-index: 1000;
			box-sizing: border-box;
			min-width: 112px;
			max-width: min(320px, var(--oito2-available-width, 320px));
			max-height: var(--oito2-available-height, 480px);
			overflow-y: auto;
			padding: var(--oito2-space-xs) 0;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			outline: none;
			background: var(--oito2-color-surface-container);
			color: var(--oito2-color-on-surface);
			box-shadow:
				0 2px 6px 2px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
			animation: oito2-menu-in 120ms ease-out;
		}

		[data-same-width] {
			max-width: none;
		}

		[data-state='closed'] {
			animation: oito2-menu-out 100ms ease-in forwards;
		}

		@keyframes oito2-menu-in {
			from {
				opacity: 0;
				scale: 0.97;
			}
		}

		@keyframes oito2-menu-out {
			to {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-menu-panel,
			[data-state='closed'] {
				animation: none;
			}
		}
	}
</style>
