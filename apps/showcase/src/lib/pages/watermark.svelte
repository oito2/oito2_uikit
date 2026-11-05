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
	import Image from '@lucide/svelte/icons/image';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Shield from '@lucide/svelte/icons/shield';
	import { Button, Watermark } from '@oito2/ui';

	const alignments = ['start', 'center', 'end'] as const;
	const opacities = [0.05, 0.1, 0.25];
</script>

<main class="showcase-page">
	<p>
		A watermark places faint decorative content, such as a large icon, behind the content. It is
		hidden from assistive technologies, ignores the pointer and covers the area the content
		takes, so give the element a size to watermark a whole page.
	</p>

	<section aria-labelledby="watermark-empty">
		<h2 id="watermark-empty">An empty page</h2>
		<Watermark alignX="center" class="watermark-page">
			{#snippet watermark()}<Inbox size={160} />{/snippet}
			<div class="empty">
				<strong>Your inbox is empty</strong>
				<span>New messages show up here.</span>
				<Button variant="tonal">Refresh</Button>
			</div>
		</Watermark>
	</section>

	<section aria-labelledby="watermark-alignment">
		<h2 id="watermark-alignment">Alignment</h2>
		<p>
			<code>alignX</code> follows the text direction; <code>alignY</code> places it vertically.
		</p>
		<div class="grid">
			{#each alignments as alignY (alignY)}
				{#each alignments as alignX (alignX)}
					<Watermark {alignX} {alignY} opacity={0.2} class="watermark-box">
						{#snippet watermark()}<Shield size={56} />{/snippet}
						<span class="label">{alignX} / {alignY}</span>
					</Watermark>
				{/each}
			{/each}
		</div>
	</section>

	<section aria-labelledby="watermark-opacity">
		<h2 id="watermark-opacity">Opacity</h2>
		<div class="grid">
			{#each opacities as opacity (opacity)}
				<Watermark {opacity} class="watermark-box">
					{#snippet watermark()}<Image size={72} />{/snippet}
					<span class="label">{opacity * 100}%</span>
				</Watermark>
			{/each}
		</div>
	</section>
</main>

<style>
	.showcase-page :global(.watermark-page) {
		min-height: 260px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.showcase-page :global(.watermark-box) {
		min-height: 120px;
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-medium);
	}

	.empty {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: var(--oito2-space-sm);
		min-height: 260px;
		padding: var(--oito2-space-lg);
		text-align: center;
	}

	.empty strong {
		font: var(--oito2-type-title-medium);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--oito2-space-md);
	}

	.label {
		display: block;
		padding: var(--oito2-space-sm);
	}
</style>
