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
  A bar of filter chips for picking one or more options. A selected chip shows the
  secondary container fill and, with `showCheckmark`, a check mark before its label. In
  the `row` style the chips scroll horizontally, and arrow buttons appear only on the
  sides with hidden chips; in the `wrap` style they wrap onto several rows. Unless
  `multiple`, selecting a chip unselects the others. Bind `value`, or set `defaultValue`
  and listen to `onValueChange`.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../../internal/controllable.svelte.js';
	import { directionOf } from '../../../internal/keyboard.js';
	import { useLocale } from '../../../l10n/locale.js';
	import IconButton from '../../button/IconButton.svelte';
	import type { IconComponent } from '../../icon.js';
	import { toggleValues } from '../toggle-group/toggle-group-state.svelte.js';
	import { setChoiceChipBar } from './choice-chip-bar-context.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The values of the selected chips. */
		value?: readonly string[];
		/** The selected chips of an uncontrolled bar. Defaults to none. */
		defaultValue?: readonly string[];
		/** Called with the selected values after each change. */
		onValueChange?: (value: readonly string[]) => void;
		/** Whether several chips can be selected at once. Defaults to false. */
		multiple?: boolean;
		/** How chips that don't fit are laid out. Defaults to `row`. */
		layout?: 'row' | 'wrap';
		/** The space between chips, in pixels. Defaults to 8. */
		spacing?: number;
		/** How far one arrow button press scrolls, in pixels. Defaults to 200. */
		scrollStep?: number;
		/** The name of the backward arrow. Defaults to "Scroll back". */
		previousLabel?: string;
		/** The name of the forward arrow. Defaults to "Scroll forward". */
		nextLabel?: string;
		/** Whether a selected chip shows a check mark. Defaults to true. */
		showCheckmark?: boolean;
		/** Whether the chips are pill-shaped instead of rounded rectangles. */
		pill?: boolean;
		/** Whether every chip is disabled. */
		disabled?: boolean;
		/** The bar element. */
		ref?: HTMLDivElement | null;
		/** The `ChoiceChipBar.Item`s. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = [],
		onValueChange,
		multiple = false,
		layout = 'row',
		spacing = 8,
		scrollStep = 200,
		previousLabel,
		nextLabel,
		showCheckmark = true,
		pill = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const selection = new Controllable({
		value: () => value,
		defaultValue: () => defaultValue,
		onChange: (next: readonly string[]) => {
			value = next;
			onValueChange?.(next);
		}
	});
	setChoiceChipBar({
		get value() {
			return selection.current;
		},
		get showCheckmark() {
			return showCheckmark;
		},
		get disabled() {
			return disabled;
		},
		toggle(item) {
			const next = toggleValues(selection.current, item, multiple, true);
			if (next) selection.current = next;
		}
	});

	let scroller = $state<HTMLDivElement | null>(null);
	let canGoBack = $state(false);
	let canGoForward = $state(false);

	/** Recomputes which sides hide chips. */
	function update() {
		const element = scroller;
		if (!element) return;
		const max = element.scrollWidth - element.clientWidth;
		// The scroll position is negative from the start in right-to-left text.
		const position = Math.abs(element.scrollLeft);
		canGoBack = position > 0.5;
		canGoForward = position < max - 0.5;
	}

	/** Watches the scroll position and the sizes of the row. */
	function watch(element: HTMLDivElement) {
		const resize = new ResizeObserver(update);
		resize.observe(element);
		for (const child of element.children) resize.observe(child);
		element.addEventListener('scroll', update, { passive: true });
		update();
		return () => {
			resize.disconnect();
			element.removeEventListener('scroll', update);
		};
	}

	/** Scrolls by one step toward the end (`forward`) or the start. */
	function scroll(forward: boolean) {
		if (!scroller) return;
		const rtl = directionOf(scroller) === 'rtl';
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		scroller.scrollBy({
			left: (forward !== rtl ? 1 : -1) * scrollStep,
			behavior: reduced ? 'instant' : 'smooth'
		});
	}
</script>

<div
	bind:this={ref}
	role="group"
	class={['oito2-choice-chip-bar', className]}
	data-layout={layout}
	data-pill={pill ? '' : undefined}
	style:--oito2-choice-chip-spacing="{spacing}px"
	{...rest}
>
	{#if layout === 'row'}
		{#if canGoBack}
			<IconButton
				class="oito2-choice-chip-arrow"
				icon={ChevronLeft as IconComponent}
				label={previousLabel ?? locale.strings.scrollBack}
				onclick={() => scroll(false)}
			/>
		{/if}
		<div class="chips" bind:this={scroller} {@attach watch}>{@render children?.()}</div>
		{#if canGoForward}
			<IconButton
				class="oito2-choice-chip-arrow"
				icon={ChevronRight as IconComponent}
				label={nextLabel ?? locale.strings.scrollForward}
				onclick={() => scroll(true)}
			/>
		{/if}
	{:else}
		<div class="chips">{@render children?.()}</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-choice-chip-bar {
			display: flex;
			align-items: center;
			min-width: 0;
		}

		.chips {
			display: flex;
			flex: 1;
			gap: var(--oito2-choice-chip-spacing);
			min-width: 0;
		}

		[data-layout='row'] .chips {
			overflow-x: auto;
			scrollbar-width: none;
		}

		[data-layout='row'] .chips::-webkit-scrollbar {
			display: none;
		}

		[data-layout='wrap'] .chips {
			flex-wrap: wrap;
		}

		.chips > :global(*) {
			flex: none;
		}

		[data-pill] .chips > :global(.oito2-chip) {
			border-radius: 999px;
		}

		.oito2-choice-chip-bar :global(.oito2-choice-chip-arrow:dir(rtl) svg) {
			scale: -1 1;
		}
	}
</style>
