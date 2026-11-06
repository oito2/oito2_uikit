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

/** Element props, as spread on an element. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any>;

/** Whether `key` names an event handler prop, such as `onclick`. */
const isHandler = (key: string) => /^on[a-z]/.test(key);

/**
 * Merges the props of `a` and `b` for one element. Event handlers of the same name both
 * run, `a`'s first; `b`'s is skipped when `a`'s called `preventDefault()`. `class` and
 * `style` are joined, and so are the ids of `aria-describedby` and `aria-labelledby`.
 * Any other prop of `b` replaces the one of `a`, unless it is `undefined`.
 *
 * Components put the consumer's props first, so a consumer handler can cancel the
 * component's own behavior by calling `preventDefault()`.
 */
export function mergeProps<A extends Props, B extends Props>(a: A, b: B): A & B {
	const merged: Props = { ...a };
	// Symbol keys, such as the attachments of `{@attach}`, are copied from `b` as they are.
	for (const symbol of Object.getOwnPropertySymbols(b)) {
		(merged as Record<symbol, unknown>)[symbol] = (b as Record<symbol, unknown>)[symbol];
	}
	for (const [key, value] of Object.entries(b)) {
		const own = merged[key];
		if (value === undefined) continue;
		if (own === undefined || own === null) merged[key] = value;
		else if (isHandler(key) && typeof own === 'function' && typeof value === 'function') {
			merged[key] = (event: Event, ...rest: unknown[]) => {
				(own as (event: Event, ...rest: unknown[]) => void)(event, ...rest);
				if (!event?.defaultPrevented)
					(value as (event: Event, ...rest: unknown[]) => void)(event, ...rest);
			};
		} else if (key === 'class') merged[key] = [own, value];
		else if (key === 'style') merged[key] = `${String(own)}; ${String(value)}`;
		else if (key === 'aria-describedby' || key === 'aria-labelledby')
			merged[key] = `${String(own)} ${String(value)}`;
		else merged[key] = value;
	}
	return merged as A & B;
}
