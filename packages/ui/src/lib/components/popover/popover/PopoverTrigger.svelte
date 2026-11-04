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
  The button that opens and closes a popover: a `Button` (tonal by default) with the given
  props and label, or, with `child`, your own element with the props it receives.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import type { IconComponent } from '../../icon.js';
	import { usePopover } from '../popover-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of the button. Defaults to `tonal`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** An icon before the label. */
		icon?: IconComponent;
		/** Renders the trigger element with the props to spread on it. */
		child?: Snippet<[{ props: Record<string | symbol, unknown> }]>;
		/** The label. */
		children?: Snippet;
	}

	let { variant = 'tonal', child, children, ...rest }: Props = $props();

	const popover = usePopover();
	const attachKey = createAttachmentKey();
	const attach = (node: HTMLElement) => {
		popover.trigger = node;
		return () => {
			if (popover.trigger === node) popover.trigger = null;
		};
	};

	let triggerProps = $derived({
		'aria-haspopup': 'dialog' as const,
		'aria-expanded': popover.open,
		'aria-controls': popover.open ? `${popover.id}-content` : undefined,
		'data-state': popover.open ? 'open' : 'closed',
		onclick: () => popover.controller.toggle(),
		[attachKey]: attach
	});
</script>

{#if child}
	{@render child({ props: triggerProps })}
{:else}
	<Button {variant} {...rest} {...triggerProps}>{@render children?.()}</Button>
{/if}
