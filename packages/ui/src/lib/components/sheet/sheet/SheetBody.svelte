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
  The scrolling body of a sheet, with large padding.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The content. */
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div class={['oito2-sheet-body', className]} {...rest}>{@render children?.()}</div>

<style>
	@layer oito2 {
		.oito2-sheet-body {
			flex: 1;
			min-height: 0;
			overflow: auto;
			padding: var(--oito2-space-lg);
		}
	}
</style>
