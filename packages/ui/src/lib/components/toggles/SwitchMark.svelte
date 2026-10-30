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
  The painted track and thumb of a switch (internal). With `onOffShapes` the track shows
  an "I" when on and an "O" when off, for users who can't tell the states by color. The
  element that carries the `oito2-toggle-host` class drives its hover, press, focus and
  disabled looks.
-->
<script lang="ts">
	let { checked, onOffShapes = false }: { checked: boolean; onOffShapes?: boolean } = $props();
</script>

<span class="oito2-switch-mark" data-state={checked ? 'checked' : 'unchecked'} aria-hidden="true">
	{#if onOffShapes}
		<span class="on-shape"></span>
		<span class="off-shape"></span>
	{/if}
	<span class="thumb"></span>
</span>

<style>
	@layer oito2 {
		.oito2-switch-mark {
			--h: var(--oito2-switch-height);
			--inset: calc(var(--h) * 0.125);
			--thumb: calc(var(--h) - 2 * var(--inset));
			--travel: calc(var(--oito2-switch-width) - var(--h));
			position: relative;
			display: block;
			flex: none;
			box-sizing: border-box;
			width: var(--oito2-switch-width);
			height: var(--h);
			border-radius: calc(var(--h) / 2);
			background: var(--oito2-color-surface-container-highest);
			box-shadow: inset 0 0 0 1.5px var(--oito2-color-outline);
			transition:
				background-color 150ms ease-in-out,
				box-shadow 150ms ease-in-out;
		}

		.oito2-switch-mark::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
		}

		[data-state='checked'] {
			background: var(--oito2-color-selected-fill);
			box-shadow: inset 0 0 0 1.5px transparent;
		}

		[data-state='checked']::after {
			background: var(--oito2-color-on-selected-fill);
		}

		:global(.oito2-toggle-host:not([data-disabled]):hover) .oito2-switch-mark::after {
			opacity: 0.08;
		}

		:global(.oito2-toggle-host:not([data-disabled]):active) .oito2-switch-mark::after {
			opacity: 0.16;
		}

		:global(.oito2-toggle-host[data-mark-focus]:focus-visible) .oito2-switch-mark {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 2px;
		}

		.thumb {
			position: absolute;
			top: var(--inset);
			inset-inline-start: var(--inset);
			z-index: 1;
			width: var(--thumb);
			height: var(--thumb);
			border-radius: 50%;
			background: var(--oito2-color-off-thumb);
			transition:
				translate 150ms ease-in-out,
				background-color 150ms ease-in-out;
		}

		[data-state='checked'] .thumb {
			translate: var(--travel) 0;
			background: var(--oito2-color-on-selected-fill);
		}

		[data-state='checked'] .thumb:dir(rtl) {
			translate: calc(-1 * var(--travel)) 0;
		}

		/* The "I" sits where the thumb rests when off, the "O" where it rests when on. */
		.on-shape,
		.off-shape {
			position: absolute;
			top: calc(var(--h) * 0.32);
			transition: opacity 150ms ease-in-out;
		}

		.on-shape {
			inset-inline-start: calc(var(--h) * 0.46);
			width: calc(var(--h) * 0.08);
			height: calc(var(--h) * 0.36);
			border-radius: 1px;
			background: var(--oito2-color-on-selected-fill);
			opacity: 0;
		}

		.off-shape {
			inset-inline-start: calc(var(--oito2-switch-width) - var(--h) * 0.68);
			box-sizing: border-box;
			width: calc(var(--h) * 0.36);
			height: calc(var(--h) * 0.36);
			border: calc(var(--h) * 0.07) solid var(--oito2-color-outline);
			border-radius: 50%;
		}

		[data-state='checked'] .on-shape {
			opacity: 1;
		}

		[data-state='checked'] .off-shape {
			opacity: 0;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-switch-mark,
			.thumb,
			.on-shape,
			.off-shape {
				transition: none;
			}
		}
	}
</style>
