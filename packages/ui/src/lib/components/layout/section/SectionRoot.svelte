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
  A titled group of content: a `Section.Header` with the headline and optional actions
  above a `Section.Content` in a bordered container. The section is a `section` element
  labeled by its header's headline.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSection } from './section-context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The section element. */
		ref?: HTMLElement | null;
		/** The header and the content. */
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const id = $props.id();
	const section = setSection(id);
</script>

<section
	bind:this={ref}
	aria-labelledby={section.hasHeadline ? section.headlineId : undefined}
	class={['oito2-section', className]}
	{...rest}
>
	{@render children?.()}
</section>

<style>
	@layer oito2 {
		.oito2-section {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-sm);
		}
	}
</style>
