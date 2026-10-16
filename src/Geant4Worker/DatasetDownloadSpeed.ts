export interface SpeedHistoryEntry {
	/** Progress at the last recorded change, as a fraction in the 0..1 range. */
	lastProgressFraction: number;
	/** Epoch timestamp in milliseconds of the last recorded progress change. */
	lastTimestampMs: number;
	/** Smoothed download speed, expressed as progress fraction per second. */
	speedFractionPerSecond: number;
}

export type SpeedHistory = Record<string, SpeedHistoryEntry>;

/** Weight of the newest speed sample- the higher, the faster but jumpier the reaction. */
export const SPEED_SMOOTHING = 0.1;

export function nextSpeedHistoryEntry(
	prev: SpeedHistoryEntry | undefined,
	progressFraction: number,
	timestampMs: number
): SpeedHistoryEntry {
	if (!prev) {
		return {
			lastProgressFraction: progressFraction,
			lastTimestampMs: timestampMs,
			speedFractionPerSecond: 0
		};
	}

	const elapsedSeconds = (timestampMs - prev.lastTimestampMs) / 1000;
	const progressFractionDelta = progressFraction - prev.lastProgressFraction;

	if (progressFractionDelta < 0) {
		return { ...prev, lastProgressFraction: progressFraction, lastTimestampMs: timestampMs };
	}

	if (progressFractionDelta === 0 || elapsedSeconds <= 0) {
		return prev;
	}

	const instantSpeedFractionPerSecond = progressFractionDelta / elapsedSeconds;
	const speedFractionPerSecond =
		prev.speedFractionPerSecond === 0
			? instantSpeedFractionPerSecond
			: prev.speedFractionPerSecond * (1 - SPEED_SMOOTHING) +
				instantSpeedFractionPerSecond * SPEED_SMOOTHING;

	return {
		lastProgressFraction: progressFraction,
		lastTimestampMs: timestampMs,
		speedFractionPerSecond
	};
}

export function estimateSecondsRemaining(
	entry: SpeedHistoryEntry,
	progressFraction: number,
	timestampMs: number
): number | undefined {
	const remainingFraction = 1 - progressFraction;

	if (entry.speedFractionPerSecond <= 0 || remainingFraction <= 0) {
		return undefined;
	}

	const stalledSeconds = Math.max(0, (timestampMs - entry.lastTimestampMs) / 1000);

	return remainingFraction / entry.speedFractionPerSecond + stalledSeconds;
}
