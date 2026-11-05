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
	import { Field, ListCollection, TagsField } from '@oito2/ui';

	const languages = new ListCollection([
		'svelte',
		'rust',
		'typescript',
		'dart',
		'css',
		'go',
		'python',
		'kotlin'
	]);
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let tags = $state<readonly string[]>(['svelte', 'tauri']);
	let recipients = $state<readonly string[]>(['ana@example.com']);
	let keywords = $state<readonly string[]>([]);
	let labels = $state<readonly string[]>(['design', 'review']);
</script>

<main class="showcase-page">
	<p>
		<code>TagsField</code> is a field of tags shown as chips, with a text input after them. Enter
		or a delimiter character adds the typed text as a tag; a pasted list is split on the delimiters.
		Backspace in the empty input moves to the last tag, the arrows move between tags, and Backspace
		or Delete removes the focused one.
	</p>

	<section aria-labelledby="tags-field-suggestions">
		<h2 id="tags-field-suggestions">Suggestions</h2>
		<p>
			With <code>suggestions</code>, matching items not yet added show below the input. With
			<code>clearable</code>, a button at the end removes every tag.
		</p>
		<div class="fields">
			<TagsField
				bind:value={tags}
				label="Languages"
				suggestions={languages}
				placeholder="Add a language"
				clearable
			/>
		</div>
		<p class="note">Tags: {tags.join(', ') || 'none'}</p>
	</section>

	<section aria-labelledby="tags-field-validation">
		<h2 id="tags-field-validation">Validation and limits</h2>
		<p>
			A tag is refused when it is empty, repeated, past <code>maxTags</code> or rejected by
			<code>validator</code>: a typed tag that is refused stays in the input to be fixed. Here
			only email addresses are accepted, up to three, separated by commas, semicolons or
			spaces.
		</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Recipients</Field.Label>
				<TagsField
					bind:value={recipients}
					validator={(tag) => emailPattern.test(tag)}
					delimiters={[',', ';', ' ']}
					maxTags={3}
					placeholder="name@example.com"
				/>
				<Field.Helper>Up to three addresses.</Field.Helper>
			</Field.Root>
		</div>
		<p class="note">{recipients.length} of 3 recipients</p>
	</section>

	<section aria-labelledby="tags-field-options">
		<h2 id="tags-field-options">Duplicates, look and states</h2>
		<p>
			<code>allowDuplicates</code> accepts the same tag twice, <code>variant="subtle"</code> draws
			lighter chips, and a disabled field can't be changed.
		</p>
		<div class="fields">
			<TagsField
				bind:value={keywords}
				allowDuplicates
				label="Keywords, duplicates allowed"
				placeholder="Add a keyword"
			/>
			<TagsField bind:value={labels} variant="subtle" label="Labels" />
			<TagsField value={['archived', 'read-only']} disabled label="Locked labels" />
		</div>
	</section>
</main>

<style>
	.fields {
		display: grid;
		gap: var(--oito2-space-md);
		max-width: 420px;
	}
</style>
