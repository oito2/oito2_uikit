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
  The painted box of a check box (internal): the box with its border, the fill and the
  check mark or mixed bar drawn in when checked. The element that carries the
  `oito2-toggle-host` class drives its hover, press, focus and disabled looks.
-->
<script lang="ts">
	import type { CheckedState } from './toggle-state.js';

	let { checked }: { checked: CheckedState } = $props();
</script>

<span
	class="oito2-checkbox-mark"
	data-state={checked === 'mixed' ? 'mixed' : checked ? 'checked' : 'unchecked'}
	aria-hidden="true"
>
	<svg viewBox="0 0 1 1">
		<path class="check" pathLength="1" d="M0.24 0.52 L0.42 0.70 L0.77 0.32" />
		<rect class="bar" x="0.25" y="0.45" width="0.5" height="0.1" rx="0.05" />
	</svg>
</span>

<style>
	@layer oito2 {
		.oito2-checkbox-mark {
			position: relative;
			display: block;
			flex: none;
			box-sizing: border-box;
			width: var(--oito2-toggle-size);
			height: var(--oito2-toggle-size);
			border: 1.5px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-check);
			background: var(--oito2-color-surface-container-lowest);
			transition:
				background-color 150ms ease-in-out,
				border-color 150ms ease-in-out;
		}

		.oito2-checkbox-mark::after {
			content: '';
			position: absolute;
			inset: -1.5px;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
		}

		[data-state='checked'],
		[data-state='mixed'] {
			border-color: transparent;
			background: var(--oito2-color-selected-fill);
		}

		:is([data-state='checked'], [data-state='mixed'])::after {
			background: var(--oito2-color-on-selected-fill);
		}

		:global(.oito2-toggle-host:not([data-disabled]):hover) .oito2-checkbox-mark::after {
			opacity: 0.08;
		}

		:global(.oito2-toggle-host:not([data-disabled]):active) .oito2-checkbox-mark::after {
			opacity: 0.16;
		}

		:global(.oito2-toggle-host[data-mark-focus]:focus-visible) .oito2-checkbox-mark {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 2px;
		}

		svg {
			position: absolute;
			inset: -1.5px;
			width: calc(100% + 3px);
			height: calc(100% + 3px);
			overflow: visible;
		}

		.check {
			fill: none;
			stroke: var(--oito2-color-on-selected-fill);
			stroke-width: 0.11;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-dasharray: 1;
			stroke-dashoffset: 1;
			transition: stroke-dashoffset 150ms ease-in-out;
		}

		[data-state='checked'] .check {
			stroke-dashoffset: 0;
		}

		.bar {
			fill: var(--oito2-color-on-selected-fill);
			transform: scaleX(0);
			transform-origin: center;
			transform-box: fill-box;
			transition: transform 150ms ease-in-out;
		}

		[data-state='mixed'] .bar {
			transform: scaleX(1);
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-checkbox-mark,
			.check,
			.bar {
				transition: none;
			}
		}
	}
</style>
