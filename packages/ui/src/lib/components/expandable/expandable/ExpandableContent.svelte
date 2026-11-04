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
  The content of an expandable section: a region labeled by the trigger, which grows and
  shrinks as it is shown and hidden. `collapsed` shows instead while closed, such as a
  summary.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useExpandable } from '../expandable-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Content shown while closed, such as a summary. */
		collapsed?: Snippet;
		/** The region element. */
		ref?: HTMLDivElement | null;
		/** The content shown while open. */
		children?: Snippet;
	}

	let { collapsed, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const expandable = useExpandable();
</script>

<div
	bind:this={ref}
	id={expandable.contentId}
	role="region"
	aria-labelledby={expandable.triggerId}
	class={['oito2-expandable-content', className]}
	data-state={expandable.open ? 'open' : 'closed'}
	{...rest}
>
	<div class="clip"><div class="inner">{@render children?.()}</div></div>
</div>
{#if collapsed && !expandable.open}
	<div class="oito2-expandable-collapsed">{@render collapsed()}</div>
{/if}

<style>
	@layer oito2 {
		.oito2-expandable-content {
			display: grid;
			grid-template-rows: 1fr;
			transition:
				grid-template-rows 200ms ease-in-out,
				visibility 200ms;
		}

		.oito2-expandable-content[data-state='closed'] {
			grid-template-rows: 0fr;
			visibility: hidden;
		}

		.clip {
			min-height: 0;
			overflow: hidden;
		}

		.inner,
		.oito2-expandable-collapsed {
			padding-top: var(--oito2-expandable-gap, var(--oito2-space-xs));
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-expandable-content {
				transition: none;
			}
		}
	}
</style>
