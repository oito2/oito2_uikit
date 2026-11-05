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
	import { EditableLabel } from '@oito2/ui';

	let name = $state('Quarterly report');
	let renames = $state(0);
	let files = $state(['Budget.ods', 'Notes.txt', 'Photo.jpg']);
	let nickname = $state('');
	let editing = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>EditableLabel</code> is a text label that turns into a field to rename it in place. A double
		click, Enter or F2 starts editing with the text selected. Enter or leaving the field keeps the
		change; Escape restores the text.
	</p>

	<section aria-labelledby="editable-label-basic">
		<h2 id="editable-label-basic">Rename in place</h2>
		<p>
			<code>onSubmit</code> receives the trimmed text when it changed and isn't empty; the
			page then stores it in <code>text</code>. Bind <code>editing</code> to know when the field
			is open.
		</p>
		<div class="row">
			<EditableLabel
				text={name}
				bind:editing
				onSubmit={(next) => {
					name = next;
					renames++;
				}}
			/>
		</div>
		<p class="note">
			Name: {name} · Renamed {renames} times · {editing ? 'Editing' : 'Not editing'}
		</p>
	</section>

	<section aria-labelledby="editable-label-list">
		<h2 id="editable-label-list">In a list</h2>
		<p>Each file name below can be renamed on its own.</p>
		<ul class="files">
			{#each files as file, index (index)}
				<li>
					<EditableLabel
						text={file}
						onSubmit={(next) =>
							(files = files.map((each, at) => (at === index ? next : each)))}
					/>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="editable-label-placeholder">
		<h2 id="editable-label-placeholder">Placeholder</h2>
		<p>
			While <code>text</code> is empty the label shows <code>placeholder</code> in a lighter color.
		</p>
		<div class="row">
			<EditableLabel
				text={nickname}
				placeholder="Add a nickname"
				onSubmit={(next) => (nickname = next)}
			/>
		</div>
	</section>

	<section aria-labelledby="editable-label-read-only">
		<h2 id="editable-label-read-only">Read-only</h2>
		<p>Without <code>onSubmit</code> the label is plain text and can't be edited.</p>
		<div class="row">
			<EditableLabel text="System folder" />
		</div>
	</section>
</main>

<style>
	.files {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
