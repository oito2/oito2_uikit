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
  A line between groups of menu items.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();
</script>

<div role="separator" class={['oito2-menu-separator', className]} {...rest}></div>

<style>
	@layer oito2 {
		.oito2-menu-separator {
			height: 1px;
			margin: var(--oito2-space-xs) 0;
			background: var(--oito2-color-outline-variant);
		}
	}
</style>
