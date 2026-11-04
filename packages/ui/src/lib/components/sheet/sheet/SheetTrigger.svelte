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
  The button that opens a sheet: a `Button` (tonal by default) with the given props and
  label.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../../button/Button.svelte';
	import type { IconComponent } from '../../icon.js';
	import { useSheet } from '../sheet-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The emphasis of the button. Defaults to `tonal`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** An icon before the label. */
		icon?: IconComponent;
		/** The label. */
		children?: Snippet;
	}

	let { variant = 'tonal', onclick, children, ...rest }: Props = $props();

	const sheet = useSheet();
</script>

<Button
	{variant}
	aria-haspopup="dialog"
	aria-expanded={sheet.open}
	onclick={(event) => {
		onclick?.(event as MouseEvent & { currentTarget: EventTarget & HTMLButtonElement });
		if (!event.defaultPrevented) sheet.open = true;
	}}
	{...rest}
>
	{@render children?.()}
</Button>
