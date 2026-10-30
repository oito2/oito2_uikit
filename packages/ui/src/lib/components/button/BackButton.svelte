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
  An icon button with a chevron pointing back (left, or right in right-to-left layouts),
  labeled "Back" in the active locale.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { materialStrings } from '../../l10n/material.js';
	import IconButton from './IconButton.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The accessible name. Defaults to "Back" in the active locale. */
		label?: string;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { label, ref = $bindable(null), ...rest }: Props = $props();

	const locale = useLocale();
	let rtl = $state(false);

	function readDirection(node: HTMLElement) {
		rtl = getComputedStyle(node).direction === 'rtl';
	}
</script>

<IconButton
	bind:ref
	icon={rtl ? ChevronRight : ChevronLeft}
	label={label ?? materialStrings(locale.locale).back}
	{@attach readDirection}
	{...rest}
/>
