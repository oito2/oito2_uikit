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

/** A point of a signature stroke, in the pad's pixels, with the stroke width there. */
export interface SignaturePoint {
	readonly x: number;
	readonly y: number;
	readonly width: number;
}

/** A size in pixels. */
export interface SignatureSize {
	readonly width: number;
	readonly height: number;
}

/** The options of the raster exports of a `SignatureController`. */
export interface SignatureImageOptions {
	/** The ink color, as a CSS color. Defaults to black. */
	color?: string;
	/** The device pixels per pad pixel. Defaults to 2. */
	pixelRatio?: number;
}

/** Formats `n` with one decimal, as the SVG export writes coordinates. */
const n = (value: number) => value.toFixed(1);

/** Escapes `value` for a double-quoted XML attribute. */
const attribute = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

/**
 * Paints `strokes` in `color` on `context`: round dots for single points, and segments whose
 * width moves from one point's width to the next.
 */
export function paintStrokes(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	strokes: readonly (readonly SignaturePoint[])[],
	color: string
): void {
	context.fillStyle = color;
	context.strokeStyle = color;
	context.lineCap = 'round';
	for (const stroke of strokes) {
		const first = stroke[0];
		if (!first) continue;
		if (stroke.length === 1) {
			context.beginPath();
			context.arc(first.x, first.y, first.width / 2, 0, Math.PI * 2);
			context.fill();
			continue;
		}
		for (let i = 1; i < stroke.length; i++) {
			const a = stroke[i - 1] as SignaturePoint;
			const b = stroke[i] as SignaturePoint;
			context.lineWidth = (a.width + b.width) / 2;
			context.beginPath();
			context.moveTo(a.x, a.y);
			context.lineTo(b.x, b.y);
			context.stroke();
		}
	}
}

/**
 * The strokes of a `SignaturePad`, with undo, clear and export.
 *
 * Its state is reactive: reading `strokes` or `isEmpty` in a template or `$derived` updates
 * as the user draws. Positions are in the pad's pixels; `size` is the pad size the strokes
 * were drawn in, which the exports use.
 */
export class SignatureController {
	/** The size of the pad, updated as it lays out; the exports use it. */
	size: SignatureSize = $state({ width: 0, height: 0 });

	readonly #strokes: SignaturePoint[][] = [];
	#version = $state(0);
	/** The frozen copy of the strokes and the version it was made at. */
	#copy: { version: number; strokes: readonly (readonly SignaturePoint[])[] } | null = null;

	/** The strokes, in drawing order, as a frozen copy made once per change. */
	get strokes(): readonly (readonly SignaturePoint[])[] {
		const version = this.#version;
		if (this.#copy?.version !== version)
			this.#copy = {
				version,
				strokes: Object.freeze(this.#strokes.map((stroke) => Object.freeze([...stroke])))
			};
		return this.#copy.strokes;
	}

	/** A number that changes whenever the strokes change, for code that repaints them. */
	get version(): number {
		return this.#version;
	}

	/** Whether nothing has been drawn. */
	get isEmpty(): boolean {
		void this.#version;
		return this.#strokes.length === 0;
	}

	/** Removes the last stroke, if any. */
	undo(): void {
		if (this.#strokes.length === 0) return;
		this.#strokes.pop();
		this.#version++;
	}

	/** Removes every stroke. */
	clear(): void {
		if (this.#strokes.length === 0) return;
		this.#strokes.length = 0;
		this.#version++;
	}

	/** Adds a copy of a whole `stroke`, such as one of a saved signature; an empty one is ignored. */
	addStroke(stroke: readonly SignaturePoint[]): void {
		if (stroke.length === 0) return;
		this.#strokes.push(stroke.map((point) => ({ ...point })));
		this.#version++;
	}

	/** Starts a stroke at `point`, as a pointer touching the pad does. */
	beginStroke(point: SignaturePoint): void {
		this.#strokes.push([{ ...point }]);
		this.#version++;
	}

	/** Appends `point` to the last stroke, if any, as a pointer moving on the pad does. */
	extendStroke(point: SignaturePoint): void {
		const last = this.#strokes.at(-1);
		if (!last) return;
		last.push({ ...point });
		this.#version++;
	}

	/**
	 * Returns the strokes as an SVG document of `size` (the pad size by default), one path
	 * per stroke segment so the width can vary. A single-point stroke becomes a filled
	 * circle. The `color` is escaped, so it can't add markup to the document.
	 */
	toSvg(options: { size?: SignatureSize; color?: string } = {}): string {
		const { width, height } = options.size ?? this.size;
		const color = attribute(options.color ?? '#000000');
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 ${n(width)} ${n(height)}">`;
		svg += `<g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">`;
		for (const stroke of this.#strokes) {
			const first = stroke[0];
			if (!first) continue;
			if (stroke.length === 1) {
				svg += `<circle cx="${n(first.x)}" cy="${n(first.y)}" r="${n(first.width / 2)}" fill="${color}" stroke="none"/>`;
				continue;
			}
			for (let i = 1; i < stroke.length; i++) {
				const a = stroke[i - 1] as SignaturePoint;
				const b = stroke[i] as SignaturePoint;
				svg += `<path d="M${n(a.x)} ${n(a.y)}L${n(b.x)} ${n(b.y)}" stroke-width="${n((a.width + b.width) / 2)}"/>`;
			}
		}
		return `${svg}</g></svg>`;
	}

	/**
	 * Returns a new canvas with the strokes in `color` on a transparent background of the pad
	 * size, at `pixelRatio` device pixels per pad pixel; at least one pixel wide and tall.
	 */
	toCanvas(options: SignatureImageOptions = {}): HTMLCanvasElement {
		const ratio = options.pixelRatio ?? 2;
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.ceil(this.size.width * ratio));
		canvas.height = Math.max(1, Math.ceil(this.size.height * ratio));
		const context = canvas.getContext('2d');
		if (context) {
			context.scale(ratio, ratio);
			paintStrokes(context, this.#strokes, options.color ?? '#000000');
		}
		return canvas;
	}

	/** Returns the strokes as a PNG image, or `null` when the browser can't encode it; see `toCanvas`. */
	toPngBlob(options: SignatureImageOptions = {}): Promise<Blob | null> {
		const canvas = this.toCanvas(options);
		return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
	}
}
