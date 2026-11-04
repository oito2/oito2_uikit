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
  The area a context menu belongs to. The browser's own menu doesn't open over it unless
  `disabled`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMenu } from '../../menu/menu-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the menu can't open; the browser's menu shows instead. */
		disabled?: boolean;
		/** The area element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children: Snippet;
	}

	let {
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const menu = useMenu();
	let point = $state<{ x: number; y: number } | null>(null);
	let press: ReturnType<typeof setTimeout> | undefined;

	/** Opens the menu at `at`, or over the middle of the area from the keyboard. */
	function open(at: { x: number; y: number } | null) {
		if (disabled || !ref) return;
		if (at) point = at;
		else {
			const box = ref.getBoundingClientRect();
			point = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
		}
		menu.show(at ? 'none' : 'first');
	}
</script>

<div
	bind:this={ref}
	class={['oito2-context-menu-trigger', className]}
	data-state={menu.open ? 'open' : 'closed'}
	oncontextmenu={(event) => {
		if (disabled) return;
		event.preventDefault();
		open({ x: event.clientX, y: event.clientY });
	}}
	onkeydown={(event) => {
		if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
			event.preventDefault();
			open(null);
		}
	}}
	onpointerdown={(event) => {
		if (event.pointerType === 'mouse') return;
		const at = { x: event.clientX, y: event.clientY };
		press = setTimeout(() => open(at), 500);
	}}
	onpointerup={() => clearTimeout(press)}
	onpointercancel={() => clearTimeout(press)}
	onpointermove={() => clearTimeout(press)}
	role="presentation"
	{...rest}
>
	{@render children()}
	{#if point}
		<span
			class="point"
			style:left="{point.x}px"
			style:top="{point.y}px"
			{@attach (node) => {
				menu.trigger = node;
				return () => {
					if (menu.trigger === node) menu.trigger = null;
				};
			}}
		></span>
	{/if}
</div>

<style>
	@layer oito2 {
		.point {
			position: fixed;
			width: 0;
			height: 0;
			pointer-events: none;
		}
	}
</style>
