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
  Places the popover panel against this element instead of the trigger, such as a whole
  field whose button opens the popover.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { usePopover } from '../popover-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The content. */
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const popover = usePopover();
</script>

<div
	class={['oito2-popover-anchor', className]}
	{@attach (node) => {
		popover.anchor = node;
		return () => {
			if (popover.anchor === node) popover.anchor = null;
		};
	}}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-popover-anchor {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}
	}
</style>
