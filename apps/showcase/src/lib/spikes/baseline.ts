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

/** Result of one platform feature check. */
export interface FeatureCheck {
	group: 'css' | 'dom' | 'js' | 'font';
	name: string;
	supported: boolean;
	detail?: string;
}

// Inserts a stylesheet and reports whether the probe element picked up the expected value.
function cssRuleApplies(rule: string, property: string, expected: string): boolean {
	const style = document.createElement('style');
	style.textContent = rule;
	const probe = document.createElement('div');
	probe.className = 'oito2-probe';
	probe.innerHTML = '<span class="oito2-probe-child"></span>';
	document.head.append(style);
	document.body.append(probe);
	const child = probe.firstElementChild as HTMLElement;
	const applied = getComputedStyle(child).getPropertyValue(property).trim() === expected;
	probe.remove();
	style.remove();
	return applied;
}

const sample = 'Hamburgefonstiv 0123456789';

// Loads the requested face and returns the rendered width of the sample text.
async function textWidth(font: string): Promise<number> {
	await document.fonts.load(font, sample);
	const span = document.createElement('span');
	span.style.font = font;
	span.style.position = 'absolute';
	span.style.whiteSpace = 'nowrap';
	span.textContent = sample;
	document.body.append(span);
	const { width } = span.getBoundingClientRect();
	span.remove();
	return width;
}

/** Checks the CSS, DOM and JavaScript features the component library relies on. */
export async function runBaseline(): Promise<FeatureCheck[]> {
	const css = (name: string, declaration: string): FeatureCheck => ({
		group: 'css',
		name,
		supported: CSS.supports(declaration)
	});
	const checks: FeatureCheck[] = [
		css('color-mix()', 'color: color-mix(in srgb, red 50%, blue)'),
		css('oklch()', 'color: oklch(70% 0.1 200)'),
		css('relative color syntax', 'color: rgb(from red r g b / 50%)'),
		css('light-dark()', 'color: light-dark(white, black)'),
		css('container queries', 'container-type: inline-size'),
		{ group: 'css', name: ':has()', supported: CSS.supports('selector(:has(a))') },
		{
			group: 'css',
			name: ':focus-visible',
			supported: CSS.supports('selector(:focus-visible)')
		},
		{
			group: 'css',
			name: '@layer',
			supported: cssRuleApplies('@layer a { .oito2-probe-child { order: 3; } }', 'order', '3')
		},
		{
			group: 'css',
			name: 'CSS nesting',
			supported: cssRuleApplies(
				'.oito2-probe { & .oito2-probe-child { order: 4; } }',
				'order',
				'4'
			)
		},
		{
			group: 'css',
			name: '@property',
			supported: typeof CSS.registerProperty === 'function'
		},
		css('subgrid', 'grid-template-columns: subgrid'),
		css('text-wrap: balance', 'text-wrap: balance'),
		css('scrollbar-gutter', 'scrollbar-gutter: stable'),
		css('scrollbar-color', 'scrollbar-color: red blue'),
		css('field-sizing', 'field-sizing: content'),
		css('anchor positioning', 'anchor-name: --oito2'),
		css('scroll-driven animations', 'animation-timeline: scroll()'),
		css('font-variation-settings', 'font-variation-settings: "wght" 500'),
		{
			group: 'css',
			name: '@starting-style',
			supported:
				typeof (window as { CSSStartingStyleRule?: unknown }).CSSStartingStyleRule !==
				'undefined'
		},
		{ group: 'dom', name: '<dialog>', supported: typeof HTMLDialogElement === 'function' },
		{ group: 'dom', name: 'inert', supported: 'inert' in HTMLElement.prototype },
		{ group: 'dom', name: 'Popover API', supported: 'showPopover' in HTMLElement.prototype },
		{
			group: 'dom',
			name: 'View Transitions',
			supported: 'startViewTransition' in document
		},
		{
			group: 'dom',
			name: 'PointerEvent.pressure',
			supported: typeof PointerEvent === 'function' && 'pressure' in PointerEvent.prototype
		},
		{ group: 'dom', name: 'ResizeObserver', supported: typeof ResizeObserver === 'function' },
		{
			group: 'dom',
			name: 'IntersectionObserver',
			supported: typeof IntersectionObserver === 'function'
		},
		{
			group: 'dom',
			name: 'Clipboard API (writeText)',
			supported: typeof navigator.clipboard?.writeText === 'function'
		},
		{
			group: 'dom',
			name: 'prefers-contrast media query',
			supported: matchMedia('(prefers-contrast: more)').media !== 'not all'
		},
		{
			group: 'dom',
			name: 'prefers-reduced-motion media query',
			supported: matchMedia('(prefers-reduced-motion: reduce)').media !== 'not all'
		},
		{ group: 'js', name: 'Intl.Segmenter', supported: typeof Intl.Segmenter === 'function' },
		{
			group: 'js',
			name: 'Intl.RelativeTimeFormat',
			supported: typeof Intl.RelativeTimeFormat === 'function'
		},
		{
			group: 'js',
			name: 'Intl.PluralRules',
			supported: typeof Intl.PluralRules === 'function'
		},
		{ group: 'js', name: 'structuredClone', supported: typeof structuredClone === 'function' },
		{ group: 'js', name: 'Array.prototype.toSorted', supported: 'toSorted' in Array.prototype },
		{ group: 'js', name: 'Promise.withResolvers', supported: 'withResolvers' in Promise },
		{ group: 'js', name: 'Set.prototype.union', supported: 'union' in Set.prototype }
	];

	const weights = [400, 500, 600, 700];
	const interWidths: number[] = [];
	for (const weight of weights)
		interWidths.push(await textWidth(`${weight} 32px Inter, monospace`));
	const fallbackWidth = await textWidth('400 32px monospace');
	checks.push({
		group: 'font',
		name: 'Inter loaded',
		supported:
			document.fonts.check('400 16px Inter', sample) &&
			Math.abs((interWidths[0] ?? 0) - fallbackWidth) > 1
	});
	checks.push({
		group: 'font',
		name: 'Inter wght axis follows font-weight',
		supported: interWidths.every((width, i) => i === 0 || width > (interWidths[i - 1] ?? 0)),
		detail: weights.map((w, i) => `${w}: ${interWidths[i]?.toFixed(1)}px`).join(', ')
	});
	const monoRegular = await textWidth("400 32px 'JetBrains Mono', serif");
	const monoBold = await textWidth("700 32px 'JetBrains Mono', serif");
	checks.push({
		group: 'font',
		name: 'JetBrains Mono loaded, fixed advance across weights',
		supported:
			document.fonts.check("400 16px 'JetBrains Mono'", sample) &&
			Math.abs(monoRegular - monoBold) < 0.5,
		detail: `400: ${monoRegular.toFixed(1)}px, 700: ${monoBold.toFixed(1)}px`
	});
	return checks;
}
