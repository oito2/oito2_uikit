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
  The button at the end of a combobox field that opens or closes the full suggestion
  list. It is out of the Tab order: the input already opens the list with the arrows.
-->
<script lang="ts">
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../../l10n/locale.js';
	import { useCombobox } from '../combobox-state.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The accessible name. Defaults to "More options". */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { label, ref = $bindable(null), class: className, ...rest }: Props = $props();

	const combobox = useCombobox();
	const locale = useLocale();
</script>

<button
	bind:this={ref}
	type="button"
	tabindex="-1"
	aria-label={label ?? locale.strings.moreOptions}
	aria-expanded={combobox.showsList}
	aria-controls={combobox.showsList ? combobox.listId : undefined}
	disabled={combobox.disabled}
	class={['oito2-combobox-trigger', className]}
	onpointerdown={(event) => event.preventDefault()}
	onclick={() => {
		combobox.open = !combobox.open;
		combobox.input?.focus();
	}}
	{...rest}
>
	<ChevronsUpDown size={20} aria-hidden="true" />
</button>

<style>
	@layer oito2 {
		.oito2-combobox-trigger {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			align-self: stretch;
			width: var(--oito2-control-height);
			margin: 0;
			padding: 0;
			border: none;
			background: none;
			color: var(--oito2-color-on-surface-variant);
			cursor: pointer;
		}

		.oito2-combobox-trigger :global(svg) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}
	}
</style>
