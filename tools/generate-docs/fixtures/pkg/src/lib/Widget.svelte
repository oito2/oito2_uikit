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
  A widget with a `label`, rendered in a `mode`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Mode } from './css.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The text shown. */
		label: string;
		/** How dense the widget is. */
		mode?: Mode;
		/** Whether the widget is open. */
		open?: boolean;
		/** Called when the widget toggles. */
		onToggle?: (open: boolean) => void;
		/** Extra content. */
		children?: Snippet;
	}

	let {
		label,
		mode = 'compact',
		open = $bindable(false),
		onToggle,
		children,
		...rest
	}: Props = $props();
</script>

<div {...rest} data-mode={mode}>
	<button type="button" onclick={() => ((open = !open), onToggle?.(open))}>{label}</button>
	{#if open}{@render children?.()}{/if}
</div>
