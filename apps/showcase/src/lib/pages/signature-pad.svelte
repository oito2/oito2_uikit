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
	import { Button, Slider } from '@oito2/ui';
	import { SignatureController, SignaturePad, type SignaturePoint } from '@oito2/ui-extras';

	const signature = new SignatureController();
	let png = $state('');
	let svg = $state('');

	const ink = new SignatureController();
	const inks = [
		{ name: 'Text color', value: undefined },
		{ name: 'Blue', value: '#1c71d8' },
		{ name: 'Red', value: '#c01c28' }
	];
	let inkIndex = $state(1);
	let widths = $state<[number, number]>([1.2, 3.6]);

	const external = new SignatureController();

	/** Exports the signature as a PNG data URL. */
	function exportPng() {
		png = signature.toCanvas({ color: '#000000' }).toDataURL('image/png');
	}

	/** Exports the signature as an SVG document in a data URL. */
	function exportSvg() {
		svg =
			'data:image/svg+xml;utf8,' + encodeURIComponent(signature.toSvg({ color: '#000000' }));
	}

	/** Adds a wavy stroke across the pad, as a saved signature would. */
	function addSaved() {
		const { width, height } = external.size;
		const stroke: SignaturePoint[] = [];
		for (let i = 0; i <= 60; i++) {
			const t = i / 60;
			stroke.push({
				x: width * (0.1 + 0.8 * t),
				y: height * (0.5 + 0.2 * Math.sin(t * Math.PI * 4)),
				width: 1.5 + Math.abs(Math.cos(t * Math.PI * 4))
			});
		}
		external.addStroke(stroke);
	}
</script>

<main class="showcase-page">
	<p>
		<code>SignaturePad</code> is an area to sign with a mouse, finger or pen. Strokes get
		thinner as the pointer moves faster, like ink, and a pen's pressure makes them wider. A
		<code>SignatureController</code> holds the strokes, undoes and clears them, and exports them as
		PNG or SVG.
	</p>

	<section aria-labelledby="signature-pad-sign">
		<h2 id="signature-pad-sign">Signing and exporting</h2>
		<p>Sign in the box; the undo and clear buttons sit in its corner.</p>
		<div class="signature-pad-box">
			<SignaturePad controller={signature} />
		</div>
		<p class="note" role="status">
			{signature.isEmpty
				? 'The pad is empty.'
				: `${signature.strokes.length} strokes on a ${Math.round(signature.size.width)} × ${signature.size.height} pad.`}
		</p>
		<div class="row">
			<Button variant="tonal" disabled={signature.isEmpty} onclick={exportPng}
				>Export PNG</Button
			>
			<Button variant="tonal" disabled={signature.isEmpty} onclick={exportSvg}
				>Export SVG</Button
			>
		</div>
		<div class="row top">
			{#if png}<img
					class="signature-pad-export"
					src={png}
					alt="Signature exported as PNG"
				/>{/if}
			{#if svg}<img
					class="signature-pad-export"
					src={svg}
					alt="Signature exported as SVG"
				/>{/if}
		</div>
	</section>

	<section aria-labelledby="signature-pad-ink">
		<h2 id="signature-pad-ink">Ink and stroke width</h2>
		<p>
			<code>color</code> sets the ink, which defaults to the text color; <code>minWidth</code>
			and <code>maxWidth</code> bound the stroke width.
		</p>
		<div class="row">
			{#each inks as option, index (option.name)}
				<Button
					variant={inkIndex === index ? 'filled' : 'outlined'}
					aria-pressed={inkIndex === index}
					onclick={() => (inkIndex = index)}>{option.name}</Button
				>
			{/each}
		</div>
		<div class="signature-pad-slider">
			<Slider
				bind:value={widths}
				min={0.5}
				max={8}
				divisions={15}
				label="Stroke width"
				thumbLabels={['Thinnest stroke', 'Thickest stroke']}
			/>
		</div>
		<div class="signature-pad-box">
			<SignaturePad
				controller={ink}
				color={inks[inkIndex]?.value}
				minWidth={widths[0]}
				maxWidth={widths[1]}
				height={140}
				placeholder="Try the ink here"
				label="Ink sample"
			/>
		</div>
	</section>

	<section aria-labelledby="signature-pad-external">
		<h2 id="signature-pad-external">Your own controls</h2>
		<p>
			With <code>showActions</code> off, the app drives the controller: here it also adds a
			saved stroke with <code>addStroke</code>.
		</p>
		<div class="signature-pad-box">
			<SignaturePad
				controller={external}
				showActions={false}
				height={140}
				label="Signature"
			/>
		</div>
		<div class="row">
			<Button variant="outlined" onclick={addSaved}>Add a saved stroke</Button>
			<Button variant="outlined" disabled={external.isEmpty} onclick={() => external.undo()}
				>Undo</Button
			>
			<Button variant="outlined" disabled={external.isEmpty} onclick={() => external.clear()}
				>Clear</Button
			>
		</div>
	</section>
</main>

<style>
	.signature-pad-box {
		max-width: 520px;
	}

	.signature-pad-slider {
		max-width: 320px;
	}

	.signature-pad-export {
		max-width: 240px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
		background: #ffffff;
	}
</style>
