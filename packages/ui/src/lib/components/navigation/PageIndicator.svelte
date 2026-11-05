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
  Dots showing the current page of a carousel or a paged view. The current page is a
  wider pill in the text-safe primary tone. With `onPageChange` (or `interactive`) each
  dot is a button; the current one is the group's Tab stop, and the arrow keys, Home and
  End change the page. When the dots don't fit the width, it shows "page / length" instead.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf, navigationIntent } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import { pageIndicatorGeometry, type PageIndicatorLayout } from './page-indicator-layout.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The number of pages. */
		length: number;
		/** The current page, from 0. */
		page?: number;
		/** Called with the page of the activated dot or key. */
		onPageChange?: (page: number) => void;
		/** Whether the dots are buttons. Defaults to whether `onPageChange` is set. */
		interactive?: boolean;
		/** The diameter of the dots, in pixels. Defaults to 8. */
		dotSize?: number;
		/** The space between dots, in pixels; `layout` may reduce it. Defaults to 8. */
		spacing?: number;
		/** How the dots are spaced. Defaults to `fixed`. */
		layout?: PageIndicatorLayout;
		/**
		 * The smallest width and height of an interactive dot's target, in pixels; the
		 * spacing absorbs as much of it as it can. Defaults to 24.
		 */
		minTargetSize?: number;
		/** Builds the label of a dot from its 1-based page and the count. Defaults to "Page 2 of 5". */
		pageLabel?: (page: number, length: number) => string;
		/** The accessible name of the group of interactive dots, such as "Slides". */
		label?: string;
		/** The indicator element. */
		ref?: HTMLDivElement | null;
	}

	let {
		length,
		page = $bindable(0),
		onPageChange,
		interactive,
		dotSize = 8,
		spacing = 8,
		layout = 'fixed',
		minTargetSize = 24,
		pageLabel,
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let width = $state(Number.POSITIVE_INFINITY);
	let active = $derived(interactive ?? onPageChange !== undefined);
	let pageText = $derived(pageLabel ?? ((p: number, n: number) => locale.strings.pageOf(p, n)));
	let current = $derived(Math.min(Math.max(0, page), Math.max(0, length - 1)));
	let geometry = $derived(
		pageIndicatorGeometry({
			length,
			dotSize,
			spacing,
			layout,
			interactive: active,
			minTargetSize,
			availableWidth: width
		})
	);

	/** Moves to `target` when it is another valid page. */
	function go(target: number) {
		if (target < 0 || target >= length || target === current) return;
		page = target;
		onPageChange?.(target);
	}

	/**
	 * Changes the page with the arrow keys, Home and End while a dot has focus, and moves
	 * focus to the new current dot.
	 */
	const keyboard: Attachment<HTMLDivElement> = (group) => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
			const intent = navigationIntent(event.key, {
				orientation: 'horizontal',
				dir: directionOf(group)
			});
			if (!intent) return;
			event.preventDefault();
			go(
				intent === 'first'
					? 0
					: intent === 'last'
						? length - 1
						: current + (intent === 'next' ? 1 : -1)
			);
			void tick().then(() => group.querySelector<HTMLElement>('[data-selected]')?.focus());
		};
		group.addEventListener('keydown', onKeyDown);
		return () => group.removeEventListener('keydown', onKeyDown);
	};
</script>

<div bind:this={ref} bind:clientWidth={width} class={['oito2-page-indicator', className]} {...rest}>
	{#if geometry.fits}
		<div
			class="dots"
			role={active ? 'group' : 'img'}
			aria-label={active ? label : pageText(current + 1, length)}
			data-interactive={active ? '' : undefined}
			style:gap="{geometry.gap}px"
			{@attach active ? keyboard : undefined}
		>
			{#each { length }, index (index)}
				{@const selected = index === current}
				<svelte:element
					this={active ? 'button' : 'span'}
					type={active ? 'button' : undefined}
					tabindex={active ? (selected ? 0 : -1) : undefined}
					aria-label={active ? pageText(index + 1, length) : undefined}
					aria-current={active && selected ? 'step' : undefined}
					aria-hidden={active ? undefined : 'true'}
					class="box"
					data-selected={selected ? '' : undefined}
					style:width="{selected ? geometry.selectedBox : geometry.dotBox}px"
					style:height="{geometry.boxHeight}px"
					onclick={active ? () => go(index) : undefined}
				>
					<span
						class="dot"
						style:width="{selected ? geometry.selectedWidth : dotSize}px"
						style:height="{dotSize}px"
					></span>
				</svelte:element>
			{/each}
		</div>
	{:else}
		<span class="text" role="img" aria-label={pageText(current + 1, length)}>
			{current + 1} / {length}
		</span>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-page-indicator {
			display: flex;
			justify-content: center;
			min-width: 0;
		}

		.dots {
			display: flex;
			align-items: center;
			border-radius: var(--oito2-radius-small);
		}

		.box:focus-visible {
			border-radius: var(--oito2-radius-small);
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.box {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			margin: 0;
			padding: 0;
			border: none;
			background: none;
			transition: width 200ms ease-out;
		}

		[data-interactive] .box {
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.dot {
			border-radius: 999px;
			background: var(--oito2-color-outline);
			transition:
				width 200ms ease-out,
				background-color 200ms ease-out;
		}

		[data-selected] .dot {
			background: var(--oito2-color-primary-text);
		}

		.text {
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-medium);
			letter-spacing: var(--oito2-type-label-medium-tracking);
		}

		@media (prefers-reduced-motion: reduce) {
			.box,
			.dot {
				transition: none;
			}
		}
	}
</style>
