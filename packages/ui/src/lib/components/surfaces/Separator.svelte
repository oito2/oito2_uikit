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
  A 1-pixel line in the outline variant color that separates content, horizontal by
  default. A `decorative` separator is hidden from assistive technologies.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The direction of the line. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** Whether the line only decorates, without meaning for assistive technologies. */
		decorative?: boolean;
	}

	let {
		orientation = 'horizontal',
		decorative = false,
		class: className,
		...rest
	}: Props = $props();
</script>

<div
	role={decorative ? 'none' : 'separator'}
	aria-orientation={decorative || orientation === 'horizontal' ? undefined : orientation}
	class={['oito2-separator', className]}
	data-orientation={orientation}
	{...rest}
></div>

<style>
	@layer oito2 {
		.oito2-separator {
			flex: none;
			background: var(--oito2-color-outline-variant);
		}

		[data-orientation='horizontal'] {
			width: 100%;
			height: 1px;
		}

		[data-orientation='vertical'] {
			align-self: stretch;
			width: 1px;
		}
	}
</style>
