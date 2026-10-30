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
  The element a tooltip describes. Pass `child` to render your own element with the props
  it receives (the handlers, `aria-describedby` and an attachment), so the tooltip binds to
  a button directly; otherwise `children` are wrapped in an inline element.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useTooltip } from './tooltip-state.svelte.js';

	interface Props {
		/** Renders the trigger element with the props to spread on it. */
		child?: Snippet<[{ props: Record<string | symbol, unknown> }]>;
		/** The content to wrap when there is no `child`. */
		children?: Snippet;
	}

	let { child, children }: Props = $props();

	const tooltip = useTooltip();
</script>

{#if child}
	{@render child({ props: tooltip.triggerProps })}
{:else}
	<span class="oito2-tooltip-trigger" {...tooltip.triggerProps}>{@render children?.()}</span>
{/if}

<style>
	@layer oito2 {
		.oito2-tooltip-trigger {
			display: inline-flex;
		}
	}
</style>
