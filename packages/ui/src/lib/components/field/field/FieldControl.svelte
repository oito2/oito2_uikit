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
  Renders a custom control of a field through `children`, which receives the attributes
  to spread on it: its id, `aria-describedby`, `aria-invalid`, `aria-required` and
  `disabled`. `TextField` and `TextArea` read the field by themselves.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { describedBy, useField } from '../field-context.js';

	/** The attributes a field gives its control. */
	interface ControlProps {
		id: string | undefined;
		'aria-describedby': string | undefined;
		'aria-invalid': boolean | undefined;
		'aria-required': boolean | undefined;
		disabled: boolean;
	}

	let { children }: { children: Snippet<[ControlProps]> } = $props();

	const field = useField();
	let controlProps = $derived<ControlProps>({
		id: field?.controlId,
		'aria-describedby': describedBy(field),
		'aria-invalid': field?.invalid || undefined,
		'aria-required': field?.required || undefined,
		disabled: field?.disabled ?? false
	});
</script>

{@render children(controlProps)}
