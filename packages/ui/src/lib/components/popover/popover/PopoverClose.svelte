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
  A button inside a popover that closes it: a `CloseButton`, or a `Button` with the given
  label as children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import CloseButton from '../../button/CloseButton.svelte';
	import { usePopover } from '../popover-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of a labeled button. Defaults to `text`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** The label; without it the button is an X. */
		children?: Snippet;
	}

	let { variant = 'text', children, onclick, ...rest }: Props = $props();

	const popover = usePopover();

	function close(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (!event.defaultPrevented) popover.controller.close();
	}
</script>

{#if children}
	<Button {variant} onclick={close} {...rest}>{@render children()}</Button>
{:else}
	<CloseButton onclick={close} {...rest} />
{/if}
