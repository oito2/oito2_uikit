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

<!-- Test helper: a dismissable layer with a nested one rendered through a portal. -->
<script lang="ts">
	import type { DismissReason } from '../lib/internal/dismissable-layer.js';
	import { dismissableLayer } from '../lib/internal/dismissable-layer.js';
	import Portal from '../lib/internal/Portal.svelte';

	interface Props {
		onDismiss: (layer: string, reason: DismissReason) => void;
		nested?: boolean;
	}

	let { onDismiss, nested = false }: Props = $props();
</script>

<button data-testid="outside">Outside</button>
<div
	data-testid="outer"
	{@attach dismissableLayer({ onDismiss: (reason) => onDismiss('outer', reason) })}
>
	<button data-testid="outer-button">Outer</button>
	{#if nested}
		<Portal>
			<div
				data-testid="inner"
				{@attach dismissableLayer({ onDismiss: (reason) => onDismiss('inner', reason) })}
			>
				<button data-testid="inner-button">Inner</button>
			</div>
		</Portal>
	{/if}
</div>
