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
  The header of a `Section.Root`: the `headline`, which labels the section, and optional
  `actions` at the end of the row, such as buttons.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useSection } from './section-context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The section title. */
		headline?: string | Snippet;
		/** The heading level of the headline. Defaults to 2. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Content at the end of the row, such as buttons. */
		actions?: Snippet;
		/** The header element. */
		ref?: HTMLDivElement | null;
	}

	let {
		headline,
		level = 2,
		actions,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const section = useSection();

	$effect(() => {
		if (!section) return;
		section.hasHeadline = headline !== undefined;
		return () => {
			section.hasHeadline = false;
		};
	});
</script>

<div bind:this={ref} class={['oito2-section-header', className]} {...rest}>
	<span class="headline" role="heading" aria-level={level} id={section?.headlineId}>
		{#if typeof headline === 'string'}{headline}{:else}{@render headline?.()}{/if}
	</span>
	{#if actions}<span class="actions">{@render actions()}</span>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-section-header {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			padding-inline-start: var(--oito2-space-xs);
		}

		.headline {
			flex: 1;
			min-width: 0;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
		}

		.actions {
			display: inline-flex;
			flex: none;
			align-items: center;
			gap: var(--oito2-space-xs);
		}
	}
</style>
