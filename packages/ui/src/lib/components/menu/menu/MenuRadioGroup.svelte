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
  A group of menu items of which one is checked, such as a sort order. Bind `value`, or
  listen to `onValueChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMenuRadio } from '../menu-radio.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The checked value, or `null`. */
		value?: string | null;
		/** Called with each new value. */
		onValueChange?: (value: string) => void;
		/** The `Menu.RadioItem`s. */
		children?: Snippet;
	}

	let { value = $bindable(null), onValueChange, children, ...rest }: Props = $props();

	setMenuRadio({
		get value() {
			return value;
		},
		select(next) {
			value = next;
			onValueChange?.(next);
		}
	});
</script>

<div role="group" {...rest}>{@render children?.()}</div>
