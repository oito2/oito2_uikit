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
  The suggestion list of a `Combobox.Root`, in a panel under the field, as wide as it.
  Focus stays in the input. Without children it lists the suggestions with their matches
  highlighted, and `Combobox.Empty` (or "No results") when nothing matches.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../../internal/Portal.svelte';
	import { dismissableLayer } from '../../../internal/dismissable-layer.js';
	import { floating } from '../../../internal/floating.js';
	import { useLocale } from '../../../l10n/locale.js';
	import HighlightedText from '../../text/HighlightedText.svelte';
	import { useCombobox } from '../combobox-state.svelte.js';
	import ComboboxItem from './ComboboxItem.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		/** The tallest the list grows before it scrolls, in pixels. Defaults to 240. */
		maxHeight?: number;
		/** Content shown when nothing matches. Defaults to "No results". */
		empty?: Snippet;
		/** Custom items; the suggestions are in the root's `options`. */
		children?: Snippet;
	}

	let { maxHeight = 240, empty, children, class: className, ...rest }: Props = $props();

	const combobox = useCombobox();
	const locale = useLocale();
</script>

{#if combobox.showsList && combobox.anchor}
	<Portal>
		<div
			bind:this={combobox.list}
			id={combobox.listId}
			role="listbox"
			class={['oito2-combobox-content', className]}
			style:max-height="min({maxHeight}px, var(--oito2-available-height, {maxHeight}px))"
			{@attach floating(() => combobox.anchor, {
				placement: 'bottom-start',
				sameWidth: true
			})}
			{@attach dismissableLayer({
				onDismiss: () => (combobox.open = false),
				inside: () => [combobox.anchor, combobox.input]
			})}
			{...rest}
		>
			{#if children}
				{@render children()}
			{:else if combobox.options.length === 0}
				<div class="empty" role="presentation">
					{#if empty}{@render empty()}{:else}{locale.strings.noResults}{/if}
				</div>
			{:else}
				{#each combobox.options as item (combobox.collection.getValue(item))}
					{@const label = combobox.collection.getLabel(item)}
					<ComboboxItem value={combobox.collection.getValue(item)} {label}>
						<HighlightedText text={label} query={combobox.text} />
					</ComboboxItem>
				{/each}
			{/if}
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-combobox-content {
			z-index: 1000;
			box-sizing: border-box;
			overflow-y: auto;
			padding: var(--oito2-space-xs) 0;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container);
			color: var(--oito2-color-on-surface);
			box-shadow:
				0 2px 6px 2px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 2px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
		}

		.empty {
			padding: var(--oito2-space-sm) var(--oito2-space-md);
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
