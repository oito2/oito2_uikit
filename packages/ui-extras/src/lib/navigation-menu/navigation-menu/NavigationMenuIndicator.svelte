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
  The line that slides under the `current` item of a navigation menu; place it inside
  `NavigationMenu.Root`, next to the list. It is hidden from assistive technologies.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useNavigationMenu } from '../navigation-menu-state.svelte.js';

	let { class: className, ...rest }: Omit<HTMLAttributes<HTMLSpanElement>, 'children'> = $props();

	const menu = useNavigationMenu();
	let rect: { left: number; top: number; width: number } | null = $state(null);
	let element: HTMLSpanElement | null = $state(null);

	// Measures the current item against the menu and follows its size and position.
	$effect(() => {
		const current = menu.current;
		const item = current === null ? undefined : menu.items.get(current);
		const root = element?.offsetParent;
		if (!item || !(root instanceof HTMLElement)) {
			rect = null;
			return;
		}
		const measure = () => {
			const outer = root.getBoundingClientRect();
			const inner = item.getBoundingClientRect();
			rect = {
				left: inner.left - outer.left,
				top: inner.bottom - outer.top,
				width: inner.width
			};
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(item);
		observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<span
	bind:this={element}
	class={['oito2-navigation-menu-indicator', className]}
	aria-hidden="true"
	data-state={rect ? 'visible' : 'hidden'}
	style:left="{(rect?.left ?? 0) + 8}px"
	style:top="{(rect?.top ?? 0) - 2}px"
	style:width="{Math.max(0, (rect?.width ?? 0) - 16)}px"
	{...rest}
></span>

<style>
	@layer oito2 {
		.oito2-navigation-menu-indicator {
			position: absolute;
			height: 2px;
			border-radius: 1px;
			background: var(--oito2-color-primary-text);
			pointer-events: none;
			transition:
				left 220ms cubic-bezier(0.215, 0.61, 0.355, 1),
				width 220ms cubic-bezier(0.215, 0.61, 0.355, 1);
		}

		[data-state='hidden'] {
			visibility: hidden;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-navigation-menu-indicator {
				transition: none;
			}
		}
	}
</style>
