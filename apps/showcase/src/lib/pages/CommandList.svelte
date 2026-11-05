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

<!-- Lists the commands available where it is rendered, with their shortcuts. -->
<script lang="ts">
	import { useCommands, useSystemSettings } from '@oito2/ui';

	const commands = useCommands();
	const system = useSystemSettings();
</script>

<ul class="commands">
	{#each commands.available as command (command.id)}
		<li>
			<span>{command.label}</span>
			<kbd>{command.shortcut?.label(system.current.platform.os) ?? '—'}</kbd>
		</li>
	{/each}
</ul>

<style>
	.commands {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		justify-content: space-between;
		gap: var(--oito2-space-lg);
		max-width: 360px;
	}

	kbd {
		padding: 0 var(--oito2-space-xs);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-small);
		background: var(--oito2-color-surface-container-high);
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-medium);
	}
</style>
