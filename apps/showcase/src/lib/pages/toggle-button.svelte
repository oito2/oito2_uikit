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
	import { resolve } from '$app/paths';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Star from '@lucide/svelte/icons/star';
	import { ToggleButton } from '@oito2/ui';

	let preview = $state(true);
	let favorite = $state(false);
</script>

<main class="showcase-page">
	<p>
		<code>ToggleButton</code> is a row that toggles a setting when clicked anywhere on it: any
		painted <code>control</code> next to a <code>title</code> and an optional
		<code>subtitle</code>, with one focus ring around the whole row. It holds no state: you
		change the setting in <code>onclick</code> and state it with an ARIA attribute such as
		<code>aria-pressed</code>. For the usual controls prefer
		<a href={resolve('/[slug]', { slug: 'check-button' })}>CheckButton</a>,
		<a href={resolve('/[slug]', { slug: 'radio' })}>RadioButton</a> and
		<a href={resolve('/[slug]', { slug: 'switch' })}>SwitchButton</a>, which do this for you.
	</p>

	<section aria-labelledby="toggle-button-custom">
		<h2 id="toggle-button-custom">A custom control</h2>
		<p>The control is drawn only; it must not take focus itself.</p>
		<div class="column">
			<ToggleButton
				title={preview ? 'Preview shown' : 'Preview hidden'}
				subtitle="Control before the text"
				aria-pressed={preview}
				onclick={() => (preview = !preview)}
			>
				{#snippet control()}
					{#if preview}<Eye size={20} aria-hidden="true" />{:else}<EyeOff
							size={20}
							aria-hidden="true"
						/>{/if}
				{/snippet}
			</ToggleButton>
			<ToggleButton
				title="Favorite"
				subtitle="Control after the text"
				controlAtEnd
				aria-pressed={favorite}
				onclick={() => (favorite = !favorite)}
			>
				{#snippet control()}
					<Star
						size={20}
						aria-hidden="true"
						class={favorite ? 'star on' : 'star'}
						fill={favorite ? 'currentColor' : 'none'}
					/>
				{/snippet}
			</ToggleButton>
		</div>
		<p>Preview {preview ? 'shown' : 'hidden'}; {favorite ? 'a favorite' : 'not a favorite'}.</p>
	</section>

	<section aria-labelledby="toggle-button-disabled">
		<h2 id="toggle-button-disabled">Disabled</h2>
		<div class="column">
			<ToggleButton title="Disabled" subtitle="Dims the text" aria-pressed={false} disabled>
				{#snippet control()}<EyeOff size={20} aria-hidden="true" />{/snippet}
			</ToggleButton>
		</div>
	</section>
</main>

<style>
	:global(.star.on) {
		color: var(--oito2-color-primary-text);
	}
</style>
