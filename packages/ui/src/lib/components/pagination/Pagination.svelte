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
  Page navigation: previous and next buttons around page number buttons with ellipses,
  and an optional page size selector. Narrower than `compactWidth` it shows only the
  buttons around "Page 3 of 10". Pages count from 1. Bind `page`, or listen to
  `onPageChange`.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ListCollection } from '../../collections/list-collection.js';
	import { useLocale } from '../../l10n/locale.js';
	import { materialStrings } from '../../l10n/material.js';
	import IconButton from '../button/IconButton.svelte';
	import type { IconComponent } from '../icon.js';
	import * as Select from '../select/select/index.js';
	import { paginationItems } from './pagination-items.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The current page, from 1. */
		page?: number;
		/** The number of pages. */
		pageCount: number;
		/** Called with the page to show. */
		onPageChange?: (page: number) => void;
		/** The pages shown on each side of the current one. Defaults to 1. */
		siblingCount?: number;
		/** The pages always shown at each end. Defaults to 1. */
		boundaryCount?: number;
		/** The current page size; one of `pageSizes`. */
		pageSize?: number;
		/** The page sizes offered; the selector shows when it has entries. */
		pageSizes?: readonly number[];
		/** Called with the chosen page size. */
		onPageSizeChange?: (pageSize: number) => void;
		/** The width below which the compact form shows, in pixels. Defaults to 420. */
		compactWidth?: number;
		/** Whether the buttons can't be used. */
		disabled?: boolean;
		/** The pagination element, a `nav`. */
		ref?: HTMLElement | null;
	}

	let {
		page = $bindable(1),
		pageCount,
		onPageChange,
		siblingCount = 1,
		boundaryCount = 1,
		pageSize = $bindable(),
		pageSizes = [],
		onPageSizeChange,
		compactWidth = 420,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let width = $state(Number.POSITIVE_INFINITY);
	let compact = $derived(width < compactWidth);
	let count = $derived(Math.max(1, pageCount));
	let current = $derived(Math.min(Math.max(1, page), count));
	let items = $derived(paginationItems(current, count, { siblingCount, boundaryCount }));
	let sizes = $derived(new ListCollection(pageSizes.map(String)));
	let material = $derived(materialStrings(locale.locale));

	/** Shows `target` when it is another page. */
	function go(target: number) {
		if (disabled || target < 1 || target > count || target === current) return;
		page = target;
		onPageChange?.(target);
	}
</script>

<nav bind:this={ref} bind:clientWidth={width} class={['oito2-pagination', className]} {...rest}>
	<div class="pages">
		<IconButton
			class="oito2-pagination-arrow"
			icon={ChevronLeft as IconComponent}
			label={material.previousPage}
			disabled={disabled || current <= 1}
			onclick={() => go(current - 1)}
		/>
		{#if compact}
			<span class="summary">{locale.strings.pageOf(current, count)}</span>
		{:else}
			{#each items as item, index (index)}
				{#if item === null}
					<span class="ellipsis" aria-hidden="true">…</span>
				{:else}
					<button
						type="button"
						class="page"
						aria-label={locale.strings.pageNumber(item)}
						aria-current={item === current ? 'page' : undefined}
						data-state={item === current ? 'active' : undefined}
						{disabled}
						onclick={() => go(item)}
					>
						{item}
					</button>
				{/if}
			{/each}
		{/if}
		<IconButton
			class="oito2-pagination-arrow"
			icon={ChevronRight as IconComponent}
			label={material.nextPage}
			disabled={disabled || current >= count}
			onclick={() => go(current + 1)}
		/>
	</div>
	{#if pageSizes.length > 0 && (onPageSizeChange || pageSize !== undefined)}
		<div class="sizes">
			<span class="sizes-label">{locale.strings.itemsPerPage}</span>
			<Select.Root
				collection={sizes}
				label={locale.strings.itemsPerPage}
				value={String(pageSize ?? pageSizes[0])}
				{disabled}
				onValueChange={(next) => {
					if (next === null) return;
					pageSize = Number(next);
					onPageSizeChange?.(Number(next));
				}}
			/>
		</div>
	{/if}
</nav>

<style>
	@layer oito2 {
		.oito2-pagination {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--oito2-space-sm) var(--oito2-space-lg);
		}

		.pages {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-xxs);
		}

		.oito2-pagination :global(.oito2-pagination-arrow:dir(rtl) svg) {
			scale: -1 1;
		}

		.summary {
			padding: 0 var(--oito2-space-sm);
			color: var(--oito2-color-on-surface);
		}

		.ellipsis {
			width: 24px;
			color: var(--oito2-color-on-surface);
			text-align: center;
		}

		.page {
			position: relative;
			min-width: var(--oito2-control-height);
			height: var(--oito2-control-height);
			margin: 0;
			padding: 0 var(--oito2-space-sm);
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			font-variant-numeric: tabular-nums;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.page::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		.page:not(:disabled):hover::after {
			opacity: 0.08;
		}

		.page:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.page[data-state='active'] {
			background: var(--oito2-color-selected-fill);
			color: var(--oito2-color-on-selected-fill);
		}

		.page:disabled {
			opacity: 0.38;
			cursor: default;
		}

		.sizes {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			min-width: 0;
		}

		.sizes > :global(*:last-child) {
			width: 96px;
		}

		.sizes-label {
			min-width: 0;
			overflow: hidden;
			color: var(--oito2-color-on-surface);
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
</style>
