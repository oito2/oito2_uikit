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
	import { SegmentGroup, Slider, Switch, TextField } from '@oito2/ui';
	import { QrCode, qrErrorLevels, qrModules, type QrErrorLevel } from '@oito2/ui-extras';

	let data = $state('https://github.com/oito2/oito2_uikit');
	let rounded = $state(false);
	let withLogo = $state(false);
	let size = $state(200);
	let errorLevel = $state<QrErrorLevel>('medium');

	const logo =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#3584e4"/><text x="12" y="16.5" font-size="12" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">o2</text></svg>'
		);

	/** Returns the number of modules on each side for `text` at `level`, or `null` when it doesn't fit. */
	function moduleCount(text: string, level: QrErrorLevel): number | null {
		try {
			return qrModules(text, level).moduleCount;
		} catch {
			return null;
		}
	}

	let modules = $derived(moduleCount(data, withLogo ? 'high' : errorLevel));
	const tooLong = 'oito2 '.repeat(800);
</script>

<main class="showcase-page">
	<p>
		<code>QrCode</code> draws the QR code of a text, such as a link, in SVG with the standard quiet
		zone. It picks the smallest version that holds the text, can round the modules and can put a logo
		in the middle.
	</p>

	<section aria-labelledby="qr-code-live">
		<h2 id="qr-code-live">Live</h2>
		<div class="row top">
			<QrCode
				{data}
				{size}
				{rounded}
				{errorLevel}
				centerImage={withLogo ? logo : null}
				label="QR code of the text"
			/>
			<div class="column qr-code-controls">
				<TextField bind:value={data} aria-label="Text or link" placeholder="Text or link" />
				<label class="row">Rounded modules <Switch bind:checked={rounded} /></label>
				<label class="row">Logo in the middle <Switch bind:checked={withLogo} /></label>
				<Slider bind:value={size} min={120} max={320} divisions={10} label="Size" />
				<span class="note">Error correction</span>
				<SegmentGroup.Root
					bind:value={errorLevel}
					aria-label="Error correction"
					disabled={withLogo}
				>
					{#each qrErrorLevels as level (level)}
						<SegmentGroup.Item value={level}>{level}</SegmentGroup.Item>
					{/each}
				</SegmentGroup.Root>
				<p class="note" role="status">
					{modules === null
						? 'The text does not fit.'
						: `${modules} × ${modules} modules, ${size} pixels${withLogo ? ', error level high for the logo' : ''}.`}
				</p>
			</div>
		</div>
	</section>

	<section aria-labelledby="qr-code-levels">
		<h2 id="qr-code-levels">Error correction levels</h2>
		<p>
			A higher level recovers more damaged modules but needs a larger grid for the same text.
		</p>
		<div class="row top">
			{#each qrErrorLevels as level (level)}
				<figure class="column qr-code-figure">
					<QrCode
						data="https://oito2.dev"
						errorLevel={level}
						size={140}
						label="QR code, {level}"
					/>
					<figcaption class="note">{level}</figcaption>
				</figure>
			{/each}
		</div>
	</section>

	<section aria-labelledby="qr-code-colors">
		<h2 id="qr-code-colors">Colors</h2>
		<p>
			Black on white reads everywhere. Custom colors need strong contrast, with the modules
			darker than the background.
		</p>
		<div class="row top">
			<QrCode
				data="oito2"
				color="#1c71d8"
				background="#ffffff"
				rounded
				label="Blue QR code"
			/>
			<QrCode data="oito2" color="#26a269" background="#f6f5f4" label="Green QR code" />
			<QrCode
				data="oito2"
				color="#613583"
				background="#fdf6ff"
				centerImage={logo}
				centerImageFraction={0.3}
				label="Purple QR code with a logo"
			/>
		</div>
	</section>

	<section aria-labelledby="qr-code-error">
		<h2 id="qr-code-error">Text that doesn't fit</h2>
		<p>
			When the text is too long for a QR code, a localized message shows instead, or the
			<code>error</code> snippet.
		</p>
		<div class="row top">
			<QrCode data={tooLong} size={140} />
			<QrCode data={tooLong} size={140}>
				{#snippet error()}
					<span class="qr-code-error"
						>Too long to encode ({tooLong.length} characters)</span
					>
				{/snippet}
			</QrCode>
		</div>
	</section>
</main>

<style>
	.qr-code-controls {
		min-width: 260px;
		max-width: 360px;
	}

	.qr-code-figure {
		justify-items: center;
		margin: 0;
	}

	.qr-code-error {
		display: grid;
		place-items: center;
		width: 140px;
		height: 140px;
		color: var(--oito2-color-error-text);
		text-align: center;
	}
</style>
