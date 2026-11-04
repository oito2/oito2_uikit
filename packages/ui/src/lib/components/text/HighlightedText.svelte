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
  Text with the matches of a search `query` emphasized, such as search results that show
  why each item matched. Each word of `query` and of `queries` matches separately,
  ignoring case and accents; overlapping matches merge. Matches are `mark` elements in
  bold text-safe primary, without a fill.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { highlightRanges, type HighlightOptions } from './highlight-ranges.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>, HighlightOptions {
		/** The full text. */
		text: string;
		/** The search query. */
		query: string;
		/** The element. */
		ref?: HTMLSpanElement | null;
	}

	let {
		text,
		query,
		queries,
		splitWords,
		ignoreCase,
		wholeWords,
		matchAll,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let parts = $derived.by(() => {
		const ranges = highlightRanges(text, query, {
			queries,
			splitWords,
			ignoreCase,
			wholeWords,
			matchAll
		});
		const result: { text: string; match: boolean }[] = [];
		let position = 0;
		for (const range of ranges) {
			if (range.start > position)
				result.push({ text: text.slice(position, range.start), match: false });
			result.push({ text: text.slice(range.start, range.end), match: true });
			position = range.end;
		}
		if (position < text.length) result.push({ text: text.slice(position), match: false });
		return result;
	});
</script>

<span bind:this={ref} class={['oito2-highlighted-text', className]} {...rest}
	>{#each parts as part, index (index)}{#if part.match}<mark>{part.text}</mark
			>{:else}{part.text}{/if}{/each}</span
>

<style>
	@layer oito2 {
		mark {
			background: none;
			color: var(--oito2-color-primary-text);
			font-weight: 700;
		}
	}
</style>
