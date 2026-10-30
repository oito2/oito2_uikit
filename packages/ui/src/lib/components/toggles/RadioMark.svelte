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
  The painted ring of a radio button (internal): the ring with its border and, when
  checked, the fill with a dot that grows in. The element that carries the
  `oito2-toggle-host` class drives its hover, press, focus and disabled looks.
-->
<script lang="ts">
	let { checked }: { checked: boolean } = $props();
</script>

<span class="oito2-radio-mark" data-state={checked ? 'checked' : 'unchecked'} aria-hidden="true"
></span>

<style>
	@layer oito2 {
		.oito2-radio-mark {
			position: relative;
			display: block;
			flex: none;
			box-sizing: border-box;
			width: var(--oito2-toggle-size);
			height: var(--oito2-toggle-size);
			border: 1.5px solid var(--oito2-color-outline);
			border-radius: 50%;
			background: var(--oito2-color-surface-container-lowest);
			transition:
				background-color 150ms ease-in-out,
				border-color 150ms ease-in-out;
		}

		/* The state layer. */
		.oito2-radio-mark::after {
			content: '';
			position: absolute;
			inset: -1.5px;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
		}

		/* The dot: 40% of the ring's diameter. */
		.oito2-radio-mark::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 40%;
			height: 40%;
			border-radius: 50%;
			background: var(--oito2-color-on-selected-fill);
			transform: translate(-50%, -50%) scale(0);
			transition: transform 150ms ease-in-out;
		}

		[data-state='checked'] {
			border-color: transparent;
			background: var(--oito2-color-selected-fill);
		}

		[data-state='checked']::after {
			background: var(--oito2-color-on-selected-fill);
		}

		[data-state='checked']::before {
			transform: translate(-50%, -50%) scale(1);
		}

		:global(.oito2-toggle-host:not([data-disabled]):hover) .oito2-radio-mark::after {
			opacity: 0.08;
		}

		:global(.oito2-toggle-host:not([data-disabled]):active) .oito2-radio-mark::after {
			opacity: 0.16;
		}

		:global(.oito2-toggle-host[data-mark-focus]:focus-visible) .oito2-radio-mark {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 2px;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-radio-mark,
			.oito2-radio-mark::before {
				transition: none;
			}
		}
	}
</style>
