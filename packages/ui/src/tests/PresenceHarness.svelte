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

<!-- Test helper: an element kept mounted by Presence while its exit animation plays. -->
<script lang="ts">
	import { Presence } from '../lib/internal/presence.svelte.js';

	let { open = false, animated = true }: { open?: boolean; animated?: boolean } = $props();
	const presence = new Presence(() => open);
</script>

{#if presence.present}
	<div
		data-testid="panel"
		class:animated
		data-state={open ? 'open' : 'closed'}
		{@attach presence.attach}
	>
		Panel
	</div>
{/if}

<style>
	.animated[data-state='closed'] {
		animation: fade 150ms forwards;
	}

	@keyframes fade {
		to {
			opacity: 0;
		}
	}
</style>
