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

/** The options of a `TimerController`. */
export interface TimerControllerOptions {
	/** The length of a countdown in milliseconds; leave it out for a stopwatch. */
	countdown?: number | null;
	/** How often, in milliseconds, the timer ticks while it runs. Defaults to 1000. */
	interval?: number;
	/** Called with `elapsed` on every tick, including the final tick of a countdown. */
	onTick?: (elapsed: number) => void;
	/** Called when a countdown reaches zero, after its final tick. */
	onComplete?: () => void;
	/**
	 * The clock time is measured with, in milliseconds, such as in tests. Defaults to
	 * `performance.now()`, which is monotonic and doesn't jump with the system time.
	 */
	now?: () => number;
}

/**
 * A stopwatch, or a countdown when `countdown` is set, that ticks every `interval` while
 * it runs.
 *
 * Its state is reactive: reading `elapsed`, `remaining`, `isRunning` or `isCompleted` in a
 * template or `$derived` updates on every tick. A countdown stops by itself at zero and
 * calls `onComplete`. Time is measured from the clock, so it stays exact however late the
 * ticks arrive. Call `dispose()` when the timer is no longer used.
 */
export class TimerController {
	/** The length of a countdown in milliseconds, or `null` for a stopwatch. */
	readonly countdown: number | null;
	/** How often, in milliseconds, the timer ticks while it runs. */
	readonly interval: number;

	readonly #onTick: ((elapsed: number) => void) | undefined;
	readonly #onComplete: (() => void) | undefined;
	readonly #now: () => number;
	#startedAt: number | null = $state(null);
	#offset = 0;
	#completed = $state(false);
	#version = $state(0);
	#timer: ReturnType<typeof setInterval> | undefined;
	#completion: ReturnType<typeof setTimeout> | undefined;
	#disposed = false;

	/** Creates a stopped timer at zero. Throws a `RangeError` when `interval` isn't positive. */
	constructor(options: TimerControllerOptions = {}) {
		const interval = options.interval ?? 1000;
		if (!(interval > 0)) throw new RangeError(`interval must be positive: ${interval}`);
		this.countdown = options.countdown ?? null;
		this.interval = interval;
		this.#onTick = options.onTick;
		this.#onComplete = options.onComplete;
		this.#now = options.now ?? (() => performance.now());
	}

	/** The time run so far, not clamped to `countdown`. */
	get #raw(): number {
		const startedAt = this.#startedAt;
		return this.#offset + (startedAt === null ? 0 : this.#now() - startedAt);
	}

	/** The time run so far in milliseconds, up to `countdown`. */
	get elapsed(): number {
		void this.#version;
		const elapsed = this.#raw;
		return this.countdown !== null && elapsed > this.countdown ? this.countdown : elapsed;
	}

	/** The time left of a countdown in milliseconds, or `null` for a stopwatch. */
	get remaining(): number | null {
		return this.countdown === null ? null : this.countdown - this.elapsed;
	}

	/** Whether the timer is running. */
	get isRunning(): boolean {
		return this.#startedAt !== null;
	}

	/** Whether a countdown has reached zero. */
	get isCompleted(): boolean {
		return this.#completed;
	}

	/** Starts or resumes the timer; does nothing while it runs, after a countdown completes (see `restart`) or once disposed. */
	start(): void {
		if (this.#disposed || this.isRunning || this.#completed) return;
		this.#startedAt = this.#now();
		this.#timer = setInterval(() => this.#tick(), this.interval);
		// A countdown also ticks exactly when it reaches zero.
		const left = this.remaining;
		if (left !== null) this.#completion = setTimeout(() => this.#tick(), left);
		this.#version++;
	}

	/** Pauses the timer, keeping the time run so far; does nothing when it isn't running or once disposed. */
	pause(): void {
		if (this.#disposed || !this.isRunning) return;
		this.#offset = this.#raw;
		this.#startedAt = null;
		this.#cancelTimers();
		this.#version++;
	}

	/** Stops the timer and sets it back to zero, clearing `isCompleted`; does nothing once disposed. */
	reset(): void {
		if (this.#disposed) return;
		this.#startedAt = null;
		this.#cancelTimers();
		this.#offset = 0;
		this.#completed = false;
		this.#version++;
	}

	/** Sets the timer back to zero and starts it. */
	restart(): void {
		this.reset();
		this.start();
	}

	/** Stops the timer for good: it no longer ticks, starts, pauses or resets. */
	dispose(): void {
		this.#disposed = true;
		this.#cancelTimers();
	}

	#cancelTimers(): void {
		clearInterval(this.#timer);
		clearTimeout(this.#completion);
		this.#timer = undefined;
		this.#completion = undefined;
	}

	/** Records a tick, and completes a countdown that reached zero. */
	#tick(): void {
		const countdown = this.countdown;
		if (countdown !== null && this.#raw >= countdown) {
			this.#startedAt = null;
			this.#offset = countdown;
			this.#cancelTimers();
			this.#completed = true;
			this.#version++;
			this.#onTick?.(this.elapsed);
			this.#onComplete?.();
			return;
		}
		this.#version++;
		this.#onTick?.(this.elapsed);
	}
}

/**
 * Formats `milliseconds` as `m:ss`, or `h:mm:ss` from an hour, with tenths of a second
 * (truncated) when `tenths` is set. A negative duration gets a leading minus sign.
 */
export function formatDuration(milliseconds: number, options: { tenths?: boolean } = {}): string {
	const negative = milliseconds < 0;
	const total = Math.trunc(Math.abs(milliseconds));
	const two = (n: number) => String(n).padStart(2, '0');
	const hours = Math.floor(total / 3_600_000);
	const minutes = Math.floor(total / 60_000) % 60;
	const seconds = Math.floor(total / 1000) % 60;
	const base =
		hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${minutes}:${two(seconds)}`;
	const fraction = options.tenths ? `.${Math.floor((total % 1000) / 100)}` : '';
	return `${negative ? '-' : ''}${base}${fraction}`;
}
