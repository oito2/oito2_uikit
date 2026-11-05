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

/** How an `AnimatedIcon` plays: once when shown or changed, over and over, or not at all (the final frame). */
export type AnimationMode = 'once' | 'repeat' | 'still';

/** An SVG element of an animated icon frame, with its attributes and children. */
export interface IconShape {
	/** The SVG element. */
	readonly tag: 'path' | 'circle' | 'rect' | 'g' | 'mask' | 'clipPath';
	/** The attributes of the element. */
	readonly attributes: Readonly<Record<string, string | number>>;
	/** The child elements of a group, mask or clip path. */
	readonly children?: readonly IconShape[];
}

/**
 * The drawing and timing of an animated icon, such as `animatedIcons.ok`.
 *
 * `frame` returns the SVG elements of the frame at `progress`, from 0 to 1, on a 24 × 24
 * grid in `currentColor`; `id` is unique to the icon instance and prefixes the ids of the
 * masks and clip paths the frame defines.
 */
export interface AnimatedIconData {
	/** Returns the SVG elements of the frame at `progress`. */
	readonly frame: (progress: number, id: string) => readonly IconShape[];
	/** The length of one play in milliseconds. */
	readonly duration: number;
}

/** Returns a cubic Bézier easing with control points (x1, y1) and (x2, y2), like CSS `cubic-bezier()`. */
function cubic(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const at = (a: number, b: number, s: number) =>
		3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3;
	return (t) => {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
		let low = 0;
		let high = 1;
		for (let i = 0; i < 32; i++) {
			const mid = (low + high) / 2;
			if (at(x1, x2, mid) < t) low = mid;
			else high = mid;
		}
		return at(y1, y2, (low + high) / 2);
	};
}

const easeOut = cubic(0, 0, 0.58, 1);
const easeOutBack = cubic(0.175, 0.885, 0.32, 1.275);

/** Returns how far `t` has gone through the part of the animation from `start` to `end`, from 0 to 1. */
function phase(t: number, start: number, end: number): number {
	return Math.min(1, Math.max(0, (t - start) / (end - start)));
}

/** Formats `n` with at most three decimals. */
const f = (n: number) => String(Math.round(n * 1000) / 1000);

type Attributes = Record<string, string | number>;

/**
 * Returns a 2-unit round stroke along `d` in `color`; with `fraction` below 1 only that
 * first part of it, by length, and nothing at 0.
 */
function stroke(
	d: string,
	fraction = 1,
	extra: Attributes = {},
	color = 'currentColor'
): IconShape[] {
	if (fraction <= 0) return [];
	const dash: Attributes =
		fraction < 1 ? { pathLength: 1, 'stroke-dasharray': `${f(fraction)} 2` } : {};
	return [
		{
			tag: 'path',
			attributes: {
				d,
				fill: 'none',
				stroke: color,
				'stroke-width': 2,
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				...dash,
				...extra
			}
		}
	];
}

/** Returns a filled path. */
function fill(d: string, extra: Attributes = {}, color = 'currentColor'): IconShape {
	return { tag: 'path', attributes: { d, fill: color, ...extra } };
}

/** Returns a group of `children` with `attributes`. */
function group(attributes: Attributes, children: readonly IconShape[]): IconShape {
	return { tag: 'g', attributes, children };
}

/** Returns the transform that scales by `scale` around the grid center. */
function scaleAround(scale: number): string {
	return `translate(12 12) scale(${f(scale)}) translate(-12 -12)`;
}

/** Returns a mask with the id `id` that hides `marks`, drawn in black, from whatever it covers. */
function knockOut(id: string, marks: readonly IconShape[]): IconShape {
	return {
		tag: 'mask',
		attributes: { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 24, height: 24 },
		children: [{ tag: 'rect', attributes: { width: 24, height: 24, fill: 'white' } }, ...marks]
	};
}

/** Returns a clip path with the id `id` of the rectangle `x`, `y`, `width`, `height`. */
function clip(id: string, x: number, y: number, width: number, height: number): IconShape {
	return {
		tag: 'clipPath',
		attributes: { id },
		children: [{ tag: 'rect', attributes: { x, y, width: f(width), height } }]
	};
}

const circle = 'M12 2A10 10 0 1 1 12 22A10 10 0 1 1 12 2Z';
const check = 'M7.5 12.5L10.5 15.5L16.5 9';
const heart =
	'M12 20.5C6 16 2 12.5 2 8.5C2 5.5 4.5 3.5 7.2 3.5C9.2 3.5 10.9 4.6 12 6.3C13.1 4.6 14.8 3.5 16.8 3.5C19.5 3.5 22 5.5 22 8.5C22 12.5 18 16 12 20.5Z';
const star = (() => {
	const points: string[] = [];
	for (let i = 0; i < 10; i++) {
		const radius = i % 2 === 0 ? 10 : 4.4;
		const angle = -Math.PI / 2 + (i * Math.PI) / 5;
		points.push(`${f(12 + radius * Math.cos(angle))} ${f(12.8 + radius * Math.sin(angle))}`);
	}
	return `M${points.join('L')}Z`;
})();
const needle = 'M12 5.5L14.5 12L12 18.5L9.5 12Z';

/**
 * Returns the needle angle, in degrees, of a damped swing at `t`: it starts and ends at 0
 * and stays within 50 degrees, fading as `t` approaches 1.
 */
function swing(t: number): number {
	return (1 - t) * (1 - t) * Math.sin(t * 3.5 * Math.PI) * 50;
}

/**
 * The animated icons of @oito2/ui, drawn on a 24-pixel grid in the stroke style of the
 * Lucide icons. The `Filled` variants cut their inner mark out of the fill, so the
 * background shows through it.
 */
const icons = {
	/** A circle that draws itself, then a check mark. */
	ok: {
		duration: 700,
		frame: (t) => [...stroke(circle, phase(t, 0, 0.6)), ...stroke(check, phase(t, 0.45, 1))]
	},
	/** A filled circle that pops in, then a check mark cut out of it. */
	okFilled: {
		duration: 700,
		frame: (t, id) => {
			const mark = phase(t, 0.4, 1);
			const pop = group({ transform: scaleAround(easeOutBack(phase(t, 0, 0.5))) }, [
				fill(circle)
			]);
			if (mark <= 0) return [pop];
			return [
				knockOut(`${id}-check`, stroke(check, mark, {}, 'black')),
				group({ mask: `url(#${id}-check)` }, [pop])
			];
		}
	},
	/** A heart outline that draws itself, then beats. */
	heart: {
		duration: 700,
		frame: (t) => {
			const beat = 1 + 0.15 * Math.sin(Math.PI * phase(t, 0.7, 1));
			return [group({ transform: scaleAround(beat) }, stroke(heart, phase(t, 0, 0.7)))];
		}
	},
	/** A filled heart that pops in. */
	heartFilled: {
		duration: 700,
		frame: (t) => [group({ transform: scaleAround(easeOutBack(t)) }, [fill(heart)])]
	},
	/** A star outline that draws itself. */
	star: { duration: 700, frame: (t) => stroke(star, t) },
	/** A filled star that spins and pops in. */
	starFilled: {
		duration: 700,
		frame: (t) => {
			const turn = (1 - easeOut(t)) * -72;
			return [
				group({ transform: `rotate(${f(turn)} 12 12.8) ${scaleAround(easeOutBack(t))}` }, [
					fill(star)
				])
			];
		}
	},
	/** A star outline whose left half fills. */
	starHalfFilled: {
		duration: 700,
		frame: (t, id) => [
			clip(`${id}-half`, 0, 0, 12 * easeOut(t), 24),
			...stroke(star),
			fill(star, { 'clip-path': `url(#${id}-half)` })
		]
	},
	/** A compass whose needle, with a filled north half, swings and settles north. */
	compass: {
		duration: 1200,
		frame: (t, id) => [
			clip(`${id}-north`, -12, -12, 48, 24),
			...stroke(circle),
			group({ transform: `rotate(${f(swing(t))} 12 12)` }, [
				...stroke(needle),
				fill(needle, { 'clip-path': `url(#${id}-north)` })
			])
		]
	},
	/** A filled compass whose cut-out needle swings and settles north. */
	compassFilled: {
		duration: 1200,
		frame: (t, id) => [
			knockOut(`${id}-needle`, [
				fill(needle, { transform: `rotate(${f(swing(t))} 12 12)` }, 'black')
			]),
			fill(circle, { mask: `url(#${id}-needle)` })
		]
	},
	/** Wi-Fi waves that appear one by one, then a slash across them. */
	noNetwork: {
		duration: 900,
		frame: (t) => {
			const shapes: IconShape[] = [];
			const dot = phase(t, 0, 0.15);
			if (dot > 0) {
				shapes.push({
					tag: 'circle',
					attributes: { cx: 12, cy: 19, r: 1.2, fill: 'currentColor', opacity: f(dot) }
				});
			}
			for (let i = 0; i < 3; i++) {
				const appear = phase(t, 0.1 + i * 0.15, 0.25 + i * 0.15);
				if (appear === 0) continue;
				const r = 4.5 + i * 4.5;
				const start = (-3 * Math.PI) / 4;
				const end = -Math.PI / 4;
				const d = `M${f(12 + r * Math.cos(start))} ${f(19 + r * Math.sin(start))}A${f(r)} ${f(r)} 0 0 1 ${f(12 + r * Math.cos(end))} ${f(19 + r * Math.sin(end))}`;
				shapes.push(...stroke(d, 1, { opacity: f(appear) }));
			}
			return [...shapes, ...stroke('M3 3L21 21', phase(t, 0.65, 1))];
		}
	}
} as const satisfies Record<string, AnimatedIconData>;

/** The name of an icon of `animatedIcons`. */
export type AnimatedIconName = keyof typeof icons;

/**
 * The animated icons of @oito2/ui, drawn on a 24-pixel grid in the stroke style of the
 * Lucide icons. The `Filled` variants cut their inner mark out of the fill, so the
 * background shows through it.
 */
export const animatedIcons: Readonly<Record<AnimatedIconName, AnimatedIconData>> = icons;
