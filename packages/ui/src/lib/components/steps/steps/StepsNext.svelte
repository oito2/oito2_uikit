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
  A button of a `Steps.Root` that moves to the next step; disabled once every step is done.
  Its label defaults to "Next" in the active locale.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../../l10n/locale.js';
	import StepsNavigation from './StepsNavigation.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The button variant. Defaults to `filled`. */
		variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** Custom button content. */
		children?: Snippet;
	}

	let { variant = 'filled', ref = $bindable(null), ...rest }: Props = $props();

	const locale = useLocale();
</script>

<StepsNavigation bind:ref direction="next" label={locale.strings.nextStep} {variant} {...rest} />
