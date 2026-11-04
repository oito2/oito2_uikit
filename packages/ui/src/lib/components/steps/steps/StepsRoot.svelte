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
  A step indicator: `Steps.Item`s in order, those before `current` completed, with the
  content of the current step. A step header moves to its step when `onCurrentChange` is
  set (or `interactive`); with `linear` only the completed steps and the current one can
  be reached. The steps run in a row with the content below, or in a column with the
  content under the current step. `Steps.Prev` and `Steps.Next` move between them.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { StepsState, setSteps } from '../steps-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The index of the current step, from 0; the step count when all are done. */
		current?: number;
		/** The current step of uncontrolled steps. Defaults to 0. */
		defaultCurrent?: number;
		/** Called with each new current step. */
		onCurrentChange?: (current: number) => void;
		/** Whether the step headers are buttons. Defaults to whether `onCurrentChange` is set. */
		interactive?: boolean;
		/** Whether the steps run in a row or a column. Defaults to `horizontal`. */
		orientation?: 'horizontal' | 'vertical';
		/** Whether only completed steps and the current one can be reached. Defaults to true. */
		linear?: boolean;
		/** The root element. */
		ref?: HTMLDivElement | null;
		/** The items and the navigation buttons. */
		children?: Snippet;
	}

	let {
		current = $bindable(),
		defaultCurrent = 0,
		onCurrentChange,
		interactive,
		orientation = 'horizontal',
		linear = true,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	setSteps(
		new StepsState({
			current: () => current,
			defaultCurrent: () => defaultCurrent,
			onChange: (next) => {
				current = next;
				onCurrentChange?.(next);
			},
			orientation: () => orientation,
			linear: () => linear,
			interactive: () => interactive ?? onCurrentChange !== undefined
		})
	);
</script>

<div bind:this={ref} class={['oito2-steps', className]} data-orientation={orientation} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-steps {
			display: flex;
			flex-wrap: wrap;
			align-items: flex-start;
			row-gap: var(--oito2-space-lg);
		}

		/* Anything else, such as the navigation buttons, goes on a row below the content. */
		[data-orientation='horizontal']
			> :global(:not(.oito2-steps-item, .oito2-steps-connector, .oito2-steps-content)) {
			order: 2;
			flex-basis: 100%;
		}

		[data-orientation='vertical'] {
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: stretch;
			row-gap: 0;
		}
	}
</style>
