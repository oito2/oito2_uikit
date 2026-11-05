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
  The heading of a `ListBox.Group`, which names the group for assistive technologies.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useListBoxGroup } from '../list-box-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The heading text. */
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const id = useListBoxGroup();
</script>

<div {id} role="presentation" class={['oito2-list-box-group-label', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-list-box-group-label {
			padding: var(--oito2-space-sm) var(--oito2-space-sm) var(--oito2-space-xxs);
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-medium);
			letter-spacing: var(--oito2-type-label-medium-tracking);
		}
	}
</style>
