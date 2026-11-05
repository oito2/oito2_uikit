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
  A row of overlapping avatars, showing at most `max` and a "+N" bubble for the rest. The
  ring around each avatar and the bubble follow `shape`.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import type { AvatarShape } from './avatar.js';
	import Avatar from './Avatar.svelte';

	/** An avatar of the group: the props of an `Avatar` without its size and shape. */
	type GroupAvatar = Omit<ComponentProps<typeof Avatar>, 'size' | 'shape' | 'ref'>;

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The avatars. */
		avatars: readonly GroupAvatar[];
		/** The number of avatars shown before the "+N" bubble. Defaults to 4. */
		max?: number;
		/** The avatar size in pixels. Defaults to 32. */
		size?: number;
		/** The fraction of each avatar the next one covers, from 0 up to, but not including, 1. Defaults to 0.3. */
		overlap?: number;
		/** The shape of the avatars. Defaults to `circle`. */
		shape?: AvatarShape;
		/** The accessible name of the whole group, such as "Project members". */
		label?: string;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		avatars,
		max = 4,
		size = 32,
		overlap = 0.3,
		shape = 'circle',
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();

	let shown = $derived(avatars.slice(0, Math.max(1, Math.floor(max))));
	let hidden = $derived(avatars.length - shown.length);
	let step = $derived((size + 4) * (1 - Math.min(0.99, Math.max(0, overlap))));
</script>

<div
	bind:this={ref}
	role={label ? 'group' : undefined}
	aria-label={label}
	class={['oito2-avatar-group', className]}
	data-shape={shape}
	style:--oito2-avatar-size="{size}px"
	style:--oito2-avatar-group-overlap="{size + 4 - step}px"
	{...rest}
>
	{#each shown as avatar, index (index)}
		<span class="oito2-avatar-group-ring"><Avatar {...avatar} {size} {shape} /></span>
	{/each}
	{#if hidden > 0}
		<span class="oito2-avatar-group-ring">
			<span
				class="oito2-avatar-group-more"
				role="img"
				aria-label={locale.strings.moreCount(hidden)}>+{hidden}</span
			>
		</span>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-avatar-group {
			display: inline-flex;
			align-items: center;
			--oito2-avatar-group-radius: 50%;
		}

		.oito2-avatar-group[data-shape='square'] {
			--oito2-avatar-group-radius: calc((var(--oito2-avatar-size) + 4px) * 0.22);
		}

		.oito2-avatar-group-ring {
			display: inline-flex;
			padding: 2px;
			border-radius: var(--oito2-avatar-group-radius);
			background: var(--oito2-color-background);
		}

		.oito2-avatar-group-ring + .oito2-avatar-group-ring {
			margin-inline-start: calc(-1 * var(--oito2-avatar-group-overlap));
		}

		.oito2-avatar-group-more {
			display: flex;
			align-items: center;
			justify-content: center;
			width: var(--oito2-avatar-size);
			height: var(--oito2-avatar-size);
			border-radius: var(--oito2-avatar-group-radius);
			background: var(--oito2-color-surface-container-highest);
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-medium);
			font-weight: 600;
		}

		.oito2-avatar-group[data-shape='square'] .oito2-avatar-group-more {
			border-radius: calc(var(--oito2-avatar-size) * 0.22);
		}
	}
</style>
