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
  The header of a card: a `title`, an optional `description` and optional `actions` at the
  end, or any content as `children`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
		/** The title. */
		title?: string | Snippet;
		/** A line under the title. */
		description?: string | Snippet;
		/** Controls at the end of the header, such as an icon button. */
		actions?: Snippet;
		/** Content after the title and description. */
		children?: Snippet;
	}

	let { title, description, actions, class: className, children, ...rest }: Props = $props();
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<div class={['oito2-card-header', className]} {...rest}>
	<div class="text">
		{#if title}<div class="title">{@render text(title)}</div>{/if}
		{#if description}<div class="description">{@render text(description)}</div>{/if}
		{@render children?.()}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-card-header {
			display: flex;
			align-items: flex-start;
			gap: var(--oito2-space-sm);
			padding: var(--oito2-space-lg) var(--oito2-space-lg) 0;
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--oito2-space-xxs);
			min-width: 0;
		}

		.title {
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
		}

		.description {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		.actions {
			display: flex;
			flex: none;
			gap: var(--oito2-space-xs);
			margin-block: calc(-1 * var(--oito2-space-xs));
		}
	}
</style>
