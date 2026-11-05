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

<script lang="ts">
	import { CheckButton, type CheckedState } from '@oito2/ui';

	let terms = $state<CheckedState>(false);
	let sync = $state<CheckedState>('mixed');
</script>

<main class="showcase-page">
	<p>
		<code>CheckButton</code> is a check box with a title and an optional subtitle. A click
		anywhere on the row toggles it, and one focus ring surrounds the whole row. Use
		<code>CheckboxListTile</code> for rows of a list.
	</p>

	<section aria-labelledby="check-button-states">
		<h2 id="check-button-states">States</h2>
		<div class="column">
			<CheckButton title="Unchecked" />
			<CheckButton title="Checked" defaultChecked />
			<CheckButton title="Mixed" defaultChecked="mixed" tristate />
			<CheckButton title="Disabled" disabled />
			<CheckButton title="Disabled and checked" disabled defaultChecked />
		</div>
	</section>

	<section aria-labelledby="check-button-subtitle">
		<h2 id="check-button-subtitle">With a subtitle</h2>
		<div class="column">
			<CheckButton
				title="Accept the terms"
				subtitle="Required to create the account"
				bind:checked={terms}
			/>
			<CheckButton title="Send me the newsletter" subtitle="About once a month" />
		</div>
		<p>Terms accepted: {terms === true ? 'yes' : 'no'}.</p>
	</section>

	<section aria-labelledby="check-button-tristate">
		<h2 id="check-button-tristate">Three states</h2>
		<p>With <code>tristate</code> a click cycles through checked, unchecked and mixed.</p>
		<div class="column">
			<CheckButton
				title="Sync folders"
				subtitle="Mixed while only some folders sync"
				tristate
				bind:checked={sync}
			/>
		</div>
		<p>State: {sync === 'mixed' ? 'mixed' : sync ? 'checked' : 'unchecked'}.</p>
	</section>
</main>
