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
  A button that closes the dialog: a `Button` with the given label (a text button by
  default), the X icon button without one, or, with `child`, your own element.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import CloseButton from '../../button/CloseButton.svelte';
	import { useDialog } from '../dialog-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of a labeled button. Defaults to \`text\`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** Renders the element with the props to spread on it. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		/** The label; without one the button shows an X. */
		children?: Snippet;
	}

	let { child, children, variant = 'text', onclick, ...rest }: Props = $props();

	const dialog = useDialog();
	const closeProps = {
		onclick: (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
			onclick?.(event);
			if (!event.defaultPrevented) dialog.open = false;
		}
	};
</script>

{#if child}
	{@render child({ props: closeProps })}
{:else if children}
	<Button {variant} {...rest} {...closeProps}>{@render children()}</Button>
{:else}
	<CloseButton {...closeProps} />
{/if}
