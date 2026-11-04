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
  An arrow on the edge of a popover panel, pointing at its anchor. Place it inside
  `Popover.Content`.
-->
<script lang="ts">
	import { usePopover } from '../popover-state.svelte.js';

	const popover = usePopover();
</script>

<span
	class="oito2-popover-arrow"
	aria-hidden="true"
	{@attach (node) => {
		popover.arrow = node;
		return () => {
			if (popover.arrow === node) popover.arrow = null;
		};
	}}
></span>

<style>
	@layer oito2 {
		.oito2-popover-arrow {
			position: absolute;
			width: 10px;
			height: 10px;
			border: 1px solid var(--oito2-color-outline-variant);
			background: var(--oito2-color-surface-container);
			rotate: 45deg;
			pointer-events: none;
		}

		:global([data-placement^='bottom']) > .oito2-popover-arrow {
			top: -6px;
			border-right: none;
			border-bottom: none;
		}

		:global([data-placement^='top']) > .oito2-popover-arrow {
			bottom: -6px;
			border-top: none;
			border-left: none;
		}

		:global([data-placement^='right']) > .oito2-popover-arrow {
			left: -6px;
			border-top: none;
			border-right: none;
		}

		:global([data-placement^='left']) > .oito2-popover-arrow {
			right: -6px;
			border-bottom: none;
			border-left: none;
		}
	}
</style>
