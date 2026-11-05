// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/parity/qr.json' with { type: 'json' };
import { CropController, type CropImage } from './crop/crop-controller.svelte.js';
import { qrErrorLevels, qrModules, qrPath, qrQuietZone, type QrModules } from './qr/qr.js';
import { SignatureController } from './signature/signature-controller.svelte.js';

/** Returns the rows of `qr` as strings with 1 for a dark module, like the fixture. */
const rowsOf = (qr: QrModules) =>
	qr.modules.map((row) => row.map((dark) => (dark ? '1' : '0')).join(''));

/** Decodes `qr` from a black-on-white bitmap of its modules with the quiet zone. */
function decode(qr: QrModules): string | undefined {
	const scale = 4;
	const side = (qr.moduleCount + qrQuietZone * 2) * scale;
	const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
	qr.modules.forEach((row, r) =>
		row.forEach((dark, c) => {
			if (!dark) return;
			for (let y = 0; y < scale; y++) {
				for (let x = 0; x < scale; x++) {
					const i =
						(((r + qrQuietZone) * scale + y) * side + (c + qrQuietZone) * scale + x) *
						4;
					pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
				}
			}
		})
	);
	return jsQR(pixels, side, side)?.data;
}

describe('qrModules', () => {
	it('encodes like oito2_ui, except the ECI segment it adds before non-Latin-1 text', () => {
		expect(qrErrorLevels).toEqual(['low', 'medium', 'quartile', 'high']);
		for (const code of fixture.codes) {
			const qr = qrModules(code.data, code.errorLevel as never);
			// oito2_ui marks text with characters above U+00FF as UTF-8 with an ECI segment,
			// which this encoder doesn't write; scanners read the UTF-8 bytes either way.
			const needsEci = [...code.data].some((char) => (char.codePointAt(0) ?? 0) > 0xff);
			if (needsEci) {
				expect(qr.moduleCount, code.data).toBeLessThanOrEqual(code.moduleCount);
			} else {
				expect(qr.moduleCount, `${code.data} ${code.errorLevel}`).toBe(code.moduleCount);
				expect(rowsOf(qr), `${code.data} ${code.errorLevel}`).toEqual(code.rows);
			}
			expect(decode(qr), `${code.data} ${code.errorLevel}`).toBe(code.data);
		}
	});

	it('rejects data that does not fit, as oito2_ui does', () => {
		expect(fixture.tooLong).toBe(true);
		expect(() => qrModules('x'.repeat(3000), 'high')).toThrow(RangeError);
	});

	it('draws the modules with a hole for a center image', () => {
		const qr = qrModules('https://github.com/oito2/oito2_uikit', 'high');
		const squares = (d: string) => d.split('M').length - 1;
		const dark = qr.modules.flat().filter(Boolean).length;
		expect(squares(qrPath(qr))).toBe(dark);
		expect(squares(qrPath(qr, { rounded: true }))).toBe(dark);
		const holed = squares(qrPath(qr, { hole: 0.22 }));
		expect(holed).toBeLessThan(dark);
		expect(holed).toBeGreaterThan(dark * 0.8);
	});
});

describe('SignatureController', () => {
	it('adds, undoes and clears strokes, and keeps them read-only', () => {
		const controller = new SignatureController();
		expect(controller.isEmpty).toBe(true);
		controller.beginStroke({ x: 1, y: 2, width: 2 });
		controller.extendStroke({ x: 5, y: 6, width: 3 });
		controller.addStroke([{ x: 9, y: 9, width: 4 }]);
		controller.addStroke([]);
		expect(controller.strokes).toHaveLength(2);
		expect(Object.isFrozen(controller.strokes[0])).toBe(true);
		controller.undo();
		expect(controller.strokes).toEqual([
			[
				{ x: 1, y: 2, width: 2 },
				{ x: 5, y: 6, width: 3 }
			]
		]);
		controller.clear();
		expect(controller.isEmpty).toBe(true);
		const version = controller.version;
		controller.undo();
		controller.extendStroke({ x: 0, y: 0, width: 1 });
		expect(controller.version).toBe(version);
	});

	it('exports SVG with a path per segment and a dot for a single point', () => {
		const controller = new SignatureController();
		controller.size = { width: 300, height: 180 };
		controller.addStroke([
			{ x: 10, y: 20, width: 2 },
			{ x: 30.25, y: 40, width: 3 }
		]);
		controller.addStroke([{ x: 50, y: 60, width: 4 }]);
		expect(controller.toSvg({ color: '#123456' })).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="300.0" height="180.0" viewBox="0 0 300.0 180.0">' +
				'<g fill="none" stroke="#123456" stroke-linecap="round" stroke-linejoin="round">' +
				'<path d="M10.0 20.0L30.3 40.0" stroke-width="2.5"/>' +
				'<circle cx="50.0" cy="60.0" r="2.0" fill="#123456" stroke="none"/>' +
				'</g></svg>'
		);
	});
});

describe('CropController', () => {
	/** A stand-in for a loaded 400 × 200 image. */
	const image = { width: 400, height: 200 } as unknown as CropImage;

	it('clamps the zoom and keeps the image covering the box', () => {
		const controller = new CropController();
		controller.setImage(image);
		controller.setBoxSize({ width: 100, height: 100 });
		controller.zoom = 0.5;
		expect(controller.zoom).toBe(1);
		controller.zoom = 50;
		expect(controller.zoom).toBe(5);
		controller.zoom = 1;
		// At zoom 1 the 400 × 200 image covers the box at 200 × 100, so it pans 50 sideways.
		controller.panBy(5000, 5000);
		expect(controller.offset).toEqual({ x: 50, y: 0 });
		expect(() => new CropController({ maxZoom: 0.5 })).toThrow(RangeError);
	});

	it('turns the pan with the image, the opposite way when flipped, and resets', () => {
		const controller = new CropController();
		controller.setImage(image);
		controller.setBoxSize({ width: 100, height: 100 });
		controller.zoom = 4;
		controller.panBy(30, 10);
		controller.rotateRight();
		expect(controller.quarterTurns).toBe(1);
		expect(controller.offset).toEqual({ x: -10, y: 30 });
		controller.rotateLeft();
		expect(controller.quarterTurns).toBe(0);
		expect(controller.offset).toEqual({ x: 30, y: 10 });
		controller.flipHorizontally();
		expect(controller.offset).toEqual({ x: -30, y: 10 });
		controller.rotateRight();
		expect(controller.quarterTurns).toBe(3);
		controller.reset();
		expect([controller.zoom, controller.quarterTurns, controller.flipped]).toEqual([
			1,
			0,
			false
		]);
		expect(controller.offset).toEqual({ x: 0, y: 0 });
	});
});
