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
  The footer of a card: its actions, aligned to the end.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		class: className,
		children,
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { children?: Snippet } = $props();
</script>

<div class={['oito2-card-footer', className]} {...rest}>{@render children?.()}</div>

<style>
	@layer oito2 {
		.oito2-card-footer {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-end;
			gap: var(--oito2-space-sm);
			padding: 0 var(--oito2-space-lg) var(--oito2-space-lg);
		}
	}
</style>
