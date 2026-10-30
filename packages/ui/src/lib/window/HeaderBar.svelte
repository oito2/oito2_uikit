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
  A GNOME-style header bar: the window title bar of `WindowTitleBar` with `start`
  controls, a `title` and `end` controls, and an optional search. With `searchable`, a
  search button at the end swaps the title for a search field; Escape closes it and
  returns focus to the button.
-->
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import type { ComponentProps, Snippet } from 'svelte';
	import IconButton from '../components/button/IconButton.svelte';
	import TextField from '../components/field/TextField.svelte';
	import { useLocale } from '../l10n/locale.js';
	import { materialStrings } from '../l10n/material.js';
	import WindowTitleBar from './WindowTitleBar.svelte';

	type Props = Omit<ComponentProps<typeof WindowTitleBar>, 'leading' | 'trailing' | 'title'> & {
		/** The title, usually text. */
		title?: string | Snippet;
		/** Controls at the start, such as a back button. */
		start?: Snippet;
		/** Controls at the end, such as a main menu. */
		end?: Snippet;
		/** Whether the bar has a search button and field. */
		searchable?: boolean;
		/** Whether the search field shows. */
		searchActive?: boolean;
		/** The text in the search field. */
		searchValue?: string;
		/** The placeholder of the search field. */
		searchPlaceholder?: string;
		/** The accessible name of the search button and field. Defaults to "Search". */
		searchLabel?: string;
		/** The width of the search field in pixels. Defaults to 280. */
		searchWidth?: number;
	};

	let {
		title,
		start,
		end,
		searchable = false,
		searchActive = $bindable(false),
		searchValue = $bindable(''),
		searchPlaceholder,
		searchLabel,
		searchWidth = 280,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let toggle: HTMLButtonElement | null = $state(null);
	let active = $derived(searchable && searchActive);

	function close() {
		searchActive = false;
		toggle?.focus();
	}
</script>

{#snippet middle()}
	{#if active}
		<div
			class="oito2-header-bar-search"
			style:width="{searchWidth}px"
			{@attach (node) => node.querySelector('input')?.focus()}
		>
			<TextField
				bind:value={searchValue}
				type="search"
				placeholder={searchPlaceholder}
				aria-label={searchLabel ?? materialStrings(locale.locale).search}
				onkeydown={(event: KeyboardEvent) => {
					if (event.key === 'Escape') {
						event.preventDefault();
						close();
					}
				}}
			>
				{#snippet leading()}<Search size={18} aria-hidden="true" />{/snippet}
			</TextField>
		</div>
	{:else if typeof title === 'string'}
		<h1 class="oito2-header-bar-title">{title}</h1>
	{:else if title}
		{@render title()}
	{/if}
{/snippet}

{#snippet trailing()}
	{@render end?.()}
	{#if searchable}
		<IconButton
			bind:ref={toggle}
			icon={Search}
			label={searchLabel ?? materialStrings(locale.locale).search}
			selected={active}
			onclick={() => (active ? close() : (searchActive = true))}
		/>
	{/if}
{/snippet}

<WindowTitleBar
	{...rest}
	title={middle}
	leading={start}
	trailing={searchable || end ? trailing : undefined}
	interactiveTitle={active}
/>

<style>
	@layer oito2 {
		.oito2-header-bar-search {
			max-width: 100%;
		}

		.oito2-header-bar-title {
			margin: 0;
			overflow: hidden;
			font: inherit;
			text-overflow: ellipsis;
		}
	}
</style>
