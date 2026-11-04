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
  A button inside a sheet that closes it: a `Button` with the children as its label, or a
  `CloseButton` without them.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import CloseButton from '../../button/CloseButton.svelte';
	import { useSheet } from '../sheet-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of a labeled button. Defaults to `text`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** The label. */
		children?: Snippet;
	}

	let { variant = 'text', children, ...rest }: Props = $props();

	const sheet = useSheet();
</script>

{#if children}
	<Button {variant} onclick={() => (sheet.open = false)} {...rest}>{@render children()}</Button>
{:else}
	<CloseButton onclick={() => (sheet.open = false)} {...rest} />
{/if}
