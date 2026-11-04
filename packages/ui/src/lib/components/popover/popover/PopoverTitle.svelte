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
  The title of a popover panel, which names the panel for assistive technologies.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePopover } from '../popover-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
		/** The text. */
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const popover = usePopover();
	$effect(() => {
		popover.hasTitle = true;
		return () => (popover.hasTitle = false);
	});
</script>

<h2 id="{popover.id}-title" class={['oito2-popover-title', className]} {...rest}>
	{@render children()}
</h2>

<style>
	@layer oito2 {
		.oito2-popover-title {
			margin: 0 0 var(--oito2-space-sm);
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
		}
	}
</style>
