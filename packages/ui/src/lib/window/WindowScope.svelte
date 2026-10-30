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
  Provides a window controller to the title bars below it. On the web, or before the
  window is ready, `controller` is `null` and title bars show no working controls.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setWindowController, type WindowController } from './window-controller.js';

	let { controller, children }: { controller: WindowController | null; children: Snippet } =
		$props();

	setWindowController(() => controller);
</script>

{@render children()}
