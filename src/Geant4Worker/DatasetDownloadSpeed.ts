export interface SpeedHistoryEntry {
	lastDone: number;
	lastTime: number;
	currentSpeed: number;
}

export type SpeedHistory = Record<string, SpeedHistoryEntry>;

export const SPEED_SMOOTHING = 0.1;

export function nextSpeedHistoryEntry(
	prev: SpeedHistoryEntry | undefined,
	done: number,
	currentTime: number
): SpeedHistoryEntry {
	if (!prev) {
		return { lastDone: done, lastTime: currentTime, currentSpeed: 0 };
	}

	const timeDelta = (currentTime - prev.lastTime) / 1000;
	const progressDelta = done - prev.lastDone;

	if (progressDelta <= 0 || timeDelta <= 0) {
		return { ...prev, lastTime: currentTime };
	}

	const instantSpeed = progressDelta / timeDelta;
	const currentSpeed =
		prev.currentSpeed === 0
			? instantSpeed
			: prev.currentSpeed * (1 - SPEED_SMOOTHING) + instantSpeed * SPEED_SMOOTHING;

	return { lastDone: done, lastTime: currentTime, currentSpeed };
}
