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
  A small pill-shaped label tinted by its `type`, for statuses and counters.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { InfoType } from './info-type.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The kind of status. */
		type: InfoType;
		/** The badge text; replaced by `children` when given. */
		label?: string;
		/** The badge element. */
		ref?: HTMLSpanElement | null;
		/** Custom badge content. */
		children?: Snippet;
	}

	let {
		type,
		label,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<span bind:this={ref} class={['oito2-info-badge', className]} data-type={type} {...rest}>
	{#if children}{@render children()}{:else}{label}{/if}
</span>

<style>
	@layer oito2 {
		.oito2-info-badge {
			display: inline-flex;
			align-items: center;
			padding: var(--oito2-space-xxs) var(--oito2-space-sm);
			border-radius: 999px;
			background: var(--oito2-color-info-badge-information);
			color: var(--oito2-color-info-badge-text-information);
			font: var(--oito2-type-label-medium);
			font-weight: 600;
			letter-spacing: var(--oito2-type-label-medium-tracking);
			white-space: nowrap;
		}

		[data-type='success'] {
			background: var(--oito2-color-info-badge-success);
			color: var(--oito2-color-info-badge-text-success);
		}

		[data-type='warning'] {
			background: var(--oito2-color-info-badge-warning);
			color: var(--oito2-color-info-badge-text-warning);
		}

		[data-type='danger'] {
			background: var(--oito2-color-info-badge-danger);
			color: var(--oito2-color-info-badge-text-danger);
		}

		[data-type='important'] {
			background: var(--oito2-color-info-badge-important);
			color: var(--oito2-color-info-badge-text-important);
		}
	}
</style>
