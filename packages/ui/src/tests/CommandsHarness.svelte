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

<!-- Test helper: a Commands scope, with an optional inner scope, around a button and a text field. -->
<script lang="ts">
	import type { OperatingSystem } from '../lib/foundation/platform.js';
	import Commands from '../lib/shortcuts/Commands.svelte';
	import type { Command } from '../lib/shortcuts/commands.js';
	import ReadCommands from './ReadCommands.svelte';

	interface Props {
		commands: Command[];
		inner?: Command[];
		platform?: OperatingSystem;
		global?: boolean;
	}

	let { commands, inner, platform, global }: Props = $props();
</script>

<Commands {commands} {platform} {global}>
	{#if inner}
		<Commands commands={inner} {platform}>
			<button data-testid="target">Target</button>
			<input data-testid="field" />
			<ReadCommands />
		</Commands>
	{:else}
		<button data-testid="target">Target</button>
		<input data-testid="field" />
		<ReadCommands />
	{/if}
</Commands>
<button data-testid="outside">Outside</button>
