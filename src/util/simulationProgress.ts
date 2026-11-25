import { TaskUnknownStatus } from '../types/ResponseTypes';

export type SimulationProgressMetrics = {
	progress: number;
	requestedPrimaries: number;
	simulatedPrimaries: number;
	remainingPrimaries: number;
	etaMilliseconds: number | null;
};

const validNumber = (value: number | undefined): number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

export function calculateSimulationProgress(
	tasks: TaskUnknownStatus[],
	elapsedMilliseconds: number
): SimulationProgressMetrics {
	const requestedPrimaries = tasks.reduce(
		(total, task) => total + validNumber(task.requestedPrimaries),
		0
	);

	const simulatedPrimaries = tasks.reduce(
		(total, task) => total + validNumber(task.simulatedPrimaries),
		0
	);

	const progress =
		requestedPrimaries > 0 ? Math.min(100, (simulatedPrimaries / requestedPrimaries) * 100) : 0;

	const remainingPrimaries = Math.max(0, requestedPrimaries - simulatedPrimaries);

	const etaMilliseconds =
		simulatedPrimaries > 0 && remainingPrimaries > 0 && elapsedMilliseconds > 0
			? (remainingPrimaries * elapsedMilliseconds) / simulatedPrimaries
			: null;

	return {
		progress,
		requestedPrimaries,
		simulatedPrimaries,
		remainingPrimaries,
		etaMilliseconds
	};
}
