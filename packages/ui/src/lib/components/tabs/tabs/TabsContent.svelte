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
  The panel of the tab with `value`, rendered only while that tab is selected.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTabs } from '../tabs-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the tab this panel belongs to. */
		value: string;
		/** The panel element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let { value, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const tabs = useTabs();
	$effect.pre(() => tabs.addContent(value));
</script>

{#if tabs.value === value}
	<div
		bind:this={ref}
		role="tabpanel"
		id={tabs.contentId(value)}
		aria-labelledby={tabs.triggerId(value)}
		tabindex="0"
		class={['oito2-tabs-content', className]}
		{...rest}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-tabs-content {
			flex: 1;
			min-width: 0;
			min-height: 0;
		}

		.oito2-tabs-content:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: calc(-1 * var(--oito2-size-focus-border-width));
		}
	}
</style>
