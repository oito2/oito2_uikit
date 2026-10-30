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

<!-- Test helper: a field with a label, a text field, a helper and an error. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import * as Field from '../lib/components/field/field/index.js';
	import TextField from '../lib/components/field/TextField.svelte';
	import TextArea from '../lib/components/field/TextArea.svelte';

	let { invalid = false, value = $bindable('') }: { invalid?: boolean; value?: string } =
		$props();
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<Field.Root {invalid} required>
		<Field.Label>Email</Field.Label>
		<TextField bind:value />
		<Field.Helper>Your work address.</Field.Helper>
		<Field.Error>Enter an address.</Field.Error>
	</Field.Root>
	<Field.Root>
		<Field.Label>Notes</Field.Label>
		<TextArea autoGrow maxRows={4} />
	</Field.Root>
	<Field.Root>
		<Field.Label>Custom</Field.Label>
		<Field.Control>
			{#snippet children(props)}<input data-testid="custom" {...props} />{/snippet}
		</Field.Control>
	</Field.Root>
</ThemeProvider>
