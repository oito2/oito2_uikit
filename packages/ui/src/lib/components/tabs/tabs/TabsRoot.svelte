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
  Tabs: a `Tabs.List` of `Tabs.Trigger`s and the `Tabs.Content` of the selected one. Bind
  `value`, or set `defaultValue` and listen to `onValueChange`. `orientation` lays the
  list out as a row or as a column beside the content; `variant` picks the look of the
  selected marker: a pill in the secondary container color, as in GNOME view switchers,
  or a faint accent tint.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { TabsState, setTabs, type TabsVariant } from '../tabs-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The value of the selected tab. */
		value?: string;
		/** The selected tab of uncontrolled tabs. */
		defaultValue?: string;
		/** Called with the value of each newly selected tab. */
		onValueChange?: (value: string) => void;
		/** Whether the tabs form a row above the content or a column beside it. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** The look of the selected marker. Defaults to `pill`. */
		variant?: TabsVariant;
		/**
		 * Whether moving focus with the arrow keys selects the tab, instead of waiting for
		 * Enter or Space. Defaults to true.
		 */
		activateOnFocus?: boolean;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The list and the contents. */
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		onValueChange,
		orientation = 'horizontal',
		variant = 'pill',
		activateOnFocus = true,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const id = $props.id();
	setTabs(
		new TabsState({
			id,
			value: () => value,
			defaultValue: () => defaultValue,
			onChange: (next) => {
				value = next;
				onValueChange?.(next);
			},
			orientation: () => orientation,
			variant: () => variant,
			activateOnFocus: () => activateOnFocus
		})
	);
</script>

<div bind:this={ref} class={['oito2-tabs', className]} data-orientation={orientation} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-tabs {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		.oito2-tabs[data-orientation='vertical'] {
			flex-direction: row;
		}
	}
</style>
