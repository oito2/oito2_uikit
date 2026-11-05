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
  A row of `max` stars showing `value`, which the user changes by clicking or with the
  keyboard. With `allowHalf` the value moves in halves: the start half of a star gives the
  half value. Hovering previews the value under the pointer. The arrow keys change it by
  one step, Home and End jump to 0 and `max`, and the digit keys pick that whole value. A
  star pops when it fills. Assistive technologies read it as a slider; with `readonly` it
  is an image with the value as its name.
-->
<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import { alignRating, ratingAt } from './rating-math.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value, from 0 to `max`. */
		value?: number;
		/** The value of an uncontrolled rating at first. Defaults to 0. */
		defaultValue?: number;
		/** Called with each new value. */
		onValueChange?: (value: number) => void;
		/** The number of stars. Defaults to 5. */
		max?: number;
		/** Whether half values can be picked. */
		allowHalf?: boolean;
		/** The star size, in pixels. Defaults to 24. */
		size?: number;
		/** A CSS color for the filled stars. Defaults to the warning color. */
		color?: string;
		/** Whether the value can't be changed. */
		readonly?: boolean;
		/** Whether the rating can't be used. */
		disabled?: boolean;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		defaultValue = 0,
		value = $bindable(defaultValue),
		onValueChange,
		max = 5,
		allowHalf = false,
		size = 24,
		color,
		readonly = false,
		disabled = false,
		ref = $bindable(null),
		class: className,
		style,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let hover = $state<number | null>(null);
	let enabled = $derived(!readonly && !disabled);
	let step = $derived(allowHalf ? 0.5 : 1);
	let shown = $derived(hover ?? value);

	/** Formats `rating` for assistive technologies, such as "3.5 of 5". */
	function describe(rating: number): string {
		const text = new Intl.NumberFormat(locale.locale.replace('_', '-'), {
			maximumFractionDigits: rating % 1 === 0 ? 0 : 1,
			minimumFractionDigits: rating % 1 === 0 ? 0 : 1
		}).format(rating);
		return locale.strings.ratingValue(text, max);
	}

	/** Aligns, clamps and reports `next`. */
	function set(next: number) {
		const aligned = alignRating(next, max, allowHalf);
		if (aligned === value) return;
		value = aligned;
		onValueChange?.(aligned);
	}

	/** The rating under the pointer of `event`. */
	function valueAt(event: PointerEvent | MouseEvent): number {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const rtl = directionOf(event.currentTarget as Element) === 'rtl';
		const x = rtl ? box.right - event.clientX : event.clientX - box.left;
		return ratingAt(x, size, max, allowHalf);
	}

	function onkeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const rtl = directionOf(event.currentTarget) === 'rtl';
		const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
		const back = rtl ? 'ArrowRight' : 'ArrowLeft';
		const aligned = alignRating(value, max, allowHalf);
		if (event.key === forward || event.key === 'ArrowUp') set(aligned + step);
		else if (event.key === back || event.key === 'ArrowDown') set(aligned - step);
		else if (event.key === 'Home') set(0);
		else if (event.key === 'End') set(max);
		else if (/^[0-9]$/.test(event.key) && Number(event.key) <= max) set(Number(event.key));
		else return;
		event.preventDefault();
	}
</script>

{#snippet stars()}
	{#each { length: max }, index (index)}
		{@const fill = Math.min(Math.max(shown - index, 0), 1)}
		<span class="star" data-fill={fill >= 1 ? 'full' : fill >= 0.5 ? 'half' : 'none'}>
			<Star {size} aria-hidden="true" class="outline" />
			<span class="filled"><Star {size} aria-hidden="true" /></span>
		</span>
	{/each}
{/snippet}

{#if enabled}
	<div
		bind:this={ref}
		role="slider"
		tabindex="0"
		aria-valuemin={0}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={describe(value)}
		class={['oito2-rating', className]}
		data-hover={hover === null ? undefined : ''}
		style:--oito2-rating-size="{size}px"
		style:--oito2-rating-color={color}
		{style}
		onpointermove={(event) => (hover = valueAt(event))}
		onpointerleave={() => (hover = null)}
		onclick={(event) => {
			hover = null;
			set(valueAt(event));
		}}
		{onkeydown}
		{...rest}
	>
		{@render stars()}
	</div>
{:else}
	<!-- A read-only rating stays focusable and announces its value; a disabled one leaves the tab order. -->
	<div
		bind:this={ref}
		role="slider"
		tabindex={disabled ? undefined : 0}
		aria-valuemin={0}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={describe(value)}
		aria-readonly={readonly && !disabled ? true : undefined}
		aria-disabled={disabled || undefined}
		aria-label={describe(value)}
		class={['oito2-rating', className]}
		data-disabled={disabled ? '' : undefined}
		style:--oito2-rating-size="{size}px"
		style:--oito2-rating-color={color}
		{style}
		{...rest}
	>
		{@render stars()}
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-rating {
			display: inline-flex;
			border-radius: 4px;
			color: var(--oito2-color-outline);
		}

		[role='slider'] {
			cursor: pointer;
		}

		.oito2-rating:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		[data-disabled] {
			opacity: 0.38;
		}

		.star {
			position: relative;
			display: inline-flex;
			width: var(--oito2-rating-size);
			height: var(--oito2-rating-size);
		}

		.star :global(svg) {
			width: var(--oito2-rating-size);
			height: var(--oito2-rating-size);
		}

		.filled {
			position: absolute;
			inset: 0;
			overflow: hidden;
			color: var(--oito2-rating-color, var(--oito2-color-warning));
		}

		.filled :global(svg) {
			fill: currentColor;
		}

		[data-fill='none'] .filled {
			visibility: hidden;
		}

		[data-fill='half'] .filled {
			clip-path: inset(0 50% 0 0);
		}

		.oito2-rating:dir(rtl) [data-fill='half'] .filled {
			clip-path: inset(0 0 0 50%);
		}

		[data-fill='full'] .filled,
		[data-fill='half'] .filled {
			animation: oito2-rating-pop 250ms ease-out;
		}

		[data-hover] .filled {
			animation: none;
		}

		@keyframes oito2-rating-pop {
			from {
				scale: 0.6;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			[data-fill='full'] .filled,
			[data-fill='half'] .filled {
				animation: none;
			}
		}
	}
</style>
