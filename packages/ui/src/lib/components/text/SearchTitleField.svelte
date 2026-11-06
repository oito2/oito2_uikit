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
  A title bar element that switches between a `title` and a search field, with a toggle
  button, as in GNOME apps. It keeps the same size in both states: `fieldWidth` wide and as
  tall as a field, with the toggle button at its start. While closed the title follows the
  button; while open the field fills the box and the button serves as its search icon.
  Escape on the empty field closes the search and returns focus to the button. Bind
  `searchActive` and `value`.
-->
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import type { IconComponent } from '../icon.js';
	import SearchField from './SearchField.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
		/** Shown while the search is closed. */
		title: string | Snippet;
		/** Whether the search field shows. */
		searchActive?: boolean;
		/** Called when the search opens or closes. */
		onSearchActiveChange?: (active: boolean) => void;
		/** The search text. */
		value?: string;
		/** Called whenever the search text changes. */
		onValueChange?: (value: string) => void;
		/** Called with the text when the user presses Enter. */
		onSubmit?: (value: string) => void;
		/** The search hint. Defaults to "Search". */
		placeholder?: string;
		/** The width of the element in both states, in pixels. Defaults to 260. */
		fieldWidth?: number;
		/** The name of the toggle button. Defaults to "Search". */
		toggleLabel?: string;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		title,
		searchActive = $bindable(false),
		onSearchActiveChange,
		value = $bindable(''),
		onValueChange,
		onSubmit,
		placeholder,
		fieldWidth = 260,
		toggleLabel,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let toggle = $state<HTMLButtonElement | null>(null);

	function setActive(active: boolean) {
		searchActive = active;
		onSearchActiveChange?.(active);
	}

	/** Closes the search and moves the focus to the toggle button. */
	function close() {
		setActive(false);
		toggle?.focus();
	}
</script>

<div
	bind:this={ref}
	class={['oito2-search-title-field', className]}
	data-state={searchActive ? 'open' : 'closed'}
	style:width="{fieldWidth}px"
	{...rest}
>
	{#if searchActive}
		<div class="face">
			<SearchField
				bind:value
				{onValueChange}
				{onSubmit}
				{placeholder}
				onEscape={close}
				{@attach (node: HTMLElement) => node.focus()}
			>
				{#snippet icon()}<span class="spacer"></span>{/snippet}
			</SearchField>
		</div>
	{:else}
		<div class="face title">
			{#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
		</div>
	{/if}
	<IconButton
		bind:ref={toggle}
		class="oito2-search-title-toggle"
		icon={Search as IconComponent}
		label={toggleLabel ?? locale.strings.searchField}
		selected={searchActive}
		onclick={() => (searchActive ? close() : setActive(true))}
	/>
</div>

<style>
	@layer oito2 {
		.oito2-search-title-field {
			position: relative;
			display: grid;
			align-items: center;
			min-height: var(--oito2-control-height);
		}

		.face {
			grid-area: 1 / 1;
			min-width: 0;
			animation: oito2-search-title-in 150ms ease-out;
		}

		.title {
			overflow: hidden;
			padding-inline-start: calc(var(--oito2-control-height) + var(--oito2-space-sm));
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.spacer {
			display: block;
			width: var(--oito2-control-height);
		}

		.oito2-search-title-field > :global(.oito2-search-title-toggle) {
			position: absolute;
			inset-inline-start: 0;
			top: 50%;
			translate: 0 -50%;
		}

		@keyframes oito2-search-title-in {
			from {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.face {
				animation: none;
			}
		}
	}
</style>
