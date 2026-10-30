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
  The button that opens a menu: a `Button` (outlined by default) with the given props and
  label, or, with `child`, your own element with the props it receives. Enter, Space and
  Down open the menu on its first item, Up on its last.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import type { IconComponent } from '../../icon.js';
	import { useMenu } from '../menu-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of the button. Defaults to `outlined`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** An icon before the label. */
		icon?: IconComponent;
		/** Renders the trigger element with the props to spread on it. */
		child?: Snippet<[{ props: Record<string | symbol, unknown> }]>;
		/** The label. */
		children?: Snippet;
	}

	let { variant = 'outlined', child, children, ...rest }: Props = $props();

	const menu = useMenu();
	const attachKey = createAttachmentKey();
	const attach = (node: HTMLElement) => {
		menu.trigger = node;
		return () => {
			if (menu.trigger === node) menu.trigger = null;
		};
	};

	let triggerProps = $derived({
		id: `${menu.id}-trigger`,
		'aria-haspopup': 'menu' as const,
		'aria-expanded': menu.open,
		'aria-controls': menu.open ? `${menu.id}-content` : undefined,
		'data-state': menu.open ? 'open' : 'closed',
		onclick: () => (menu.open ? menu.hide() : menu.show('first')),
		onkeydown: (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				menu.show(event.key === 'ArrowUp' ? 'last' : 'first');
			}
		},
		[attachKey]: attach
	});
</script>

{#if child}
	{@render child({ props: triggerProps })}
{:else}
	<Button {variant} {...rest} {...triggerProps}>{@render children?.()}</Button>
{/if}
