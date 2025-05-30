import { TaskStatusData } from '../types/ResponseTypes';

/**
 * Validates job data for progress calculation:
 * - simulatedPrimaries: must be a non-negative number (>= 0)
 * - requestedPrimaries: must be a positive number (> 0)
 */
export const isJobDataValid = (status: TaskStatusData): boolean => {
	const { simulatedPrimaries, requestedPrimaries } = status;

	return (
		simulatedPrimaries !== undefined &&
		requestedPrimaries !== undefined &&
		simulatedPrimaries >= 0 &&
		requestedPrimaries > 0
	);
};
